'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    uuid = require('uuid'),
    es = require('elasticsearch'),
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

var client = new es.Client({
    host: config.elasticSearch
    // log: 'trace'
});

exports.get_import_admin_objects = function (req, callback) {

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

// TODO:...
exports.import_admin_objects = function (req, callback) {

    console.log('importing...');

    if (req.body === undefined) {

        callback({
            status: 404,
            content_type: {'Content-Type': 'application/json'},
            message: 'Nothing to see here...',
            data: []
        });
    }

    var collection = req.body.collection,
        mime_type = req.body.mime_type,
        importPath = config.importPath + collection + '/',
        import_id = uuid();

    // TODO: build out import page for specific collection that is being ingested.  User will select object mime-type there.
    // 1.) convert folder name to collection PID ex. codu_22 to codu:22 DONE
    // 2.) save unique file names and collection pid to import_queue
    // 2.) begin processing queue items
    // 3.) select queue item and collection PID (filename) one record
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
    var importData = uniqueFileNames.map(function (data) {  // , index, self
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
        .returning('id')
        .then(function(ids) {
            process_queue(importData);
        })
        .catch(function(error) {
            console.log(error);
        });

    callback({
        status: 201,
        content_type: {'Content-Type': 'application/json'},
        message: 'Object files saved to import queue',
        data: {import_id: import_id}
    });
};

var process_queue = function (data) {

    var timer = setInterval(function () {

        console.log(data[0].import_id);

        knex('tbl_import_queue')
            .select('import_id', 'is_member_of_collection', 'filename', 'mime_type')
            .where({
                import_id: data[0].import_id,
                status: 0
            })
            .then(function (data) {

                // TODO: kill timer
                console.log('processing queue...');
                console.log(data);
            })
            .catch(function (error) {
                // TODO: add error callback
                console.log(error);
            });

    }, 1000);
};