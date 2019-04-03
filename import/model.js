'use strict';

const config = require('../config/config'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    modslibdisplay = require('../libs/display-record'),
    logger = require('../libs/log4'),
    uuid = require('uuid'),
    async = require('async'),
    request = require('request'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    }),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Gets incomplete records in repo
 * @param req
 * @param callback
 */
exports.get_import_incomplete = function (req, callback) {

    knex('tbl_objects')
        .select('id', 'sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'created')
        .where({
            is_complete: 0,
            object_type: 'object'
        })
        .then(function (data) {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Incomplete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });
};

/**
 * Imports mods record from Archivespace
 * @param req
 * @param callback
 */
exports.import_mods = function (req, callback) {

    let mods_id = req.body.mods_id,
        sip_uuid = req.body.sip_uuid;

    if (mods_id === undefined || sip_uuid === undefined) {
        callback({
            status: 400,
            message: 'Bad Request'
        });
    }

    function get_token(callback) {

        let obj = {};
        obj.sip_uuid = sip_uuid;
        obj.mods_id = mods_id;

        archivespace.get_session_token(function (response) {

            let data = response.data,
                token;

            try {
                token = JSON.parse(data);
                obj.token = token.session;
                callback(null, obj);
            } catch (e) {
                logger.module().error('ERROR: session token error ' + e);
                throw e;
            }
        });
    }

    function get_mods(obj, callback) {

        archivespace.get_mods(obj.mods_id, obj.token, function (response) {

            if (response.error !== undefined && response.error === true) {
                logger.module().error('ERROR: unable to get mods ' + response.error_message);
                return false;
            }

            delete obj.token;
            obj.mods = response.mods;
            callback(null, obj);
        });
    }

    function create_display_record(obj, callback) {

        knex(REPO_OBJECTS)
            .select('sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type')
            .where({
                sip_uuid: obj.sip_uuid
            })
            .then(function (data) {

                let missing = [];

                if (data[0].is_member_of_collection.length === 0) {
                    missing.push({
                        message: 'Missing collection PID'
                    });
                }

                if (data[0].pid.length === 0) {
                    missing.push({
                        message: 'Missing object PID'
                    });
                }

                if (data[0].handle.length === 0) {
                    missing.push({
                        message: 'Missing handle'
                    });
                }

                if (data[0].thumbnail.length === 0) {
                    missing.push({
                        message: 'Missing thumbnail'
                    });
                }

                if (data[0].file_name.length === 0) {
                    missing.push({
                        message: 'Missing master object'
                    });
                }

                if (data[0].mime_type.length === 0) {
                    missing.push({
                        message: 'Missing mime type'
                    });
                }

                if (missing.length > 0) {

                    callback({
                        status: 200,
                        content_type: {'Content-Type': 'application/json'},
                        message: 'MODS imported. There are other record components missing.',
                        data: missing
                    });

                    return false;
                }

                let mods = obj.mods,
                    record = {};
                record.pid = data[0].pid;
                record.is_member_of_collection = data[0].is_member_of_collection;
                record.object_type = data.object_type;
                record.handle = data[0].handle;
                record.mods = mods;

                modslibdisplay.create_display_record(record, function (display_record) {

                    knex(REPO_OBJECTS)
                        .where({
                            sip_uuid: obj.sip_uuid
                        })
                        .update({
                            mods: mods,
                            display_record: display_record,
                            is_complete: 1
                        })
                        .then(function (data) {
                            return null;
                        })
                        .catch(function (error) {
                            logger.module().error('ERROR: unable to save record ' + error);
                        });
                });

                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save record ' + error);
            });
    }

    async.waterfall([
        get_token,
        get_mods,
        create_display_record
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: async (import mods)');
        }

        logger.module().info('INFO: mods imported');

        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            message: 'MODS imported.'
        });
    });
};