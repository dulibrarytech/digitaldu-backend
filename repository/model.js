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
    fs = require('fs'),
    request = require('request'),
    async = require('async'),
    uuid = require('node-uuid'),
    validator = require('validator'),
    dom = require('../libs/dom'),
    handles = require('../libs/handles'),
    modslibdisplay = require('../libs/display-record'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    logger = require('../libs/log4'),
    REPO_OBJECTS = 'tbl_objects',
    ARCHIVESSPACE_QUEUE = 'tbl_archivesspace_queue',
    knex = require('../config/db')(),
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    });

/** DEPRECATED.  App is using elasticsearch to render data
 * Get object by collection (admin dashboard)
 * @param req
 * @param callback

exports.get_admin_objects = function (req, callback) {

    let pid = req.query.pid,
        page = req.query.page;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    let total_on_page = 10;

    if (req.query.total_on_page !== undefined) {
        total_on_page = req.query.total_on_page;
    }

    if (page === undefined) {
        page = 0;
    } else {
        page = (page - 1) * total_on_page;
    }

    knex(REPO_OBJECTS)
        .select('id', 'is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'is_published', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
        })
        .limit(total_on_page)
        .offset(page)
        .then(function (data) {
            callback({
                status: 200,
                message: 'Collections for administrators',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/repository/model module (get_admin_objects)] Unable to get objects ' + error);
            throw 'FATAL: [/repository/model module (get_admin_objects)] Unable to get objects ' + error;
        });
};
 */

/**
 * Gets object display record
 * @param req
 * @param callback
 */
