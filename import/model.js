'use strict';

var fs = require('fs'),
    Config = require('../config/config'),
    es = require('elasticsearch'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.dbHost,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    });

var client = new es.Client({
    host: Config.elasticSearch
    // log: 'trace'
});

exports.get_import_admin_objects = function (req, callback) {

    var importPath = '/Users/freyes/Documents/import/';
    var objects = fs.readdirSync(importPath).map(function(object) {

        var stat = fs.statSync(importPath + object);
        var coduObj = {};

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

    // removes null value
    objects.shift();

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Import objects retrieved',
        data: objects
    });
};

exports.get_import_admin_objects_files = function (req, callback) {

    var object = req.query.object;
    var coduObj = {};
    // TODO: place in .env var
    var importPath = '/Users/freyes/Documents/import/' + object + '/';

    var files = fs.readdirSync(importPath).map(function(file) {


        var ignore = ['.svn', '.git', '.DS_Store', 'thumbs.db'];
        if (ignore.indexOf(file) === -1) {

            console.log(file);

            var stats = fs.statSync(importPath + file);
            var bytes = stats.size;
            console.log(bytes);
            // var megabytes = bytes / 1000000.0;

            // coduObj.file = file;
            // coduObj.fileSize = bytes;
            // return coduObj;
            return file;
        }
    });

    // console.log(files);

    // removes null value
    // objects.shift();

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Import object files retrieved',
        data: files
    });
};