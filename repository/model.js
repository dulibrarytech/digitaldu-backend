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
    archivematica = require('../libs/archivematica'),
    logger = require('../libs/log4'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

/**
 * Gets next pid and increments pid value
 * @param req
 * @param callback
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
                let new_id = (parseInt(data[0].current_pid) + 1),
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
                        logger.module().error('ERROR: Unable to get next pid ' + error);
                        throw 'ERROR: Unable to get next pid ' + error;
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
            logger.module().error('ERROR: Unable to get next pid ' + error);
            throw 'ERROR: Unable to get next pid ' + error;
        });
};

/**
 * Gets objects by collection
 * @param req
 * @param callback
 */
exports.get_objects = function (req, callback) {

    // Collection pid
    var pid = req.query.pid; // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'created')
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
            logger.module().error('ERROR: Unable to get next pid ' + error);
            throw 'ERROR: Unable to get next pid ' + error;
        });
};

/**
 * Gets object by pid
 * @param req
 * @param callback
 */
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
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/**
 * Get object by collection (admin dashboard)
 * @param req
 * @param callback
 */
exports.get_admin_objects = function (req, callback) {

    var pid = req.query.pid;

    knex('tbl_objects')
        .select('id', 'is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'is_published', 'created')
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
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/**
 * Gets object (admin dashboard)
 * @param req
 * @param callback
 */
exports.get_admin_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'handle', 'object_type', 'display_record', 'is_published', 'created')
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
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/**
 * Updates collection object
 * @param req
 * @param callback
 */
exports.update_admin_collection_object = function (req, callback) {

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

    var mods = {
        title: data.title,
        abstract: data.abstract
    };

    var obj = {};
        obj.pid = data.pid;
        obj.is_member_of_collection = data.is_member_of_collection;
        obj.object_type = data.object_type;
        obj.handle = data.handle;
        obj.mods = JSON.stringify(mods);

    modslibdisplay.create_display_record(obj, function (display_record) {

        knex('tbl_objects')
            .where({
                is_member_of_collection: data.is_member_of_collection,
                pid: data.pid
            })
            .update({
                mods: JSON.stringify(mods),
                display_record: display_record
            })
            .then(function (data) {
                callback({
                    status: 201,
                    content_type: {'Content-Type': 'application/json'},
                    data: [{'pid': obj.pid}],
                    message: 'Object updated.'
                });
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save collection record ' + error);
                throw 'ERROR: unable to save collection record ' + error;
            });
    });
};

/**
 * Creates repository collection (admin dashboard)
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
            throw 'ERROR: async (save_admin_collection_object)';
        }

        logger.module().info('INFO: collection record saved');

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

/**
 * Downloads AIP from archivematica
 * @param req
 * @param callback
 */
exports.get_object_download = function (req, callback) {

    let pid = req.query.pid;

    knex('tbl_objects')
        .select('sip_uuid')
        .where({
            pid: pid,
            object_type: 'object',
            is_active: 1
        })
        .then(function (data) {

            if (data.length === 0) {

                callback({
                    status: 500,
                    message: 'Unable to download AIP.',
                });
            }

            archivematica.download_aip(data[0].sip_uuid, function (aip) {

                if (aip.error === true) {

                    callback({
                        status: 500,
                        message: 'Unable to download AIP.',
                    });

                    throw aip.error;
                }

                callback({
                    status: 200,
                    content_type: 'application/x-7z-compressed',
                    file: aip
                });
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to get object sip_uuid ' + error);
            let obj = {};
            obj.error = 'ERROR: unable to get object sip_uuid ' + error;
            callback(null, obj);
        });
};