exports.get_display_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {
        callback({
            status: 400,
            message: 'Bad request.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('display_record')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function(data) {
            callback({
                status: 200,
                message: 'Object retrieved.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/repository/model module (get_display_record)] Unable to get display record ' + error);
            throw 'FATAL: [/repository/model module (get_display_record)] Unable to get display record ' + error;
        });
};

/**
 * Gets metadata updates from archivesspace update feed
 * @param req
 * @param callback
 */
exports.update_metadata_cron = function (req, callback) {

    function get_session_token(callback) {

        archivespace.get_session_token(function (response) {

            let result = response.data,
                obj = {},
                token;

            try {

                token = JSON.parse(result);

                if (token.session === undefined) {
                    logger.module().error('ERROR: [/repository/model module (update_metadata_cron/get_session_token/archivespace.get_session_token)] session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: [/repository/model module (update_metadata_cron/get_session_token/archivespace.get_session_token)] session token error' + token.error_message);
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                obj.session = token.session;
                callback(null, obj);
                return false;

            } catch (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/get_session_token/archivespace.get_session_token)] session token error ' + error);
                throw 'FATAL: [/repository/model module (update_metadata_cron/get_session_token/archivespace.get_session_token)] session token error ' + error;
            }
        });
    }

    function get_record_updates(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            archivespace.get_record_updates(obj.session, function (records) {

                let data = JSON.parse(records.updates),
                    uriArr = [];

                for (let i = 0; i < data.length; i++) {

                    if (data[i].record.uri === undefined) {
                        continue;
                    }

                    let tmp = data[i].record.uri.split('/'),
                        mods_id = tmp[tmp.length - 1];

                    // collection metadata
                    if (data[i].record.jsonmodel_type === 'resource') {

                        uriArr.push({
                            type: 'collection',
                            mods_id: mods_id,
                            is_updated: 0
                        });
                    }

                    // archival object metadata
                    if (data[i].record.jsonmodel_type === 'archival_object') {

                        uriArr.push({
                            type: 'object',
                            mods_id: mods_id,
                            is_updated: 0
                        });
                    }
                }

                obj.records = uriArr;
                callback(null, obj);
            });

        }, 1000);
    }

    function save_record_updates(obj, callback) {

        knexQ(ARCHIVESSPACE_QUEUE)
            .insert(obj.records)
            .then(function (data) {
                obj.data_saved = true;
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/save_record_updates)] unable to save record updates' + error);
                obj.error = 'ERROR: unable to save record updates' + error;
                callback(null, obj);
            });
    }

    function update_records(obj, callback) {

        if (obj.data_saved !== undefined && obj.data_saved === true) {

            // Get updated record id's from queue
            knexQ(ARCHIVESSPACE_QUEUE)
                .select('*')
                .where({
                    is_updated: 0
                })
                .then(function (data) {

                    let timer = setInterval(function () {

                        if (data.length === 0) {
                            clearInterval(timer);
                            callback(null, obj);
                            return false;
                        } else {

                            let record = data.pop();

                            archivespace.get_mods(record.mods_id, obj.session, function (updated_record) {

                                /*
                                if (validator.isEmpty(record.mods_id)) {
                                    logger.module().fatal('ERROR: [/repository/model module (update_metadata_cron/update_records)] Unable to get record.');
                                    return false;
                                }
                                */

                                // Get existing record from repository
                                knex(REPO_OBJECTS)
                                    .select('*')
                                    .where({
                                        mods_id: record.mods_id,
                                        is_active: 1
                                    })
                                    .then(function (data) {

                                        if (data.length === 0) {
                                            logger.module().info('INFO: [/repository/model module (update_metadata_cron/update_records)] There were no repository records to update');
                                            return false;
                                        }

                                        let recordObj = {};
                                        recordObj.pid = validator.escape(data[0].pid);
                                        recordObj.is_member_of_collection = validator.escape(data[0].is_member_of_collection);
                                        recordObj.object_type = validator.escape(data[0].object_type);
                                        recordObj.sip_uuid = validator.escape(data[0].sip_uuid);
                                        recordObj.handle = validator.escape(data[0].handle);
                                        recordObj.entry_id = validator.escape(data[0].entry_id);
                                        recordObj.thumbnail = validator(data[0].thumbnail);
                                        recordObj.object = validator.escape(data[0].file_name);
                                        recordObj.mime_type = validator.escape(data[0].mime_type);
                                        recordObj.is_published = data[0].is_published;
                                        recordObj.mods = updated_record.mods;

                                        modslibdisplay.create_display_record(recordObj, function (result) {

                                            let tmp = JSON.parse(result);

                                            if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                                                let currentRecord = JSON.parse(data[0].display_record),
                                                    currentCompoundParts = currentRecord.display_record.parts;

                                                delete tmp.display_record.parts;
                                                delete tmp.compound;

                                                if (currentCompoundParts !== undefined) {
                                                    tmp.display_record.parts = currentCompoundParts;
                                                    tmp.compound = currentCompoundParts;
                                                }

                                                obj.display_record = JSON.stringify(tmp);

                                            } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                                                obj.display_record = result;

                                            }

                                            update_mods(record, updated_record, obj, function (result) {

                                                if (result.updates !== true) {
                                                    logger.module().error('ERROR: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to update mods record ' + data[0].mods_id);
                                                } else {

                                                    // update admin index
                                                    request.post({
                                                        url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
                                                        form: {
                                                            'sip_uuid': data[0].sip_uuid
                                                        }
                                                    }, function (error, httpResponse, body) {

                                                        if (error) {
                                                            logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] indexer error ' + error);
                                                            return false;
                                                        }

                                                        if (httpResponse.statusCode === 200) {
                                                            return false;
                                                        } else {
                                                            logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] http error ' + httpResponse.statusCode + '/' + body);
                                                            return false;
                                                        }
                                                    });

                                                    if (recordObj.is_published === 1) {

                                                        // update public index
                                                        request.post({
                                                            url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
                                                            form: {
                                                                'sip_uuid': data[0].sip_uuid,
                                                                'publish': true
                                                            }
                                                        }, function (error, httpResponse, body) {

                                                            if (error) {
                                                                logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] indexer error ' + error);
                                                                return false;
                                                            }

                                                            if (httpResponse.statusCode === 200) {
                                                                return false;
                                                            } else {
                                                                logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] http error ' + httpResponse.statusCode + '/' + body);
                                                                return false;
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        });

                                        return null;
                                    })
                                    .catch(function (error) {
                                        logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get mods update records ' + error);
                                        throw 'FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get mods update records ' + error;
                                    });
                            });
                        }

                    }, 1000);

                    return null;
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get update records ' + error);
                    throw 'FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get update records ' + error;
                });

        } else {
            logger.module().info('INFO: [/repository/model module (update_metadata_cron/update_records/update_mods)] No mods record updates found.');
            callback(null, obj);
        }
    }

    async.waterfall([
        get_session_token,
        get_record_updates,
        save_record_updates,
        update_records
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error);
            throw 'ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error;
        }

        archivespace.destroy_session_token(results.session, function (result) {

            if (result.error === false) {
                logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] Archivesspace session destroyed.');
            } else {
                logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] Unable to destroy Archivesspace session.');
            }
        });

        logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] records updated');

    });

    callback({
        status: 201,
        message: 'Checking for updated records'
    });
};

