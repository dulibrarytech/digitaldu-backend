/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const config = require('../config/config'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    duracloud = require('../libs/duracloud'),
    modslibdisplay = require('../libs/display-record'),
    metslib = require('../libs/mets'),
    logger = require('../libs/log4'),
    uuid = require('uuid'),
    async = require('async'),
    request = require('request'),
    knex =require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects';

/** TODO: refactor to check null fields
 * Gets incomplete records in repo
 * @param req
 * @param callback
 */
exports.get_import_incomplete = function (req, callback) {

    knex(REPO_OBJECTS)
        .select('id', 'sip_uuid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'checksum', 'created')
        .orWhere('thumbnail', null)
        .orWhere('file_name', null)
        .orWhere('file_size', null)
        .orWhere('checksum', null)
        .orWhere('mods', null)
        .orWhere('display_record', null)
        .orderBy('created', 'desc')
        .then(function (data) {

            callback({
                status: 200,
                message: 'Incomplete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/model module (get_import_incomplete)] unable to get incomplete records ' + error);
            throw 'FATAL: [/import/model module (get_import_incomplete)] unable to get incomplete records ' + error;
        });
};

/**
 * Gets daily completed records list
 * @param req
 * @param callback
 */
exports.get_import_complete = function (req, callback) {

    knex(REPO_OBJECTS)
        .select('id', 'sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'created')
        .whereRaw('DATE(created) = CURRENT_DATE')
        .where({
            is_complete: 1,
            object_type: 'object'
        })
        .then(function (data) {

            callback({
                status: 200,
                message: 'Complete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error);
            throw 'FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error;
        });
};

/**
 * Saves missing mods id to repository record
 * @param req
 * @param callback
 */
exports.import_mods_id = function (req, callback) {

    let sip_uuid = req.body.sip_uuid,
        mods_id = req.body.mods_id;

    if (sip_uuid === undefined || mods_id === undefined) {
        callback({
            status: 400,
            message: 'Bad Request'
        });
    }

    knex(REPO_OBJECTS)
        .where({
            sip_uuid: sip_uuid,
            is_complete: 0
        })
        .update({
            mods_id: mods_id
        })
        .then(function (data) {

            if (data === 0) {

                callback({
                    status: 500,
                    message: 'MODS ID NOT imported.'
                });

                return false;
            }

            callback({
                status: 201,
                message: 'MODS ID imported.'
            });

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/model module (import_mods_id)] unable to save mods id ' + error);
            throw 'FATAL: [/import/model module (import_mods_id)] unable to save mods id ' + error;
        });
};

/**
 * Imports mods record from Archivesspace
 * @param req
 * @param callback
 */
exports.import_mods = function (req, callback) {

    let mods_id = req.body.mods_id,
        sip_uuid = req.body.sip_uuid;

    if (sip_uuid === undefined || mods_id === undefined || mods_id === null) {
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
            } catch (error) {
                logger.module().error('ERROR: [/import/model module (import_mods/archivespace.get_session_token)] session token error ' + error);
                obj.token = null;
                callback(null, obj);
            }
        });
    }

    function get_mods(obj, callback) {

        if (obj.token === null) {
            obj.mods = null;
            callback(null, obj);
            return false;
        }

        archivespace.get_mods(obj.mods_id, obj.token, function (response) {

            if (response.error !== undefined && response.error === true) {
                logger.module().error('ERROR: [/import/model module (import_mods/get_mods/archivespace.get_mods)] unable to get mods ' + response.error_message);
                obj.mods = null;
                callback(null, obj);
                return false;
            }

            delete obj.token;
            obj.mods = response.mods;
            callback(null, obj);
        });
    }

    function create_display_record(obj, callback) {

        if (obj.mods === null) {
            callback(null, obj);
            return false;
        }

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

                let mods = obj.mods,
                    record = {};

                if (data[0].mods_id.length === 0) {
                    record.mods_id = null;
                }

                record.pid = data[0].pid;
                record.is_member_of_collection = data[0].is_member_of_collection;
                record.object_type = data.object_type;
                record.handle = data[0].handle;
                record.mods = mods;

                if (missing.length > 0) {
                    record.missing = missing;
                }

                modslibdisplay.create_display_record(record, function (display_record) {

                    let modsUpdateObj = {};
                        modsUpdateObj.mods = mods;
                        modsUpdateObj.display_record = display_record;

                        if (record.mods_id === null || record.missing !== undefined) {
                            modsUpdateObj.is_complete = 0;
                        } else {
                            modsUpdateObj.is_complete = 1;
                        }

                    knex(REPO_OBJECTS)
                        .where({
                            sip_uuid: obj.sip_uuid
                        })
                        .update(modsUpdateObj)
                        .then(function (data) {
                            return null;
                        })
                        .catch(function (error) {
                            logger.module().fatal('FATAL: [/import/model module (import_mods/create_display_record/modslibdisplay.create_display_record)] unable to save record ' + error);
                            throw 'FATAL: [/import/model module (import_mods/create_display_record/modslibdisplay.create_display_record)] unable to save record ' + error;
                        });
                });

                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/import/model module (import_mods/modslibdisplay.create_display_record)] unable to save record ' + error);
                throw 'FATAL: [/import/model module (import_mods/modslibdisplay.create_display_record)] unable to save record ' + error;
            });
    }

    async.waterfall([
        get_token,
        get_mods,
        create_display_record
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/import/model module (import_mods/async.waterfall)] ' + error);
        }

        if (results.mods === null) {

            callback({
                status: 418,
                message: 'Unable to import MODS.'
            });

            return false;
        }

        logger.module().info('INFO: [/import/model module (import_mods/async.waterfall)] mods imported');

        callback({
            status: 201,
            message: 'MODS imported.'
        });
    });
};

