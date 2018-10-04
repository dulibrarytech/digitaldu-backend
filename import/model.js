'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslib = require('../libs/mods/mods_init'),
    metslib = require('../libs/mets'),
    pids = require('../libs/next-pid'),
    archivematica = require('../libs/archivematica'),
    duracloud = require('../libs/duracloud'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    async = require('async'),
    request = require('request'),
    // es = require('elasticsearch'),
    shell = require('shelljs'),
    ignore = ['.svn', '.git', '.DS_Store', 'Thumbs.db'],
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

    var importObjects = objects.map(function (object) {

        return {
            is_member_of_collection: collection,
            object: object
        };

    });

    var chunkSize = importObjects.length;
    knex.batchInsert('tbl_archivematica_transfer_queue', importObjects, chunkSize)
        .then(function (data) {

            // Start transferring objects
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

                            archivematica.approve_transfer(transferFolder, function (results) {

                                var json = JSON.parse(results),
                                    transfer_uuid = json.uuid;

                                // Update queue status
                                knex('tbl_archivematica_transfer_queue')
                                    .where({
                                        id: object.id,
                                        status: 0
                                    })
                                    .update({
                                        status: 1,
                                        transfer_uuid: transfer_uuid
                                    })
                                    .then(function (data) {
                                        console.log(data);
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                    });
                            });

                        });

                    }, 3000);

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

// TODO: check status in local queue?
exports.get_transfer_status = function (req, callback) {

    var uuid = req.query.uuid,
        folder = req.query.folder;

    archivematica.get_transfer_status(uuid, function (results) {

        // TODO: automate (don't rely on client to initiate)
        if (results.status === 'COMPLETE' && results.sip_uuid !== undefined) {

            console.log(results);

            knex('tbl_archivematica_import_queue')
                .insert({
                    is_member_of_collection: folder.replace('_', ':'),
                    transfer_uuid: results.uuid,
                    sip_uuid: results.sip_uuid
                })
                .then(function (data) {

                    callback({
                        status: 200,
                        content_type: {'Content-Type': 'application/json'},
                        message: 'Transfer complete.',
                        data: results
                    });

                })
                .catch(function (error) {
                    console.log(error);
                    callback({
                        status: 500,
                        content_type: {'Content-Type': 'application/json'},
                        message: 'Database error occurred.'
                    });
                });
        } else {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Transfer status retrieved.',
                data: results
            });
        }

    });
};

exports.get_ingest_status = function (req, callback) {

    var uuid = req.query.uuid,
        folder = req.query.folder;

    archivematica.get_ingest_status(uuid, function (results) {

        if (results.status === 'COMPLETE') {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Ingested complete.',
                data: results
            });

        } else {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Ingested status retrieved.',
                data: results
            });
        }
    });
};