/**
 * Updates thumbnail
 * @param req
 * @param callback
 */
exports.update_thumbnail = function (req, callback) {

    if (req.body.pid === undefined || req.body.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }

    let obj = {};
    obj.pid = req.body.pid;
    obj.thumbnail = req.body.thumbnail_url;

    knex(REPO_OBJECTS)
        .where({
            pid: obj.pid,
            is_active: 1
        })
        .update({
            thumbnail: obj.thumbnail
        })
        .then(function (data) {

            // Get existing record from repository
            knex(REPO_OBJECTS)
                .select('*')
                .where({
                    pid: obj.pid,
                    is_active: 1
                })
                .then(function (data) {

                    if (data.length === 0) {
                        logger.module().info('INFO: [/repository/model module (update_thumbnail)] There were no repository records found to update');
                        return false;
                    }

                    let recordObj = {};
                    recordObj.pid = validator.escape(data[0].pid);
                    recordObj.is_member_of_collection = validator.escape(data[0].is_member_of_collection);
                    recordObj.object_type = validator.escape(data[0].object_type);
                    recordObj.sip_uuid = validator.escape(data[0].sip_uuid);
                    recordObj.handle = validator.escape(data[0].handle);
                    recordObj.entry_id = validator.escape(data[0].entry_id);
                    recordObj.thumbnail = validator.escape(data[0].thumbnail);
                    recordObj.object = validator.escape(data[0].file_name);
                    recordObj.mime_type = validator.escape(data[0].mime_type);
                    recordObj.mods = validator.escape(data[0].mods);
                    recordObj.is_published = data[0].is_published;

                    modslibdisplay.create_display_record(recordObj, function (result) {

                        let tmp = JSON.parse(result);

                        if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                            let currentRecord = JSON.parse(data[0].display_record),
                                currentCompoundParts = currentRecord.display_record.parts;

                            delete tmp.display_record.parts;
                            delete tmp.compound;

                            if (currentCompoundParts !== undefined) {
                                tmp.display_record.parts = currentCompoundParts;
                                tmp.compound = currentCompoundParts;
                            }

                            obj.display_record = JSON.stringify(tmp);

                        } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                            obj.display_record = result;

                        }

                        knex(REPO_OBJECTS)
                            .where({
                                is_member_of_collection: recordObj.is_member_of_collection,
                                pid: recordObj.pid,
                                is_active: 1
                            })
                            .update({
                                display_record: obj.display_record
                            })
                            .then(function (data) {

                                // re-index admin record
                                request.post({
                                    url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
                                    form: {
                                        'sip_uuid': recordObj.sip_uuid
                                    }
                                }, function (error, httpResponse, body) {

                                    if (error) {
                                        logger.module().error('ERROR: [/repository/model module (update_thumbnail)] ' + error);
                                        return false;
                                    }

                                    if (httpResponse.statusCode === 200) {

                                        // re-index record to public index if already published
                                        if (recordObj.is_published === 1) {

                                            // wait to make sure updated admin record is ready
                                            setTimeout(function () {

                                                let reindex_url = config.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + config.apiKey,
                                                    query = {
                                                        'bool': {
                                                            'must': {
                                                                'match_phrase': {
                                                                    'pid': recordObj.sip_uuid
                                                                }
                                                            }
                                                        }
                                                    };

                                                request.post({
                                                    url: reindex_url,
                                                    form: {
                                                        'query': query
                                                    },
                                                    timeout: 25000
                                                }, function (error, httpResponse, body) {

                                                    if (error) {
                                                        logger.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail ' + error);
                                                        return false;
                                                    }

                                                    if (httpResponse.statusCode === 200) {
                                                        return false;
                                                    } else {
                                                        logger.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail ' + httpResponse.statusCode + '/' + body);
                                                        return false;
                                                    }

                                                });

                                            }, 7000);
                                        }

                                        return false;
                                    } else {
                                        logger.module().error('ERROR: [/repository/model module (update_thumbnail)] http error ' + httpResponse.statusCode + '/' + body);
                                        return false;
                                    }
                                });

                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/repository/model module (update_thumbnail/create_display_record/modslibdisplay.create_display_record)] unable to update display record ' + error);
                                throw 'FATAL: [/repository/model module (update_thumbnail/create_display_record/modslibdisplay.create_display_record)] unable to update display record ' + error;
                            });
                    });

                    return null;
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (update_thumbnail)] unable to get mods update records ' + error);
                    throw 'FATAL: [/repository/model module (update_thumbnail)] unable to get mods update records ' + error;
                });

            callback({
                status: 201,
                message: 'Thumbnail updated.'
            });

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error);
            throw 'FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error;
        });
};

