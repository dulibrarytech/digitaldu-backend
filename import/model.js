'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    es = require('elasticsearch'),
    shell = require('shelljs'),
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

                var ignore = ['.svn', '.git', '.DS_Store', 'thumbs.db'];

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

        var coduObj = {},
            ignore = ['.svn', '.git', '.DS_Store', 'thumbs.db'];

        if (ignore.indexOf(file) === -1) {

            console.log(file);

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

exports.import_admin_objects = function (req, callback) {

    console.log('importing...');

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

        var coduObj = {},
            ignore = ['.svn', '.git', '.DS_Store', 'Thumbs.db'];

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

    // TODO: separate xml from objects here


    callback({
        status: 201,
        content_type: {'Content-Type': 'application/json'},
        message: 'Object files imported',
        data: files
    });
};