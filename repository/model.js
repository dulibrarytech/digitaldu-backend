'use strict';

var fs = require('fs'),
    request = require('request'),
    config = require('../config/config'),
    pid = require('../libs/next-pid'),
    permissions = require('../libs/object-permissions'),
    async = require('async'),
    pids = require('../libs/next-pid'),
    handles = require('../libs/handles'),
    modslibdisplay = require('../libs/display-record'),
    logger = require('../libs/log4'),
    es = require('elasticsearch'),
    // shell = require('shelljs'),
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
});
*/

exports.get_next_pid = function (req, callback) {

    var namespace = config.namespace;

    knex.transaction(function (trx) {

        return knex('tbl_pid_gen')
            .select('namespace', 'current_pid')
            .where({
                namespace: namespace
            })
            .limit(1)
            .transacting(trx)
            .then(function (data) {

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
        .then(function (pid) {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: {pid: pid},
                message: 'PID retrieved.'
            });
        })
        .catch(function (error) {
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

/**
 * Creates repository collection
 * @param req
 * @param callback
 * @returns {boolean}
 */
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

    function create_record_object(callback) {

        var obj = {};

        obj.is_member_of_collection = data.is_member_of_collection;

        // TODO: more fields for collection record?
        var modsObj = {
            title: data.mods_title,
            abstract: data.mods_abstract
        };

        obj.mods = JSON.stringify(modsObj);
        obj.object_type = data.object_type;

        callback(null, obj);
    }

    function get_pid(obj, callback) {

        logger.module().info('INFO: getting pid');

        pids.get_next_pid(function (pid) {
            obj.pid = pid;
            callback(null, obj);
        });
    }

    function get_handle(obj, callback) {

        if (obj.pid === null) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

        logger.module().info('INFO: getting handle');

        handles.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                logger.module().error('ERROR: handle error');
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    function create_display_record(obj, callback) {

        modslibdisplay.create_display_record(obj, function (result) {
            obj.display_record = result;
            callback(null, obj);
        });
    }

    function save_record(obj, callback) {

        knex('tbl_objects')
            .insert(obj)
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save collection record ' + error);
                obj.error = 'ERROR: unable to save collection record ' + error;
                callback(null, obj);
            });
    }

    async.waterfall([
        create_record_object,
        get_pid,
        get_handle,
        create_display_record,
        save_record
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: async (save_admin_collection_object)');
        }

        logger.module().info('INFO: collection record saved');
        // console.log('collectionObj: ', results);

        if (results.error === undefined) {

            callback({
                status: 201,
                content_type: {'Content-Type': 'application/json'},
                data: [{'pid': results.pid}],
                message: 'Object created.'
            });

        } else {

            callback({
                status: 500,
                content_type: {'Content-Type': 'application/json'},
                data: [{'pid': 'no pid'}],
                message: 'A database error occurred. ' + error
            });

        }
    });
};