/**
 * Updates MODS record in db
 * @param record
 * @param updated_record
 * @param obj
 * @param callback
 */
const update_mods = function (record, updated_record, obj, callback) {

    /*
    if (validator.isEmpty(record.mods_id) === true) {
        logger.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods.');
        return false;
    }
    */

    knex(REPO_OBJECTS)
        .where({
            mods_id: record.mods_id,
            is_active: 1
        })
        .update({
            mods: updated_record.mods,
            display_record: obj.display_record
        })
        .then(function (data) {

            knexQ(ARCHIVESSPACE_QUEUE)
                .where({
                    mods_id: record.mods_id
                })
                .update({
                    is_updated: 1
                })
                .then(function (data) {
                    obj.updates = true;
                    callback(obj);
                    return null;
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error);
                    throw 'FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error;
                });

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error);
            throw 'FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error;
        });
};

/**
 * Creates repository collection (admin dashboard)
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.create_collection_object = function (req, callback) {

    let data = req.body;

    if (data.uri === undefined || data.is_member_of_collection === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    function check_uri(callback) {

        let obj = {};

        knex(REPO_OBJECTS)
            .count('uri as uri')
            .where('uri', data.uri)
            .then(function (result) {

                if (result[0].uri === 1) {
                    obj.dupe = true;
                    callback(null, obj);
                    return false;
                }

                obj.dupe = false;
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (create_collection_object)] unable to check uri ' + error);
            });
    }

    function get_session_token(obj, callback) {

        if (obj.dupe === true) {
            obj.session = null;
            callback(null, obj);
            return false;
        }

        archivespace.get_session_token(function (response) {

            let result = response.data,
                obj = {},
                token;

            if (result === undefined) {
                obj.session = null;
                callback(null, obj);
                return false;
            }

            try {

                token = JSON.parse(result);

                if (token.session === undefined) {
                    logger.module().error('ERROR: [/repository/model module (create_collection_object/get_session_token/archivespace.get_session_token)] session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: [/repository/model module (create_collection_object/get_session_token/archivespace.get_session_token)] session token error' + token.error_message);
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                let uriArr = data.uri.split('/'),
                    mods_id = uriArr[uriArr.length - 1];

                obj.mods_id = mods_id;
                obj.uri = data.uri;
                obj.session = token.session;

                callback(null, obj);
                return false;

            } catch (error) {
                logger.module().fatal('FATAL: [/repository/model module (create_collection_object/get_session_token/archivespace.get_session_token)] session token error ' + error);
            }
        });

    }

    function get_mods(obj, callback) {

        if (obj.session === null || obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            archivespace.get_mods(obj.uri, obj.session, function (response) {

                if (response.error !== undefined && response.error === true) {

                    logger.module().error('ERROR: [/repository/model module (create_collection_object/get_mods)] unable to get mods ' + response.error_message);

                    obj.mods = null;
                    callback(null, obj);
                    return false;
                }

                obj.object_type = 'collection';
                obj.mods = response.mods;
                obj.is_member_of_collection = data.is_member_of_collection;

                // delete obj.uri;
                delete obj.session;
                callback(null, obj);
            });

        }, 2000);
    }

    function get_pid(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        try {
            obj.pid = uuid(config.uuidDomain, uuid.DNS);
            obj.sip_uuid = obj.pid;
            callback(null, obj);
        } catch (error) {
            logger.module().error('ERROR: [/repository/model module (create_collection_object/get_pid)] unable to generate uuid');
            obj.pid = null;
            callback(null, obj);
        }
    }

    function get_handle(obj, callback) {

        if (obj.pid === null || obj.dupe === true) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

        logger.module().info('INFO: [/repository/model module (create_collection_object/get_handle)] getting handle');

        handles.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                logger.module().error('ERROR: [/repository/model module (create_collection_object/get_handle/handles.create_handle)] handle error');
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    function create_display_record(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        modslibdisplay.create_display_record(obj, function (result) {
            obj.display_record = result;
            callback(null, obj);
        });
    }

    function save_record(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .insert(obj)
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (create_collection_object/save_record)] unable to save collection record ' + error);
                obj.error = 'FATAL: unable to save collection record ' + error;
                callback(null, obj);
            });
    }

    function index_collection(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        /*
        if (validator.isUUID(obj.sip_uuid) === false || validator.isEmpty(obj.sip_uuid) === true) {
            logger.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record');
            obj.indexed = false;
            return false;
        }
        */

        request.post({
            url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
            form: {
                'sip_uuid': obj.sip_uuid
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record ' + error);
                obj.indexed = false;
                return false;
            }

            if (httpResponse.statusCode === 200) {
                obj.indexed = true;
                callback(null, obj);
                return false;
            } else {
                obj.indexed = false;
                logger.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record ' + body);
            }
        });
    }

    async.waterfall([
        check_uri,
        get_session_token,
        get_mods,
        get_pid,
        get_handle,
        create_display_record,
        save_record,
        index_collection
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (create_collection_object/async.waterfall)] ' + error);
        }

        if (results.dupe === false) {

            logger.module().info('INFO: [/repository/model module (create_collection_object/async.waterfall)] collection record saved');

            callback({
                status: 201,
                message: 'Object created.',
                data: [{'pid': results.pid}]
            });

        } else if (results.dupe === true) {

            callback({
                status: 200,
                message: 'Cannot create duplicate collection object.'
            });

        } else {

            callback({
                status: 500,
                message: 'A database error occurred. ' + error,
                data: [{'pid': 'no pid'}]
            });
        }
    });
};

