'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslib = require('../libs/mods/mods_init'),
    archivematica = require('../libs/archivematica'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    request = require('request'),
    // es = require('elasticsearch'),
    // shell = require('shelljs'),
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

    var query = req.query.folder;

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

    var folder = req.body.folder;

    archivematica.start_tranfser(folder, function (results) {

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

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Transfer started.',
                data: results
            });
        });
    });
};

exports.get_transfer_status = function (req, callback) {

    var uuid = req.query.uuid;

    archivematica.get_transfer_status(uuid, function (results) {

        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            message: 'Transfer status retrieved.',
            data: results
        });
    });
};

exports.get_ingest_status = function (req, callback) {

    var uuid = req.query.uuid;

    archivematica.get_ingest_status(uuid, function (results) {

        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            message: 'Ingested status retrieved.',
            data: results
        });
    });
};

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

var get_next_pid = function (namespace, callback) {

    request.post({
        url: config.apiUrl + '/api/admin/v1/repo/pid?namespace=' + namespace
    }, function(error, httpResponse, body){

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

/*
    Import processes
    TODO: get xml from AIP
 */
var process_xml = function (obj) {

    console.log('processing xml...');

    var folder = obj.is_member_of_collection.replace(':', '_'),
        file = config.importPath + folder + '/' + obj.filename + '.xml',
        validate_xml_command = './libs/xsd-validator/xsdv.sh ./libs/xsd-validator/mods-3-6.xsd.xml ' + file;

    // check if object folder exists
    if (!fs.existsSync(file)) {
        // TODO: error
        // TODO: log
        return false;
    }

    console.log('Validating ' + obj.pid + '...');
    shell.exec(validate_xml_command, function(code, stdout, stderr) {

        // TODO: log
        console.log(stdout);

        if (code !== 0) {
            console.log(stderr);
            // TODO: log
            return false;
        }

        // read file content
        fs.readFile(file, {encoding: 'utf-8'}, function(error, mods_original) {

            if (error) {
                console.log(error);
                // TODO: log
                return false;
            }

            var mods = modslib.process_mods(xml);

            // TODO: validate processed mods as well
            // TODO: write new mods to file and validate

            console.log('Saving mods.');
            knex('tbl_objects')
                .where({
                    is_member_of_collection: obj.is_member_of_collection,
                    pid: obj.pid
                })
                .update({
                    mods: mods,
                    mods_original: mods_original,
                    mime_type: obj.mime_type
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
     */
};

// TODO: get from AIP
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

// TODO: get from AIP
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

var create_handle = function (obj) {

    console.log('creating handle...');
    // console.log(obj);
};

// TODO: build out import page for specific collection that is being ingested.  User will select object mime-type there.
// 1.) convert folder name to collection PID ex. codu_22 to codu:22 DONE
// 2.) save unique file names and collection pid to import_queue DONE
// 2.) begin processing queue items DONE
// 3.) select queue item and collection PID (filename) one record DONE
// 4.) match file name with xml file from disk
// 5.) validate xml file
// 6.) generate object PID
// 7.) save xml string, collection PID and object PID to tbl_objects
// 8.) match file name with object file from disk (tiff, pdf, wav, mp3, mp4, mov etc...) this will have been passed in the request from the import script
// 9.) generate file hash and update record in tbl_objects
// 10.) get technical metadata from object (FITS) and update record in tbl_objects (https://projects.iq.harvard.edu/fits/releases)
// FITS command:
// sh libs/fits-1.3.0/fits.sh -i /Users/freyes/Documents/import/codu_102097/D018.01.0006.00033.tif -xc -o /Users/freyes/Documents/import/codu_102097/techmd_102097.xml
// 11.) save fits xml to tbl_objects (update)


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