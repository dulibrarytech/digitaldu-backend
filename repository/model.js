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

const fs = require('fs'),
    request = require('request'),
    config = require('../config/config'),
    async = require('async'),
    uuid = require('node-uuid'),
    handles = require('../libs/handles'),
    modslibdisplay = require('../libs/display-record'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    logger = require('../libs/log4'),
    knex = require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects',
    ARCHIVESSPACE_QUEUE = 'tbl_archivesspace_queue',
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    });

/**
 * Gets objects by collection
 * @param req
 * @param callback
 */
exports.get_objects = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Objects retrieved.',
                data: data
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

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Object retrieved.',
                data: data
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

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('id', 'is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'is_published', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Collections for administrators',
                data: data
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

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'handle', 'object_type', 'display_record', 'is_published', 'created')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Object retrieved.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
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
                    logger.module().error('ERROR: session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: session token error' + token.error_message);
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                obj.session = token.session;
                callback(null, obj);
                return false;

            } catch (error) {
                logger.module().error('ERROR: session token error ' + error);
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

        }, 4000);
    }

    function save_record_updates(obj, callback) {

        knexQ(ARCHIVESSPACE_QUEUE)
            .insert(obj.records)
            .then(function (data) {
                obj.data_saved = true;
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save record updates' + error);
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

                                // Get existing record from repository
                                knex(REPO_OBJECTS)
                                    .select('*')
                                    .where({
                                        mods_id: record.mods_id
                                    })
                                    .then(function (data) {

                                        if (data.length === 0) {
                                            logger.module().info('INFO: There were no repository records to update');
                                            return false;
                                        }

                                        let recordObj = {};
                                        recordObj.pid = data[0].pid;
                                        recordObj.is_member_of_collection = data[0].is_member_of_collection;
                                        recordObj.object_type = data[0].object_type;
                                        recordObj.sip_uuid = data[0].sip_uuid;
                                        recordObj.handle = data[0].handle;
                                        recordObj.entry_id = data[0].entry_id;
                                        recordObj.thumbnail = data[0].thumbnail;
                                        recordObj.object = data[0].file_name;
                                        recordObj.mime_type = data[0].mime_type;
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
                                                    logger.module().error('ERROR: Unable to update mods record ' + data[0].mods_id);
                                                } else {

                                                    request.post({
                                                        url: config.apiUrl + '/api/admin/v1/indexer',
                                                        form: {
                                                            'sip_uuid': data[0].sip_uuid
                                                        }
                                                    }, function (error, httpResponse, body) {

                                                        if (error) {
                                                            logger.module().fatal('FATAL: indexer error ' + error + ' (create_repo_record)');
                                                            return false;
                                                        }

                                                        if (httpResponse.statusCode === 200) {
                                                            return false;
                                                        } else {
                                                            logger.module().fatal('FATAL: http error ' + body + ' (update_mods)');
                                                            return false;
                                                        }
                                                    });
                                                }
                                            });
                                        });

                                        return null;
                                    })
                                    .catch(function (error) {
                                        logger.module().error('ERROR: Unable to get mods update records ' + error);
                                        throw 'ERROR: Unable to get mods update records ' + error;
                                    });
                            });
                        }

                    }, 1000);

                    return null;
                })
                .catch(function (error) {
                    logger.module().error('ERROR: Unable to get update records ' + error);
                    throw 'ERROR: Unable to get update records ' + error;
                });

        } else {
            logger.module().info('INFO: No mods record updates found.');
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
            logger.module().error('ERROR: async (get_record_updates)');
            throw 'ERROR: async (get_record_updates)';
        }

        logger.module().info('INFO: records updated');

    });

    callback({
        status: 201,
        message: 'Looking for Updated records'
    });
};

/**
 * Updates thumbnail
 * @param req
 * @param callback
 */