/**
 * Publishes object(s)
 * @param req
 * @param callback
 */
exports.publish_objects = function (req, callback) {

    if (req.body.pid === undefined || req.body.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    /*
        Publish collections and associated objects
     */
    const pid = req.body.pid,
        type = req.body.type;

    function update_collection_record(callback) {

        let obj = {};
        obj.is_member_of_collection = pid;
        obj.api_url = config.apiUrl + '/api/admin/v1/indexer';

        knex(REPO_OBJECTS)
            .where({
                pid: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_collection_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

        request.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.is_member_of_collection,
                'fragment': {
                    doc: {
                        is_published: 1
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    function publish_collection(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = config.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + config.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'pid': obj.is_member_of_collection
                        }
                    }
                }
            };

        request.post({
            url: reindex_url,
            form: {
                'query': query
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    function update_collection_object_records(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_child_objects)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_collection_object_docs(obj, callback) {

        /*
        if (validator.isUUID(obj.is_member_of_collection) === false || validator.isEmpty(obj.is_member_of_collection) === true) {
            logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record');
            obj.status = 'failed';
            return false;
        }
        */

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1,
                is_active: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length === 0) {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;

                    } else {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

                        request.put({
                            url: update_doc_url,
                            form: {
                                'sip_uuid': record.sip_uuid,
                                'fragment': {
                                    doc: {
                                        is_published: 1
                                    }
                                }
                            },
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                                obj.status = 'failed';
                                return false;
                            }

                            if (httpResponse.statusCode === 200) {
                                return false;
                            } else {
                                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                                obj.status = 'failed';
                            }

                        });
                    }

                }, 150);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (publish_objects/index_objects)] unable to index published object ' + error);
                callback(null, obj);
            });
    }

    function publish_collection_objects(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = config.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + config.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'is_member_of_collection': obj.is_member_of_collection
                        }
                    }
                }
            };

        request.post({
            url: reindex_url,
            form: {
                'query': query
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    /*
        Publish single objects
     */

    /*
        gets object's collection uuid
     */
    function get_collection_uuid (callback) {

        let obj = {};
        obj.sip_uuid = pid;
        obj.api_url = config.apiUrl + '/api/admin/v1/indexer';

        if (obj.sip_uuid === undefined || obj.sip_uuid.length === 0) {
            return false;
        }

        knex(REPO_OBJECTS)
            .select('is_member_of_collection')
            .where({
                sip_uuid: obj.sip_uuid,
                is_active: 1
            })
            .then(function (data) {
                obj.is_member_of_collection = validator.escape(data[0].is_member_of_collection);
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error);
                throw 'FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error;
            });
    }

    /*
        checks if collection is published
     */
    function check_collection (obj, callback) {

        knex(REPO_OBJECTS)
            .select('is_published')
            .where({
                pid: obj.is_member_of_collection,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    obj.is_published = false;
                } else if (data.length > 0) {
                    obj.is_published = true;
                }

                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (check_collection)] Unable to check collection ' + error);
                throw 'FATAL: [/repository/model module (check_collection)] Unable to check collection ' + error;
            });
    }

    function update_object_record (obj, callback) {

        if (obj.is_published === false) {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                sip_uuid: obj.sip_uuid,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_object_doc (obj, callback) {

        if (obj.is_published === false) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

            request.put({
                url: update_doc_url,
                form: {
                    'sip_uuid': obj.sip_uuid,
                    'fragment': {
                        doc: {
                            is_published: 1
                        }
                    }
                },
                timeout: 25000
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                    obj.status = 'failed';
                    return false;
                }

                if (httpResponse.statusCode === 200) {
                    callback(null, obj);
                    return false;
                } else {
                    logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                    obj.status = 'failed';
                    callback(null, obj);
                }

            });

        }, 500);
    }

    function publish_object(obj, callback) {

        if (obj.is_published === false || obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = config.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + config.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'pid': obj.sip_uuid
                        }
                    }
                }
            };

         setTimeout(function () {

             request.post({
                 url: reindex_url,
                 form: {
                     'query': query
                 },
                 timeout: 25000
             }, function (error, httpResponse, body) {

                 console.log(body);

                 if (error) {
                     logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                     obj.status = 'failed';
                     callback(null, obj);
                     return false;
                 }

                 if (httpResponse.statusCode === 200) {
                     callback(null, obj);
                     return false;
                 } else {
                     logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                     obj.status = 'failed';
                     callback(null, obj);
                 }

             });

         }, 3000);
    }

    // publish collection and all of its objects
    if (type === 'collection') {

        async.waterfall([
            update_collection_record,
            update_collection_doc,
            publish_collection,
            update_collection_object_records,
            update_collection_object_docs,
            publish_collection_objects
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error);
                throw 'ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error;
            }

            logger.module().info('INFO: [/repository/model module (publish_objects/async.waterfall)] collection published');
        });

        callback({
            status: 201,
            message: 'Collection Published',
            data: []
        });

        return false;
    }

    if (type === 'object') {

        async.waterfall([
            get_collection_uuid,
            check_collection,
            update_object_record,
            update_object_doc,
            publish_object
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error);
                throw 'ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error;
            }

            if (results.is_published === false) {

                callback({
                    status: 418,
                    message: 'Object not published',
                    data: []
                });

            } else {

                logger.module().info('INFO: [/repository/model module (publish_objects/async.waterfall)] object published');

                callback({
                    status: 201,
                    message: 'Object Published',
                    data: []
                });
            }

        });

        return false;
    }
};