exports.import_dip = function (req, callback) {

    var uuid = req.body.sip_uuid;

    knex('tbl_archivematica_import_queue')
        .select('*')
        .where({
            sip_uuid: uuid,
            status: 0
        })
        .limit(1)
        .then(function (data) {

            duracloud.get_mets(data, function (results) {

                // Extract values from DuraCloud METS.xml file
                var metsResults = metslib.process_mets(results.sip_uuid, data[0].transfer_uuid, data[0].is_member_of_collection, results.mets);
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

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Processing DIP.'
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

                    // TODO: ... do PDFs get jpg thumbnails
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

                    // Get new PID and create DB record
                    pids.get_next_pid(function (pid) {

                        var recordObj = {};
                        recordObj.pid = pid;
                        recordObj.is_member_of_collection = is_member_of_collection;
                        // The xml file name will be overwritten by the object file name
                        recordObj.file_name = file;

                        knex('tbl_objects')
                            .insert(recordObj)
                            .then(function (data) {
                                // Process xml (Extract mods, validate and save to DB)
                                process_xml(recordObj);
                                // Start processing object associated with XML record
                                process_duracloud_queue_objects(sip_uuid, pid, file);
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

var create_handle = function (obj) {
    console.log('creating handle...');
};


// TODO: move to lib
/*
 var get_next_pid = function (namespace, callback) {

 request.post({
 url: config.apiUrl + '/api/admin/v1/repo/pid?namespace=' + namespace
 }, function (error, httpResponse, body) {

 if (error) {
 // TODO: log error and return callback
 console.log(error);
 }

 if (httpResponse.statusCode === 200) {

 var json = JSON.parse(body);
 callback(json.pid);

 } else {
 // TODO: log error and return callback
 }
 });
 };
 */


/*
 exports.get_import_admin_objects = function (req, callback) {

 console.log('test!!');

 var importPath = config.importPath;

 // check if object folder exists
 if (!fs.existsSync(importPath)) {
 callback({
 status: 500,
 content_type: {'Content-Type': 'application/json'},
 message: 'Import path does not exist',
 data: []
 });
 return false;
 }

 var objects = fs.readdirSync(importPath).map(function(object) {

 var stat = fs.statSync(importPath + object),
 coduObj = {};

 // get folders
 if (stat && stat.isDirectory()) {

 // get files
 var files = fs.readdirSync(importPath + object).filter(function(file) {

 if (ignore.indexOf(file) === -1) {
 return file;
 }
 });

 coduObj.object = object;
 coduObj.files = files.length;
 return coduObj;
 }
 });

 // TODO: files cause null value to be added to array and breaks JS view
 if (objects.indexOf(undefined) != -1) {
 var index = objects.indexOf(undefined);
 objects.splice(index, 1);
 }

 callback({
 status: 200,
 content_type: {'Content-Type': 'application/json'},
 message: 'Import objects retrieved',
 data: objects
 });

 };
 */

/*
 exports.get_import_admin_objects_files = function (req, callback) {

 var object = req.query.object,
 importPath = config.importPath + object + '/';

 // check if object folder exists
 if (!fs.existsSync(importPath)) {
 callback({
 status: 404,
 content_type: {'Content-Type': 'application/json'},
 message: 'Import object does not exist',
 data: []
 });

 return false;
 }

 var files = fs.readdirSync(importPath).map(function(file) {

 var coduObj = {};

 if (ignore.indexOf(file) === -1) {

 var stats = fs.statSync(importPath + file),
 ext = path.extname(file),
 bytes = stats.size,
 megabytes = bytes / 1000000.0;

 if (ext === '.xml') {
 coduObj.xmlFile = file;
 coduObj.fileSize = bytes + ' bytes';
 coduObj.mimeType = 'application/xml';
 } else {

 var tmp = shell.exec('file --mime-type ' + importPath + file).stdout,
 mimetype = tmp.split(':');

 coduObj.objectFile = file;
 coduObj.fileSize = megabytes.toFixed(1) + ' MB';
 coduObj.mimeType = mimetype[1].trim();
 }

 return coduObj;
 }
 });

 if (files.indexOf(undefined) != -1) {
 var index = files.indexOf(undefined);
 files.splice(index, 1);
 }

 callback({
 status: 200,
 content_type: {'Content-Type': 'application/json'},
 message: 'Import object files retrieved',
 data: files
 });
 };
 */

/* creates folder on archivematica sftp server
 exports.create_folder = function (req, callback) {

 var folder = req.body.folder;

 archivematica.create_folder(folder, function (results) {

 // TODO: confirm that folder exists

 callback({
 status: 200,
 content_type: {'Content-Type': 'application/json'},
 message: 'folder created'
 });
 })
 };
 */

/*
 exports.upload = function (req, callback) {
 // TODO
 };

 // import helpers
 var process_queue = function (import_id) {

 console.log('processing queue...');

 var timer = setInterval(function () {

 knex('tbl_import_queue')
 .select('import_id', 'is_member_of_collection', 'filename', 'mime_type')
 .where({
 import_id: import_id,
 status: 0
 })
 .limit(1)
 .then(function (data) {

 if (data.length === 0) {
 clearInterval(timer);
 return false;
 }

 // change status to in progress = 1
 knex('tbl_import_queue')
 .where({
 filename: data[0].filename,
 import_id: import_id
 })
 .update({
 status: 1 // change status to 1 (in progress)
 })
 .then(function () {

 // extract namespace from (import) folder ex. codu_1234
 var tmp = data[0].is_member_of_collection.split(':'),
 namespace = tmp[0];

 get_next_pid(namespace, function (pid) {

 var obj = data[0],
 recordObj = {};

 obj.pid = pid;
 recordObj.pid = pid;
 recordObj.is_member_of_collection = data[0].is_member_of_collection;
 recordObj.mime_type = data[0].mime_type;

 knex('tbl_objects')
 .insert(recordObj)
 .then(function () {

 console.log('Repository record created');

 process_xml(obj);
 get_technical_metadata(obj);
 process_file(obj);
 create_file_hash(obj);
 create_handle(obj);

 // TODO: verify completion of import process and update queue here

 })
 .catch(function (error) {
 console.log(error);
 });
 });
 })
 .catch(function (error) {
 console.log(error);
 });

 return null;

 })
 .catch(function (error) {
 // TODO: add error callback
 console.log(error);
 });

 }, 4000);
 };
 */

/*
 var process_file = function (obj) {

 console.log('processing file...');

 // TODO: get file extension based on mime type
 var folder = obj.is_member_of_collection.replace(':', '_'),
 file = config.importPath + folder + '/' + obj.filename + ext;

 // TODO: get file size
 var stats = fs.statSync(file),
 ext = path.extname(file),
 bytes = stats.size,
 megabytes = bytes / 1000000.0;


 //var tmp = shell.exec('file --mime-type ' + importPath + file).stdout,
 //        mimetype = tmp.split(':');

 // TODO: rename file (pid)
 // TODO: move file to permanent storage space

 /*
 import_id: '22037748-17ca-4cfe-a4bd-5e5b93e42a65',
 is_member_of_collection: 'codu:108283',
 filename: 'clarion_v40_i08_19351107',
 mime_type: 'application/pdf',
 pid: 'codu:109225'
 *
 };
 */

// TODO: get from AIP
/*
 var get_technical_metadata = function (obj) {

 console.log('getting technical metadata...');
 // TODO: get correct file extension based on mime-type
 var file = config.importPath + folder + '/' + obj.filename + ext;
 // TODO: place in .env
 var outputPath = '';
 var fits_command = 'sh ./libs/fits-1.3.0/fits.sh -i ' + file + ' -xc -o ' + outputPath + '/techmd_' + obj.pid + '.xml';

 shell.exec(fits_command, function(code, stdout, stderr) {

 if (code !== 0) {
 console.log(stderr);
 // TODO: log
 return false;
 }

 // read file content
 fs.readFile(outputPath + '/techmd_' + obj.pid + '.xml', {encoding: 'utf-8'}, function(error, tech_md) {

 if (error) {
 console.log(error);
 // TODO: log
 return false;
 }

 console.log('Saving technical metadata.');
 knex('tbl_objects')
 .where({
 is_member_of_collection: obj.is_member_of_collection,
 pid: obj.pid
 })
 .update({
 technical_metadata: tech_md
 })
 .then(function (result) {
 console.log('Technical metadata saved. ', result);
 })
 .catch(function (error) {
 console.log(error);
 });
 });
 });
 };
 */

// TODO: get from AIP
/*
 var create_file_hash = function (obj) {

 console.log('creating file hash...');

 // TODO: get file extension based on mime_type
 var folder = obj.is_member_of_collection.replace(':', '_'),
 file = config.importPath + folder + '/' + obj.filename + ext,
 sha1sum = crypto.createHash('sha1'),
 stream = fs.ReadStream(file);

 stream.on('data', function(d) {
 sha1sum.update(d);
 });

 stream.on('end', function() {

 var checksum = sha1sum.digest('hex');

 knex('tbl_objects')
 .where({
 is_member_of_collection: obj.is_member_of_collection,
 pid: obj.pid
 })
 .update({
 checksum: checksum
 })
 .then(function (result) {
 console.log('Hash digest saved. ', result);
 })
 .catch(function (error) {
 console.log(error);
 });
 });
 };
 */



/*
 // import_id = uuid();
 // check if object folder exists
 if (!fs.existsSync(importPath)) {
 callback({
 status: 404,
 content_type: {'Content-Type': 'application/json'},
 message: 'Import object does not exist',
 data: []
 });

 return false;
 }

 var files = fs.readdirSync(importPath).map(function(file) {

 if (ignore.indexOf(file) === -1) {

 var ext = path.extname(file),
 fileName = file.split(ext);

 return fileName[0];
 }
 });

 if (files.indexOf(undefined) != -1) {
 var index = files.indexOf(undefined);
 files.splice(index, 1);
 }

 // remove duplicates
 var uniqueFileNames = files.filter(function (fileName, index, self) {
 return index === self.indexOf(fileName);
 });

 // construct import queue objects
 var importData = uniqueFileNames.map(function (data) {
 var importQueueObj = {};
 importQueueObj.import_id = import_id;
 importQueueObj.is_member_of_collection = collection.replace('_', ':');
 importQueueObj.mime_type = mime_type;
 importQueueObj.filename = data;
 return importQueueObj;
 });

 // save to queue
 var chunkSize = importData.length;
 knex.batchInsert('tbl_import_queue', importData, chunkSize)
 .returning('import_id')
 .then(function() {
 process_queue(importData[0].import_id);
 })
 .catch(function(error) {
 console.log(error);
 });

 callback({
 status: 201,
 content_type: {'Content-Type': 'application/json'},
 message: 'Object files saved to import queue',
 data: {import_id: importData[0].import_id}
 });

 */