exports.update_thumbnail = function (req, callback) {

    let obj = {};
        obj.pid = req.body.pid;
        obj.thumbnail = req.body.thumbnail_url;

    // TODO: update index
    knex(REPO_OBJECTS)
        .where({
            pid: obj.pid
        })
        .update({
            thumbnail: obj.thumbnail
        })
        .then(function (data) {

            // TODO: update display_record

            // Get existing record from repository
            knex(REPO_OBJECTS)
                .select('*')
                .where({
                    pid: obj.pid
                })
                .then(function (data) {

                    if (data.length === 0) {
                        logger.module().info('INFO: There were no repository records found to update');
                        return false;
                    }

                    let recordObj = {};
                    recordObj.pid = data[0].pid;
                    recordObj.is_member_of_collection = data[0].is_member_of_collection;
                    recordObj.object_type = data[0].object_type;
                    recordObj.sip_uuid = data[0].sip_uuid;
                    recordObj.handle = data[0].handle;
                    recordObj.entry_id = data[0].entry_id;
                    recordObj.thumbnail = data[0].thumbnail;
                    recordObj.object = data[0].file_name;
                    recordObj.mime_type = data[0].mime_type;
                    recordObj.mods = data[0].mods;

                    modslibdisplay.create_display_record(recordObj, function (result) {

                        let tmp = JSON.parse(result);

                        if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                            let currentRecord = JSON.parse(data[0].display_record),
                                currentCompoundParts = currentRecord.display_record.parts;

                            delete tmp.display_record.parts;
                            delete tmp.compound;

                            if (currentCompoundParts !== undefined) {
                                // TODO: update individual thumbnail parts
                                tmp.display_record.parts = currentCompoundParts;
                                tmp.compound = currentCompoundParts;
                            }

                            obj.display_record = JSON.stringify(tmp);

                        } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                            obj.display_record = result;

                        }
                    });

                    return null;
                })
                .catch(function (error) {
                    logger.module().error('ERROR: Unable to get mods update records ' + error);
                    throw 'ERROR: Unable to get mods update records ' + error;
                });


            callback({
                status: 201,
                message: 'Thumbnail updated.'
            });

            return null;
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to update mods records ' + error);
            throw 'ERROR: unable to update records ' + error;
        });
};

/**
 *
 * @param record
 * @param updated_record
 * @param obj
 * @param callback
 */
const update_mods = function (record, updated_record, obj, callback) {

    knex(REPO_OBJECTS)
        .where({
            mods_id: record.mods_id
        })
        .update({
            mods: updated_record.mods, // TODO: remove
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
                    logger.module().error('ERROR: unable to update mods records ' + error);
                    throw 'ERROR: unable to update records ' + error;
                });

            return null;
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to update mods records ' + error);
            throw 'ERROR: unable to update records ' + error;
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
            message: 'Bad request'
        });

        return false;
    }

    function get_session_token(callback) {

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
                    logger.module().error('ERROR: session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: session token error' + token.error_message);
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
                logger.module().error('ERROR: session token error ' + error);
            }
        });

    }

    function get_mods(obj, callback) {

        // skip mods retrieval if session is not available
        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            archivespace.get_mods(obj.uri, obj.session, function (response) {

                if (response.error !== undefined && response.error === true) {

                    logger.module().error('ERROR: unable to get mods ' + response.error_message);

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

        }, 5000);
    }

    function get_pid(obj, callback) {

        try {
            obj.pid = uuid(config.uuidDomain, uuid.DNS);
            obj.sip_uuid = obj.pid;
            callback(null, obj);
        } catch (error) {
            logger.module().error('ERROR: unable to generate uuid');
            obj.pid = null;
            callback(null, obj);
        }
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

        knex(REPO_OBJECTS)
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

    function index_collection (obj, callback) {

        request.post({
            url: config.apiUrl + '/api/admin/v1/indexer',
            form: {
                'sip_uuid': obj.sip_uuid
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: unable to index collection record ' + error);
                obj.indexed = false;
                return false;
            }

            if (httpResponse.statusCode === 200) {
                obj.indexed = true;
                callback(null, obj);
                return false;
            } else {
                obj.indexed = false;
                logger.module().error('ERROR: unable to index collection record ' + body);
            }

        });
    }

    async.waterfall([
        get_session_token,
        get_mods,
        get_pid,
        get_handle,
        create_display_record,
        save_record,
        index_collection
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: async (create_collection_object)');
            throw 'ERROR: async (create_collection_object)';
        }

        logger.module().info('INFO: collection record saved');

        if (results.error === undefined) {

            callback({
                status: 201,
                message: 'Object created.',
                data: [{'pid': results.pid}]
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

    var api_url = config.apiUrl + '/api/admin/v1/indexer';

    function publish_collection (callback) {

        let obj = {};
        obj.is_member_of_collection = req.body.pid;
        obj.api_url = api_url;

        knex(REPO_OBJECTS)
            .where({
                pid: obj.is_member_of_collection
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function publish_child_objects (obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function reindex_admin_collection (obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                pid: obj.is_member_of_collection,
                is_published: 1
            })
            .then(function (data) {

                request.post({
                    url: obj.api_url,
                    form: {
                        'sip_uuid': data[0].sip_uuid
                    },
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: unable to reindex admin record ' + error);
                        obj.status = 'failed';
                        callback(null, obj);
                        return false;
                    }

                    if (httpResponse.statusCode === 200) {
                        callback(null, obj);
                        return false;
                    } else {
                        logger.module().error('ERROR: unable to reindex admin record ' + body);
                        obj.status = 'failed';
                        callback(null, obj);
                    }

                });

            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to index published collection object ' + error);
                callback(null, obj);
            });

    }

    function index_collection (obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                pid: obj.is_member_of_collection,
                is_published: 1
            })
            .then(function (data) {

                request.post({
                    url: obj.api_url,
                    form: {
                        'sip_uuid': data[0].sip_uuid,
                        'publish': true
                    },
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: unable to index published record ' + error);
                        obj.status = 'failed';
                        callback(null, obj);
                        return false;
                    }

                    if (httpResponse.statusCode === 200) {
                        callback(null, obj);
                        return false;
                    } else {
                        logger.module().error('ERROR: unable to index published record ' + body);
                        obj.status = 'failed';
                        callback(null, obj);
                    }

                });

            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to index published collection object ' + error);
                callback(null, obj);
            });
    }

    function index_objects (obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        request.post({
                            url: obj.api_url,
                            form: {
                                'sip_uuid': record.sip_uuid,
                                'publish': true
                            },
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                logger.module().error('ERROR: unable to index published record ' + error);
                                return false;
                            }

                            if (httpResponse.statusCode === 200) {
                                return false;
                            } else {
                                logger.module().error('ERROR: unable to index published record ' + body);
                            }

                        });

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 1000);

            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to index published object ' + error);
                callback(null, obj);
            });
    }

    // publish collection and all of its objects
    if (req.body.pid.length !== 0 && req.body.type === 'collection') {

        async.waterfall([
            publish_collection,
            publish_child_objects,
            reindex_admin_collection,
            index_collection,
            index_objects
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: async (publish_object)');
                throw 'ERROR: async (publish_object)';
            }

            logger.module().info('INFO: collection published');

            callback({
                status: 201,
                message: 'Collection published'
            });
        });

        return false;

    } else if (req.body.pid !== 0 && req.body.type === 'object') {

        // TODO:...
        // publish single object
        // obj.pid = req.body.pid;

    } else {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }
};

