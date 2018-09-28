'use strict';

var fs = require('fs'),
    request = require('request'),
    config = require('../config/config'),
    pid = require('../libs/next-pid'),
    permissions = require('../libs/object-permissions'),
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

exports.get_next_pid = function (req, callback) {

    var namespace = config.namespace;

    knex.transaction(function(trx) {

        return knex('tbl_pid_gen')
            .select('namespace', 'current_pid')
            .where({
                namespace: namespace
            })
            .limit(1)
            .transacting(trx)
            .then(function(data) {

                // increment pid
                var new_id = (parseInt(data[0].current_pid) + 1),
                    new_pid = data[0].namespace + ':' + new_id;

                // update current pid with new pid value
                return knex('tbl_pid_gen')
                    .where({
                        namespace: data[0].namespace
                    })
                    .update({
                        current_pid: new_id
                    })
                    .then(function () {
                        return new_pid;
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(function(pid) {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: {pid: pid},
                message: 'PID retrieved.'
            });
        })
        .catch(function(error) {
            console.error(error);
        });
};

exports.get_objects = function (req, callback) {

    var pid = req.query.pid; // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Objects retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Object retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_admin_objects = function (req, callback) {

    // TODO: implement permission check

    var pid = req.query.pid;
        // user_permissions = JSON.parse(req.headers['x-access-permissions']); // TODO: sanitize

    // var resources = permissions.check_access(user_permissions);
    /*
    var is_admin = resources.indexOf('*');

    if (is_admin !== 1) {

    }
    */

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'is_published', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Collections for administrators'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_admin_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'mods', 'display_record', 'mime_type', 'is_published', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Object retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.save_admin_collection_object = function (req, callback) {

    var data = req.body;

    if (data.is_member_of_collection === undefined || data.is_member_of_collection.length === 0) {

        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            data: [],
            message: 'Missing collection PID.'
        });

        return false;
    }

    pid.get_next_pid(function (pid) {

        construct_mods(data, function (results) {

            // TODO: create display record

            var recordObj = {};

            if (data.object_type !== undefined || data.object_type.length !== 0) {
                recordObj.object_type = data.object_type;
            }

            recordObj.is_member_of_collection = data.is_member_of_collection;
            recordObj.pid = pid;
            recordObj.mods = results.mods;
            recordObj.display_record = results.display_record;

            knex('tbl_objects')
                .insert(recordObj)
                .then(function (data) {
                    callback({
                        status: 201,
                        content_type: {'Content-Type': 'application/json'},
                        data: [{'pid': pid}],
                        message: 'Object created.'
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
        });
    });
};

var construct_mods = function (data, callback) {

    var results = {};
    var mods = '<mods xmlns="http://www.loc.gov/mods/v3" xmlns:mods="http://www.loc.gov/mods/v3" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';

    for (var prop in data) {

        if (prop === 'mods_title') {
            mods += '<titleInfo><title>' + data.mods_title + '</title></titleInfo>';
        }

        if (prop === 'mods_abstract') {
            mods += '<abstract>' + data.mods_abstract + '</abstract>';
        }

        // TODO: more fields for collection mods?
    }

    mods += '</mods>';

    results.display_record = '{"title":["' + data.mods_title + '"],"abstract":"' + data.mods_abstract + '"}';

    var modsTmp = Math.round(new Date().getTime()/1000);
    var file = config.tempPath + modsTmp + '_mods.xml';
    fs.writeFileSync(file, mods);

    if (!fs.existsSync(file)) {
        // TODO: error
        // TODO: log
        return false;
    }

    var validate_xml_command = './libs/xsd-validator/xsdv.sh ./libs/xsd-validator/mods-3-6.xsd.xml ' + file;
    shell.exec(validate_xml_command, function(code, stdout, stderr) {

        // TODO: log
        console.log(stdout);

        if (code !== 0) {
            console.log(stderr);
            // TODO: log
            return false;
        }

        // read file content
        fs.readFile(file, {encoding: 'utf-8'}, function(error, xml) {

            if (error) {
                console.log(error);
                // TODO: log
                return false;
            }

            results.mods = xml;

            fs.unlink(file, function (error) {
                if (error) {
                    console.log(error);
                }
                console.log(file + ' was deleted');
            });

            callback(results);
        });
    });
};

/*
exports.do_search = function (req, callback) {

    var q = req.query.q;

    client.search({
        // from: 0, // search.from,
        // size: 40, // search.size,
        index: Config.elasticSearchIndex,
        q: q
    }).then(function (body) {
        // console.log(body.hits.hits);
        // callback(body.hits.hits);

        callback({
            status: 200,
            data: body.hits.hits,
            message: 'Search Results'
        });

    }, function (error) {
       // callback(error);
    });
};
    */