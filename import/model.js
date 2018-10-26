'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslib = require('../libs/mods/mods_init'),
    metslib = require('../libs/mets'),
    pids = require('../libs/next-pid'),
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    duracloud = require('../libs/duracloud'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    async = require('async'),
    socketclient = require('socket.io-client')(config.host),
    request = require('request'),
    // es = require('elasticsearch'),
    shell = require('shelljs'),
    // ignore = ['.svn', '.git', '.DS_Store', 'Thumbs.db'],
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

/*
 var client = new es.Client({
 host: config.elasticSearch
 // log: 'trace'
 });
 */

// broadcasts transfer status
socketclient.on('connect', function () {

    var id = setInterval(function() {

        knex('tbl_archivematica_transfer_queue')
            .select('*')
            .where({
                status: 0
            })
            .then(function (data) {

                if (data.length > 0) {
                    socketclient.emit('transfer_status', data);
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }, 1000);
});

// broadcasts ingest status
socketclient.on('connect', function () {

    var id = setInterval(function() {

        knex('tbl_archivematica_import_queue')
            .select('*')
            .where({
                status: 0
            })
            .then(function (data) {

                if (data.length > 0) {
                    socketclient.emit('ingest_status', data);
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }, 1000);
});

/* TODO: rename get_transfers list files under a folder on the archivematica sftp server */
exports.list = function (req, callback) {

    var query = req.query.collection;

    archivematica.list(query, function (results) {

        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            message: 'list',
            data: {list: results}
        });
    });
};

// NOTE: Ingest begins automatically after a successful transfer
// 1.)
exports.start_transfer = function (req, callback) {

    if (req.body === undefined) {

        callback({
            status: 404,
            content_type: {'Content-Type': 'application/json'},
            message: 'Nothing to see here...',
            data: []
        });
    }

    var collection = req.body.collection, // string
        objects = req.body.objects.split(','); // array

    // Create array of objects.  Each object contains the collection PID and object filename
    var importObjects = objects.map(function (object) {

        return {
            is_member_of_collection: collection,
            object: object,
            message: 'STARTING_TRANSFER',
            microservice: 'Starting transfer microservice'
        };

    });

    // Save import objects to transfer queue
    var chunkSize = importObjects.length;
    knex.batchInsert('tbl_archivematica_transfer_queue', importObjects, chunkSize)
        .then(function (data) {

            // Get transfer queue records
            knex('tbl_archivematica_transfer_queue')
                .select('id', 'is_member_of_collection', 'object')
                .where({
                    is_member_of_collection: collection,
                    status: 0
                })
                .then(function (data) {

                    var timer = setInterval(function () {

                        if (data.length === 0) {
                            console.log('Transfers completed.');
                            clearInterval(timer);
                            return false;
                        }

                        var object = data.pop();

                        // Initiate transfers using archivematica api Q3 sec.
                        archivematica.start_tranfser(object, function (results) {

                            var json = JSON.parse(results);
                            var path = json.path;
                            var pathArr = path.split('/');

                            var arr = pathArr.filter(function (result) {
                                if (result.length !== 0) {
                                    return result;
                                }
                            });

                            var transferFolder = arr.pop();

                            // Automatically approve transfer to allow it to proceed
                            archivematica.approve_transfer(transferFolder, function (results) {

                                var json = JSON.parse(results),
                                    transfer_uuid = json.uuid;

                                // Update queue status when the transfer is complete
                                knex('tbl_archivematica_transfer_queue')
                                    .where({
                                        id: object.id,
                                        status: 0
                                    })
                                    .update({
                                        transfer_uuid: transfer_uuid,
                                        message: 'TRANSFER_APPROVED'
                                    })
                                    .then(function (data) {

                                        // Initiate transfer status checks
                                        request.get({
                                            url: config.apiUrl + '/api/admin/v1/import/transfer_status?collection=' + collection
                                        }, function(error, httpResponse, body) {

                                            if (error) {
                                                console.log(error);
                                            }

                                            console.log(body);
                                        });

                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                    });
                            });

                        });

                    }, 5000);

                })
                .catch(function (error) {
                    console.log(error);
                });

            return null;

        })
        .catch(function (error) {
            console.log(error);
        });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Transfer started.',
        data: {collection: collection}
    });
};

// 2.)
exports.get_transfer_status = function (req, callback) {

    var is_member_of_collection = req.query.collection;

    knex('tbl_archivematica_transfer_queue')
        .select('*')
        .where({
            is_member_of_collection: is_member_of_collection,
            status: 0
        })
        .then(function (data) {

            var timer = setInterval(function () {

                data.forEach(function (object) {

                    archivematica.get_transfer_status(object.transfer_uuid, function (results) {

                        var json = JSON.parse(results);

                        if (json.status === 'COMPLETE' && json.sip_uuid !== undefined) {

                            // Flag transfer as COMPLETE in queue
                            knex('tbl_archivematica_transfer_queue')
                                .where({
                                    is_member_of_collection: is_member_of_collection,
                                    transfer_uuid: json.uuid,
                                    status: 0
                                })
                                .update({
                                    message: 'TRANSFER_COMPLETE',
                                    microservice: json.microservice
                                })
                                .then(function (data) {
                                    // console.log(data);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });

                            // Save object information to import queue
                            knex('tbl_archivematica_import_queue')
                                .insert({
                                    is_member_of_collection: object.is_member_of_collection.replace('_', ':'),
                                    transfer_uuid: json.uuid,
                                    sip_uuid: json.sip_uuid,
                                    message: 'STARTING_IMPORT',
                                    microservice: 'Starting ingest microservice'
                                })
                                .then(function (data) {

                                    setTimeout(function () {
                                        // update queue status
                                        knex('tbl_archivematica_transfer_queue')
                                            .where({
                                                is_member_of_collection: is_member_of_collection,
                                                transfer_uuid: json.uuid,
                                                status: 0
                                            })
                                            .update({
                                                status: 1
                                            })
                                            .then(function (data) {
                                                // console.log(data);
                                                console.log('Begin checking ingest status...');

                                                // Initiate ingest status checks
                                                request.get({
                                                    url: config.apiUrl + '/api/admin/v1/import/ingest_status?sip_uuid=' + json.sip_uuid
                                                }, function(error, httpResponse, body) {

                                                    if (error) {
                                                        console.log(error);
                                                    }

                                                    console.log(body);
                                                });

                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });
                                    }, 2000);

                                })
                                .catch(function (error) {
                                    console.log(error);
                                });

                            clearInterval(timer);

                        } else {

                            // Update transfer status
                            knex('tbl_archivematica_transfer_queue')
                                .where({
                                    is_member_of_collection: is_member_of_collection,
                                    transfer_uuid: object.transfer_uuid,
                                    status: 0
                                })
                                .update({
                                    message: json.status,
                                    microservice: json.microservice
                                })
                                .then(function (data) {
                                    // console.log(data);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        }
                    });
                });

            }, 1000);

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });

     callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Updating transfer queue.'
     });
};

// 3.)
exports.get_ingest_status = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    var timer = setInterval(function () {

        archivematica.get_ingest_status(sip_uuid, function (results) {

            var json = JSON.parse(results);

            if (json.status === 'COMPLETE') {

                knex('tbl_archivematica_import_queue')
                    .where({
                        sip_uuid: json.uuid,
                        status: 0
                    })
                    .update({
                        message: 'IMPORT_COMPLETE',
                        microservice: json.microservice
                    })
                    .then(function (data) {

                        setTimeout(function () {
                            // update queue status
                            knex('tbl_archivematica_import_queue')
                                .where({
                                    sip_uuid: json.uuid,
                                    status: 0
                                })
                                .update({
                                    status: 1
                                })
                                .then(function (data) {
                                    // console.log(data);
                                    console.log('Begin DuraCloud import...');

                                    // Initiate duraCloud import
                                    request.get({
                                        url: config.apiUrl + '/api/admin/v1/import/import_dip?sip_uuid=' + json.uuid
                                    }, function(error, httpResponse, body) {

                                        if (error) {
                                            console.log(error);
                                        }

                                        console.log(body);
                                    });

                                })
                                .catch(function (error) {
                                    console.log(error);
                                });

                        }, 2000);

                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                clearInterval(timer);

            } else {

                knex('tbl_archivematica_import_queue')
                    .where({
                        sip_uuid: json.uuid,
                        status: 0
                    })
                    .update({
                        message: json.status,
                        microservice: json.microservice
                    })
                    .then(function (data) {
                        // console.log(data);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        });

    }, 1000);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Import started.'
    });
};

// 4.)
exports.import_dip = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    archivematica.get_dip_path(sip_uuid, function (dip_path) {

        knex('tbl_archivematica_import_queue')
            .select('*')
            .where({
                sip_uuid: sip_uuid,
                status: 1
            })
            .limit(1)
            .then(function (data) {

                data[0].dip_path = dip_path;

                duracloud.get_mets(data, function (results) {

                    // Extract values from DuraCloud METS.xml file
                    var metsResults = metslib.process_mets(results.sip_uuid, data[0].dip_path, data[0].transfer_uuid, data[0].is_member_of_collection, results.mets);

                    // Save to queue
                    var chunkSize = metsResults.length;
                    knex.batchInsert('tbl_duracloud_import_queue', metsResults, chunkSize)
                        .then(function (data) {
                            // Start processing XML
                            process_duracloud_queue_xml(results.sip_uuid);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });

                return null;
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Processing DIP.'
    });
};

// import helpers
var process_duracloud_queue_xml = function (sip_uuid) {

    knex('tbl_duracloud_import_queue')
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'xml',
            status: 0
        })
        .then(function (data) {

            var is_member_of_collection = data[0].is_member_of_collection;
            var timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    // Update queue status
                    knex('tbl_duracloud_import_queue')
                        .where({
                            status: 0,
                            sip_uuid: sip_uuid,
                            type: 'xml'
                        })
                        .update({
                            status: 1
                        })
                        .then(function (data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                    return false;
                }

                var object = data.pop();
                var file = object.file;

                duracloud.get_object(object, function (results) {

                    function get_pid(callback) {
                        pids.get_next_pid(function (pid) {
                            console.log(pid);
                            callback(null, {pid: pid});
                        });
                    }

                    function get_handle(obj, callback) {
                        handles.create_handle(obj.pid, function (handle) {
                            console.log(handle);
                            obj.handle = handle;
                            callback(null, obj);
                        });
                    }

                    async.waterfall([
                        get_pid,
                        get_handle
                    ], function (err, results) {

                        var recordObj = {};
                        recordObj.pid = results.pid;
                        recordObj.handle = results.handle;
                        recordObj.is_member_of_collection = is_member_of_collection;
                        // The xml file name will be overwritten by the object file name
                        recordObj.file_name = file;

                        knex('tbl_objects')
                            .insert(recordObj)
                            .then(function (data) {
                                // Process xml (Extract mods, validate and save to DB)
                                process_xml(recordObj);
                                // Start processing object associated with XML record
                                process_duracloud_queue_objects(sip_uuid, results.pid, file);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });

                    });
                });

            }, 3000);

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });
};

var process_duracloud_queue_objects = function (sip_uuid, pid, file) {

    var tmpArr = file.split('.'),
        file_id;

    tmpArr.pop();
    file_id = tmpArr.join('.');

    // Get associated object
    knex('tbl_duracloud_import_queue')
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            file_id: file_id,
            type: 'object',
            status: 0
        })
        .then(function (data) {

            var timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    // Update queue status
                    knex('tbl_duracloud_import_queue')
                        .where({
                            status: 0,
                            sip_uuid: sip_uuid,
                            file_id: file_id,
                            type: 'object'
                        })
                        .update({
                            status: 1
                        })
                        .then(function (data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                    return false;
                }

                var object = data.pop();

                duracloud.get_object(object, function (results) {

                    var recordObj = {};
                    recordObj.pid = pid;
                    recordObj.sip_uuid = sip_uuid;
                    recordObj.transfer_uuid = object.transfer_uuid;
                    recordObj.file_name = results.file;
                    recordObj.checksum = results.headers['content-md5'];
                    recordObj.file_size = results.headers['content-length'];

                    if (!fs.existsSync('./tmp/' + results.file)) {
                        console.log('File ' + results.file + ' does not exist.');
                        return false;
                    }

                    var tmp = shell.exec('file --mime-type ./tmp/' + results.file).stdout;
                    var mimetypetmp = tmp.split(':');

                    // TODO: ... do PDFs get jpg thumbnails?
                    recordObj.mime_type = mimetypetmp[1].trim();
                    // TODO: confirm that all TNs are .jpg
                    recordObj.thumbnail = object.uuid + '.jpg';

                    knex('tbl_objects')
                        .where({
                            pid: recordObj.pid,
                            object_type: 'object'
                        })
                        .update({
                            sip_uuid: recordObj.sip_uuid,
                            transfer_uuid: recordObj.transfer_uuid,
                            file_name: recordObj.file_name,
                            checksum: recordObj.checksum,
                            file_size: recordObj.file_size,
                            mime_type: recordObj.mime_type,
                            thumbnail: recordObj.thumbnail
                        })
                        .then(function (data) {
                            console.log(data);
                            recordObj = {};
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });

            }, 3000);

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });
};

/*
 Import processes
 */
var process_xml = function (obj) {

    console.log('processing xml...');

    var file = './tmp/' + obj.file_name,
        validate_xml_command = './libs/xsd-validator/xsdv.sh ./libs/xsd-validator/mods-3-6.xsd.xml ' + file;

    // check if object folder exists
    if (!fs.existsSync(file)) {
        // TODO: error
        // TODO: log
        console.log('ERROR: File not found.');
        // return false;
    }

    console.log('Validating ' + obj.pid + '...');
    shell.exec(validate_xml_command, function (code, stdout, stderr) {

        // TODO: log
        // console.log(stdout);

        if (code !== 0) {
            console.log(stderr);
            // TODO: log
            return false;
        }

        // read file content
        fs.readFile(file, {encoding: 'utf-8'}, function (error, mods_original) {

            if (error) {
                console.log(error);
                // TODO: log
                return false;
            }

            var mods = modslib.process_mods(mods_original);

            console.log('Saving mods.');
            knex('tbl_objects')
                .where({
                    pid: obj.pid
                })
                .update({
                    mods: mods,
                    mods_original: mods_original
                })
                .then(function (result) {
                    console.log('MODS saved. ', result);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    });

    return false;
};