/**
 *
 * @param req
 * @param callback
 */
exports.unpublish_objects = function (req, callback) {

    var api_url = config.apiUrl + '/api/admin/v1/indexer';

    function unpublish_collection (callback) {

        let obj = {};
        obj.is_member_of_collection = req.body.pid; // TODO: sanitize
        obj.api_url = api_url;

        knex(REPO_OBJECTS)
            .where({
                pid: obj.is_member_of_collection
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to unpublish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function unpublish_child_objects (obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to unpublish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function unindex_collection (obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('pid')
            .where({
                pid: obj.is_member_of_collection,
                is_published: 0
            })
            .then(function (data) {

                request.delete({
                    url: obj.api_url + '?pid=' + data[0].pid,
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: unable to remove published record from index ' + error);
                        obj.status = 'failed';
                        callback(null, obj);
                        return false;
                    }

                    if (httpResponse.statusCode === 204) {
                        callback(null, obj);
                        return false;
                    } else {
                        logger.module().error('ERROR: unable to remove published record from index ' + body);
                        obj.status = 'failed';
                        callback(null, obj);
                    }

                });
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to index published collection object ' + error);
                callback(null, obj);
            });
    }

    function unindex_objects (obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('pid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 0
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.pid === null) {
                            return false;
                        }

                        request.delete({
                            url: obj.api_url + '?pid=' + record.pid,
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                logger.module().error('ERROR: unable to remove published record from index ' + error);
                                return false;
                            }

                            if (httpResponse.statusCode === 204) {
                                return false;
                            } else {
                                logger.module().error('ERROR: unable to remove published record from index ' + body);
                            }

                        });

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 1000);

            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to remove published record from index (unindex_objects) ' + error);
                callback(null, obj);
            });
    }

    // unpublish collection and all of its objects
    if (req.body.pid.length !== 0 && req.body.type === 'collection') {

        async.waterfall([
            unpublish_collection,
            unpublish_child_objects,
            unindex_collection,
            unindex_objects
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: async (unpublish_object)');
                throw 'ERROR: async (unpublish_object)';
            }

            logger.module().info('INFO: collection unpublished');

            callback({
                status: 201,
                message: 'Collection unpublished'
            });
        });

        return false;

    } else if (req.body.pid !== 0 && req.body.type === 'object') {

        // TODO:...
        // publish single object
        // obj.pid = req.body.pid;

    } else {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }
};

/** TODO: refactor to make use of archivematica download link. make use of shell.js
 * Downloads AIP from archivematica
 * @param req
 * @param callback
 */
exports.get_object_download = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    // keep query to handle legacy pids
    knex(REPO_OBJECTS)
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

                    return false;
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