/**
 * Imports missing thumbnail
 * @param req
 * @param callback
 */
exports.import_thumbnail = function (req, callback) {

    let sip_uuid = req.body.sip_uuid;

    archivematica.get_dip_path(sip_uuid, function (dip_path) {

        if (dip_path.error !== undefined && dip_path.error === true) {
            logger.module().fatal('FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path)] dip path error ' + dip_path.error.message);
            throw 'FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path)] dip path error ' + dip_path.error.message;
        }

        let data = {
            sip_uuid: sip_uuid,
            dip_path: dip_path
        };

        duracloud.get_mets(data, function (response) {

            if (response.error !== undefined && response.error === true) {
                logger.module().fatal('FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets');
                throw 'FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets';
            }

            let metsResults = metslib.process_mets(sip_uuid, dip_path, response.mets),
                thumbnail = metsResults[0].dip_path + '/thumbnails/' + metsResults[0].uuid + '.jpg';

            knex(REPO_OBJECTS)
                .select('sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type')
                .where({
                    sip_uuid: sip_uuid
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

                    if (data[0].mods_id.length === 0) {
                        missing.push({
                            message: 'Missing mods id'
                        });
                    }

                    if (data[0].mods.length === 0) {
                        missing.push({
                            message: 'Missing mods record'
                        });
                    }

                    let record = {};
                    record.thumbnail = thumbnail;

                    if (missing.length === 0) {
                        record.is_complete = 1;
                    }

                    knex(REPO_OBJECTS)
                        .where({
                            sip_uuid: sip_uuid
                        })
                        .update(record)
                        .then(function (data) {

                            callback({
                                status: 201,
                                message: 'Thumbnail imported.'
                            });

                            return null;
                        })
                        .catch(function (error) {
                            logger.module().fatal('FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to save record ' + error);
                            throw 'FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to save record ' + error;
                        });

                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to save record ' + error);
                    throw 'FATAL: [/import/model module (import_thumbnail/archivematica.get_dip_path/duracloud.get_mets)] unable to save record ' + error;
                });
        });
    });
};