/**
 * Unpublishes records
 * @param req
 * @param callback
 */
exports.unpublish_objects = function (req, callback) {

    const type = req.body.type,
    pid = req.body.pid;

    if (pid === undefined || pid.length === 0 || type === undefined) {
        return false;
    }

    // remove record from public index
    function unpublish_collection (callback) {

        let obj = {};
        obj.is_member_of_collection = pid;
        obj.api_url = config.apiUrl + '/api/admin/v1/indexer';

        request.delete({
            url: obj.api_url + '?pid=' + obj.is_member_of_collection + '&api_key=' + config.apiKey,
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection)] unable to remove published record from index ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 204) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }
        });
    }

    // unpublish objects
    function unpublish_collection_docs(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1,
                is_active: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        // remove objects from public index
                        request.delete({
                            url: obj.api_url + '?pid=' + record.sip_uuid  + '&api_key=' + config.apiKey,
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                                return false;
                            }

                            if (httpResponse.statusCode === 204) {
                                return false;
                            } else {
                                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                            }
                        });

                        // update admin objects to unpublished status
                        let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

                        request.put({
                            url: update_doc_url,
                            form: {
                                'sip_uuid': record.sip_uuid,
                                'fragment': {
                                    doc: {
                                        is_published: 0
                                    }
                                }
                            },
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                                obj.status = 'failed';
                                return false;
                            }

                            if (httpResponse.statusCode === 200) {
                                return false;
                            } else {
                                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                                obj.status = 'failed';
                            }
                        });

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 250);

            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                callback(null, obj);
            });
    }

    // update indexed admin collection record
    function update_collection_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

        request.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.is_member_of_collection,
                'fragment': {
                    doc: {
                        is_published: 0
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    // update db record
    function update_collection_record(obj, callback) {

        knex(REPO_OBJECTS)
            .where({
                sip_uuid: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    // update db records
    function update_collection_object_records(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/publish_child_objects)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    /*
        unpublish single objects
     */

    // remove record from public index
    function unpublish_object(callback) {

        let obj = {};
        obj.api_url = config.apiUrl + '/api/admin/v1/indexer';
        obj.pid = pid;

        if (obj.pid === undefined || obj.pid.length === 0) {
            return false;
        }

        request.delete({
            url: obj.api_url + '?pid=' + obj.pid  + '&api_key=' + config.apiKey,
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 204) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                // obj.status = 'failed';
                callback(null, obj);
            }
        });
    }

    // update indexed admin object record
    function update_object_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = config.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + config.apiKey;

        request.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.pid,
                'fragment': {
                    doc: {
                        is_published: 0
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    // update db record
    function update_object_record(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                pid: obj.pid,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/update_object_record)] unable to unpublish object ' + error);
                obj.status = 'failed';
                callback(null, obj);
            });
    }

    // unpublish collection and all of its objects
    if (type === 'collection') {

        async.waterfall([
            unpublish_collection,
            unpublish_collection_docs,
            update_collection_doc,
            update_collection_record,
            update_collection_object_records
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            logger.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] collection unpublished');
        });

        callback({
            status: 201,
            message: 'Collection unpublished',
            data: []
        });

        return false;

    } else if (type === 'object') {

        async.waterfall([
            unpublish_object,
            update_object_doc,
            update_object_record
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            logger.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] object unpublished');
        });

        callback({
            status: 201,
            message: 'Object unpublished',
            data: []
        });

        return false;

    } else {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }
};

/**
 * Recreates display record
 * @param req
 * @param callback
 */
exports.reset_display_record = function (req, callback) {

    let params = {};

    if (req.body === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

    } else if (req.body.pid !== undefined) {
        params.pid = req.body.pid;
    } else if (req.body.is_member_of_collection !== undefined) {
        params.is_member_of_collection = req.body.is_member_of_collection;
    } else if (req.body.pid === undefined && req.body.is_member_of_collection === undefined) {
        params.none = true;
    }

    function get_data(callback) {

        let obj = {};

        // all records
        if (params.none !== undefined) {

            knex(REPO_OBJECTS)
                .select('is_member_of_collection', 'pid', 'uri', 'handle', 'object_type', 'mods', 'thumbnail', 'file_name', 'mime_type', 'is_published')
                .whereNot({
                    mods: null,
                    is_active: 1
                })
                .then(function (data) {
                    obj.data = data;
                    callback(null, obj);
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error);
                    throw 'FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error;
                });

        } else {

            // single record
            knex(REPO_OBJECTS)
                .select('is_member_of_collection', 'pid', 'uri', 'handle', 'object_type', 'mods', 'thumbnail', 'file_name', 'mime_type', 'is_published')
                .where(params)
                .whereNot({
                    mods: null,
                    is_active: 1
                })
                .then(function (data) {
                    obj.data = data;
                    callback(null, obj);
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error);
                    throw 'FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error;
                });
        }
    }

    function create_display_record(obj, callback) {

        let timer = setInterval(function () {

            if (obj.data.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let record = obj.data.pop();

            modslibdisplay.create_display_record(record, function (display_record) {

                let recordObj = JSON.parse(display_record);

                knex(REPO_OBJECTS)
                    .where({
                        is_member_of_collection: recordObj.is_member_of_collection,
                        pid: recordObj.pid,
                        is_active: 1
                    })
                    .update({
                        display_record: display_record
                    })
                    .then(function (data) {})
                    .catch(function (error) {
                        logger.module().fatal('FATAL: [/repository/model module (reset_display_record/create_display_record/modslibdisplay.create_display_record)] unable to save collection record ' + error);
                        throw 'FATAL: [/repository/model module (reset_display_record/create_display_record/modslibdisplay.create_display_record)] unable to save collection record ' + error;
                    });
            });

        }, 2000);
    }

    async.waterfall([
        get_data,
        create_display_record
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        logger.module().info('INFO: [/repository/model module (reset_display_record/async.waterfall)] display record reset');
    });

    callback({
        status: 201,
        message: 'updating display record(s).'
    });
};