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
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    duracloud = require('../libs/duracloud'),
    modslibdisplay = require('../libs/display-record'),
    metslib = require('../libs/mets'),
    importlib = require('../libs/transfer-ingest'),
    dip = require('../libs/delete-dip'),
    logger = require('../libs/log4'),
    knex = require('../config/db')(),
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    }),
    REPO_OBJECTS = 'tbl_objects',
    DECACHE = require('decache');

/**
 * gets sip_uuids
 * @param req
 * @param callback
 */
exports.get_sip_uuids = function (req, callback) {

    knexQ('broken_tiffs')
        .where({
            is_deleted: 0
        })
        .then(function (data) {

            console.log(data.length);

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();

                request.post({
                    url: config.apiUrl + '/api/admin/v1/utils/object/delete?api_key=' + config.apiKey,
                    form: {
                        'pid': record.sip_uuid,
                        'delete_reason': 'Master image (tiff) is broken.  Derivatives cannot be generated from master file.'
                    }
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to delete object ' + error);
                        return false;
                    }

                    if (httpResponse.statusCode === 200) {

                        knexQ('broken_tiffs')
                            .where({
                                sip_uuid: record.sip_uuid
                            })
                            .update({
                                is_deleted: 1
                            })
                            .then(function (data) {

                                if (data === 1) {
                                    logger.module().info('INFO: [/utils/model module (delete_object) ' + record.sip_uuid + '. delete complete.');
                                    return false;
                                }

                            })
                            .catch(function (error) {
                                logger.module().error('ERROR: [/utils/model module (delete_object)] unable to delete object ' + record.sip_uuid + ' ' + error);
                                throw 'ERROR: [/utils/model module (delete_object)] unable to delete object ' + record.sip_uuid + ' ' + error;
                            });

                        return false;

                    } else {
                        logger.module().error('ERROR: [/utils/model module (delete_object)] http error ' + httpResponse.statusCode + '/' + body);
                        return false;
                    }
                });

            }, 45000);
        })
        .catch(function (error) {
            logger.module().error('ERROR: [/repository/model module (batch_delete_objects/get_sip_uuids)] Unable to get uuids ' + error);
        });

    callback({
        status: 200,
        message: 'uuids.',
        data: []
    });
};

/**
 * Gets delete ids to batch delete objects from archivematica/duracloud
 * @param req
 * @param callback
 */
exports.delete_objects = function (req, callback) {

    let is_member_of_collection = req.body.is_member_of_collection;
    let delete_reason = req.body.delete_reason;

    knex(REPO_OBJECTS)
        .select('delete_id')
        .whereRaw('delete_id <> ""')
        .where({
            is_member_of_collection: is_member_of_collection
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    console.log('done.');
                    return false;
                }

                let record = data.pop();

                request.post({
                    url: config.apiUrl + '/api/admin/v1/utils/object/delete?api_key=' + config.apiKey,
                    form: {
                        'pid': record.sip_uuid,
                        'delete_reason': delete_reason
                    }
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: [/utils/model module (delete_objects)] unable to delete object ' + error);
                        return false;
                    }

                    if (httpResponse.statusCode === 200) {
                        console.log(body);
                        return false;

                    } else {
                        logger.module().error('ERROR: [/utils/model module (delete_objects)] http error ' + httpResponse.statusCode + '/' + body);
                        return false;
                    }
                });

            }, 45000); // nightmare/electron needs time to process each delete process
        })
        .catch(function (error) {
            logger.module().error('ERROR: [/repository/model module (delete_objects)] Unable to get delete ids ' + error);
        });

    callback({
        status: 200,
        message: 'Deleting objects...',
        data: []
    });
};

/**
 * Deletes archivematica objects
 * @param req
 * @param callback
 */
exports.delete_object = function (req, callback) {

    if (req.body.pid === undefined || req.body.delete_reason === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });
    }

    let pid = req.body.pid;
    let delete_reason = req.body.delete_reason;

    function delete_aip_request(callback) {

        console.log('requesting delete...');

        let obj = {};
        obj.pid = pid;
        obj.delete_reason = delete_reason;

        archivematica.delete_aip_request(obj, function (result) {

            if (result.error === false) {
                obj.delete_id = result.data.id;

                knex(REPO_OBJECTS)
                    .where({
                        pid: obj.pid
                    })
                    .update({
                        delete_id: obj.delete_id
                    })
                    .then(function (data) {

                        if (data === 1) {
                            console.log(obj.delete_id);
                        }
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to delete record ' + error);
                        throw 'FATAL: [/repository/model module (delete_object)] unable to delete record ' + error;
                    });

            } else {
                logger.module().error('ERROR: [/repository/model module (delete_object/delete_aip_request)] unable to create delete aip request');
                obj.delete_id = false;
            }

            setTimeout(function () {
                callback(null, obj);
            }, 5000);
        });
    }

    function delete_aip_request_approval(obj, callback) {

        console.log('Approving delete...');
        console.log('Delete id: ', obj.delete_id);

        if (obj.delete_id !== false) {
            archivematica.delete_aip_request_approval(obj, function (result) {
                console.log(result);
                callback(null, obj);
            });
        } else {
            logger.module().error('ERROR: [/utils/model module (delete_object/delete_aip_request)] aip delete approval failed.');
        }
    }

    async.waterfall([
        delete_aip_request,
        delete_aip_request_approval
    ], function (error, results) {

        console.log('results: ', results);
        DECACHE('nightmare');

        if (error) {
            logger.module().error('ERROR: [/utils/model module (delete_object/delete_aip_request)] unable to create delete aip request');
            return false;
        }

        logger.module().info('INFO: [/utils/model module (delete_object/delete_aip_request)] aip deleted');
    });

    callback({
        status: 200,
        message: 'Deleting objects...',
        data: []
    });
};

/** TODO: adjust form collections updates from UI i.e. account for pid
 * // TODO: move to import module
 * Batch updates all or a collection's metadata records in the repository via ArchivesSpace
 * @param req
 * @param callback

exports.batch_update_metadata = function (req, callback) {

    let pid;

    if (req.query.pid !== undefined) {
        pid = req.query.pid;
    }

    function reset_update_flags(callback) {

        let obj = {};
        let whereObj = {};

        // size of collection
        obj.size = req.query.size;

        if (pid !== undefined) {
            whereObj.is_member_of_collection = pid;
        }

        whereObj.is_active = 1;
        whereObj.object_type = 'object';

        knex(REPO_OBJECTS)
            .where(whereObj)
            .update({
                is_updated: 0
            })
            .then(function (data) {

                if (data > 0) {
                    obj.total_records = data;
                    obj.reset = true;
                    logger.module().info('INTO: [/utils/model module (batch_update_metadata/reset_update_flags)] ' + data + ' update flags reset');
                    callback(null, obj);
                }
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/utils/model module (batch_update_metadata/reset_update_flags/async.waterfall)] ' + error);
                throw 'ERROR: [/utils/model module (batch_update_metadata/reset_update_flags/async.waterfall)] ' + error;
            });
    }

    function get_token(obj, callback) {

        archivespace.get_session_token(function (response) {

            let result = response.data,
                token;

            try {

                token = JSON.parse(result);

                if (token.session === undefined) {
                    logger.module().error('ERROR: [/repository/model module (update_metadata_record/get_session_token/ARCHIVESSPACE.get_session_token)] session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: [/repository/model module (update_metadata_record/get_session_token/ARCHIVESSPACE.get_session_token)] session token error' + token.error_message);
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                obj.session = token.session;
                callback(null, obj);
                return false;

            } catch (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_record/get_session_token/ARCHIVESSPACE.get_session_token)] session token error ' + error);
                obj.session = null;
                callback(null, obj);
                return false;
            }
        });
    }

    function get_collection_counts(obj, callback) {

        knex(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                object_type: 'collection'
            })
            .then(async function (data) {

                let counts = [];

                for (let i = 0; i < data.length; i++) {

                    counts.push({
                        'sip_uuid': data[i].sip_uuid, 'count': await knex(REPO_OBJECTS)
                            .count('id as count', 'sip_uuid')
                            .where({
                                is_member_of_collection: data[i].sip_uuid,
                                is_active: 1,
                                object_type: 'object',
                                is_updated: 0
                            })
                    });
                }

                let collections = counts.filter(function (value) {

                    let object_count = value.count.pop().count;
                    let max_count;
                    let min_count;
                    let object_timer = 8000; // 8 sec per object

                    switch (obj.size) {
                        case 's':
                            max_count = 600;
                            min_count = 0;
                            break;
                        case 'm':
                            max_count = 1300;
                            min_count = 600;
                            break;
                        case 'l':
                            max_count = 5000;
                            min_count = 1300;
                            break;
                    }

                    if (object_count < max_count && object_count > min_count) {
                        delete value.count;
                        value.collection_timer = object_count * object_timer;
                        return value;
                    }
                });

                let collection_timers = [];

                for (let i=0;i<collections.length;i++) {
                    collection_timers.push(collections[i].collection_timer);
                    delete collections[i].collection_timer;
                }

                obj.collection_timer = Math.max.apply(Math, collection_timers);
                obj.object_timer = 8000;
                obj.collections = collections;
                callback(null, obj);
            });

        return false;
    }

    function update_metadata_records(obj, callback) {

        if (obj.reset === false || obj.session === null) {
            callback(null, obj);
            return false;
        }

        let collection_timer = obj.collection_timer;
        let object_timer = obj.object_timer;
        let outer_timer;

        const reset_update_flag = function (sip_uuid) {

            knex(REPO_OBJECTS)
                .where({
                    sip_uuid: sip_uuid
                })
                .update({
                    is_updated: 1
                })
                .then(function (data) {

                    if (data === 1) {
                        return false;
                    }

                    return null;
                })
                .catch(function (error) {
                    logger.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to update metadata record ' + obj.sip_uuid + ' ' + error);
                    throw 'ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to update metadata record ' + obj.sip_uuid + ' ' + error;
                });
        };

        const request_update = function (obj, sip_uuid) {

            request.put({
                url: config.apiUrl + '/api/v1/utils/metadata/update?api_key=' + config.apiKey,
                form: {
                    'sip_uuid': sip_uuid,
                    'session': obj.session
                },
                timeout: 55000
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to update record ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    return false;

                } else {
                    logger.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        };

        // begin processing immediately
        console.log('collection timer: ', collection_timer);
        collections();

        // processes updates for objects in collections - reference passed into interval function
        function collections() {

            let collection = obj.collections.pop();
            let inner_timer;

            console.log('obj.collections total count: ', obj.collections.length);

            if (obj.collections.length === 0) {
                logger.module().info('INFO: [/utils/model module (batch_update_metadata/update_metadata_records)] metadata updates complete');
                clearInterval(outer_timer);
                callback(null, obj);
                return false;
            }

            // TODO: update collection (resource) metadata
            // request_update(obj, collection.sip_uuid);
            reset_update_flag(collection.sip_uuid);

            // processes objects - passed into interval function
            function objects() {

                if (obj.collections.length === 0) {
                    clearInterval(outer_timer);
                    clearInterval(inner_timer);
                    return false;
                }

                knex(REPO_OBJECTS)
                    .select('sip_uuid')
                    .where({
                        is_member_of_collection: collection.sip_uuid,
                        is_active: 1,
                        object_type: 'object',
                        is_updated: 0
                    })
                    .limit(1)
                    // .orderBy('id', 'desc')
                    .then(function (data) {

                        if (data.length === 0) {
                            console.log('done.');
                            clearInterval(inner_timer);
                            return false;
                        }

                        let sip_uuid = data[0].sip_uuid;
                        request_update(obj, sip_uuid);
                        reset_update_flag(sip_uuid);
                        return null;
                    })
                    .catch(function (error) {
                        logger.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to get sip_uuid ' + error);
                        throw 'ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to get sip_uuid ' + error;
                    });

                return false; // end objects
            }

            inner_timer = setInterval(objects, object_timer);

            return false; // end collections
        }

        outer_timer = setInterval(collections, collection_timer);
    }

    async.waterfall([
        reset_update_flags,
        get_token,
        get_collection_counts,
        update_metadata_records
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/utils/model module (batch_update_metadata/async.waterfall)] ' + error);
            throw 'ERROR: [/utils/model module (batch_update_metadata/async.waterfall)] ' + error;
        }

        if (results.session !== null) {

            archivespace.destroy_session_token(results.session, function (result) {

                if (result.error === false) {
                    logger.module().info('INFO: ArchivesSpace session terminated. ' + result.data);
                } else {
                    logger.module().error('ERROR: [/utils/model module (update_metadata_record/get_mods)] Unable to terminate session');
                }

            });
        }

        logger.module().info('INFO: [/utils/model module (batch_update_metadata/async.waterfall)] metadata records updated');
    });

    callback({
        status: 201,
        message: 'Batch updating metadata records...'
    });
};
 */

/**
 * updates single metadata record
 * @param req
 * @param callback

exports.update_metadata_record = function (req, callback) {

    if (req.body.sip_uuid === undefined) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });

        return false;
    }

    let sip_uuid = req.body.sip_uuid;
    let session = req.body.session;

    // 1.)
    function get_mods_id(callback) {

        let obj = {};
        obj.sip_uuid = sip_uuid;
        obj.session = session;

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('mods_id', 'mods')
            .where({
                sip_uuid: obj.sip_uuid,
                object_type: 'object'
            })
            .then(function (data) {

                if (data.length === 0) {
                    logger.module().info('INFO: no record found for ' + obj.sip_uuid);
                    return false;
                }

                obj.mods_id = data[0].mods_id;
                obj.prev_mods = data[0].mods;
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_record/get_session_token/ARCHIVESSPACE.get_session_token)] session token error ' + error);
                throw 'FATAL: [/repository/model module (update_metadata_record/get_session_token/ARCHIVESSPACE.get_session_token)] session token error ' + error;
            });
    }

    // 2.)
    function get_mods(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        archivespace.get_mods(obj.mods_id, obj.session, function (data) {

            if (data.error === true) {

                logger.module().error('ERROR: [/repository/model module (update_metadata_record/get_mods)] Unable to get mods');

                obj.error = true;
                obj.session = null;

                callback(null, obj);
                return false;
            }

            if (obj.prev_mods === data.mods) {

                logger.module().info('INFO: no update required for record ' + obj.sip_uuid);

                obj.session = null;
                callback(null, obj);
                return false;
            }

            obj.mods = data.mods;
            callback(null, obj);
        });
    }

    // 3.)
    function update_mods(obj, callback) {

        if (obj.session === null || obj.error === true) {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .where({
                sip_uuid: obj.sip_uuid
            })
            .update({
                mods: obj.mods
            })
            .then(function (data) {

                if (data === 1) {
                    logger.module().info('INFO: Record ' + obj.sip_uuid + ' updated.');
                    // TODO: add to db for reporting?
                    obj.updated = true;
                } else {
                    obj.updated = false;
                }

                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_record/update_mods)] unable to update mods ' + error);
                throw 'FATAL: [/repository/model module (update_metadata_record/update_mods)] unable to update mods ' + error;
            });
    }

    // 4.)
    function update_display_record(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        knex(REPO_OBJECTS)
            .select('*')
            .where({
                mods_id: obj.mods_id,
                is_active: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    logger.module().info('INFO: [/repository/model module (update_metadata_record/update_display_record)] unable to update display record');
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
                recordObj.is_published = data[0].is_published;
                recordObj.mods = obj.mods;

                modslibdisplay.create_display_record(recordObj, function (result) {

                    let tmp = JSON.parse(result);

                    if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                        let currentRecord = JSON.parse(data[0].display_record),
                            currentCompoundParts = currentRecord.display_record.parts;

                        let updatedParts = tmp.display_record.parts.filter(function (elem) {

                            for (let i = 0; i < currentCompoundParts.length; i++) {

                                if (elem.title === currentCompoundParts[i].title) {
                                    elem.caption = currentCompoundParts[i].caption;
                                    elem.object = currentCompoundParts[i].object;
                                    elem.thumbnail = currentCompoundParts[i].thumbnail;
                                    return elem;
                                }
                            }

                        });

                        delete tmp.display_record.parts;
                        delete tmp.compound;

                        if (currentCompoundParts !== undefined) {
                            tmp.display_record.parts = updatedParts;
                            tmp.compound = updatedParts;
                        }

                        obj.display_record = JSON.stringify(tmp);

                    } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                        obj.display_record = result;

                    }

                    knex(REPO_OBJECTS)
                        .where({
                            sip_uuid: obj.sip_uuid
                        })
                        .update({
                            display_record: obj.display_record
                        })
                        .then(function (data) {

                            if (data === 1) {
                                logger.module().info('INFO: [/utils/model module (update_metadata_record/update_display_record)] ' + obj.sip_uuid + ' display record updated');
                                obj.is_published = recordObj.is_published;
                                callback(null, obj);
                            } else {
                                obj.updated = false;
                                callback(null, obj);
                            }

                            return null;
                        })
                        .catch(function (error) {
                            logger.module().error('ERROR: [/repository/model module (update_metadata_record/index_admin_record)] indexer error ' + error);
                            obj.updated = false;
                            callback(null, obj);
                        });
                });

                return null;
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get mods update records ' + error);
                throw 'FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] Unable to get mods update records ' + error;
            });
    }

    // 5.)
    function update_admin_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        // update admin index
        request.post({
            url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
            form: {
                'sip_uuid': obj.sip_uuid
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (update_metadata_record/index_admin_record)] indexer error ' + error);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                logger.module().info('INFO: [/utils/model module (update_metadata_record/update_display_record)] ' + obj.sip_uuid + ' indexed');
                obj.admin_index = true;
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/repository/model module (update_metadata_record/index_admin_record)] http error ' + httpResponse.statusCode + '/' + body);
                obj.admin_index = false;
                callback(null, obj);
                return false;
            }
        });
    }

    // 6.)
    function update_public_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.admin_index === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        if (obj.is_published === 1) {

            // update public index
            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
                form: {
                    'sip_uuid': obj.sip_uuid,
                    'publish': true
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/utils/model module (update_metadata_cron/update_records/update_mods)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 200) {
                    logger.module().info('INFO: [/utils/model module (update_metadata_record/update_display_record)] ' + obj.sip_uuid + ' published.');
                    obj.public_index = true;
                    callback(null, obj);
                    return false;
                } else {
                    logger.module().error('ERROR: [/repository/model module (update_metadata_cron/update_records/update_mods)] http error ' + httpResponse.statusCode + '/' + body);
                    obj.public_index = false;
                    callback(null, obj);
                    return false;
                }
            });
        }
    }

    async.waterfall([
        get_mods_id,
        get_mods,
        update_mods,
        update_display_record,
        update_admin_index,
        update_public_index
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (create_collection_object/async.waterfall)] ' + error);
        }

    });

    callback({
        status: 201
    });
};
 */

/** TODO: MOVE to import module
 * Batch updates collection metadata records in the repository via ArchivesSpace
 * @param req
 * @param callback
 */
exports.batch_update_collection_metadata = function (req, callback) {

    function reset_update_flags(callback) {

        let obj = {};
        let whereObj = {};

        whereObj.is_active = 1;
        whereObj.object_type = 'collection';

        knex(REPO_OBJECTS)
            .where(whereObj)
            .update({
                is_updated: 0
            })
            .then(function (data) {

                if (data > 0) {
                    obj.total_records = data;
                    obj.reset = true;
                    logger.module().info('INTO: [/utils/model module (batch_update_collection_metadata/reset_update_flags)] ' + data + ' update flags reset');
                    callback(null, obj);
                }
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/reset_update_flags/async.waterfall)] ' + error);
                throw 'ERROR: [/utils/model module (batch_update_collection_metadata/reset_update_flags/async.waterfall)] ' + error;
            });
    }

    function update_metadata_records(obj, callback) {

        if (obj.reset === false) {
            callback(null, obj);
            return false;
        }

        let whereObj = {};

        whereObj.is_updated = 0;
        whereObj.object_type = 'collection';

        let timer = setInterval(function () {

            knex(REPO_OBJECTS)
                .select('sip_uuid')
                .where(whereObj)
                .limit(1)
                .then(function (data) {

                    if (data.length === 0) {
                        logger.module().info('INFO: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] metadata updates complete');
                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                    let sip_uuid = data[0].sip_uuid;

                    request.put({
                        url: config.apiUrl + '/api/admin/v1/repo/metadata/collection?api_key=' + config.apiKey,
                        form: {
                            'sip_uuid': sip_uuid
                        }
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] unable to update record ' + error);
                            return false;
                        }

                        if (httpResponse.statusCode === 201) {

                            knex(REPO_OBJECTS)
                                .where({
                                    sip_uuid: sip_uuid
                                })
                                .update({
                                    is_updated: 1
                                })
                                .then(function (data) {

                                    if (data === 1) {
                                        logger.module().info('INFO: [/utils/model module (batch_update_collection_metadata/reset_update_flags)] reset update flag for collection record ' + sip_uuid + '. update complete.');
                                        return false;
                                    }

                                })
                                .catch(function (error) {
                                    logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] unable to update metadata record ' + sip_uuid + ' ' + error);
                                    throw 'ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] unable to update metadata record ' + sip_uuid + ' ' + error;
                                });

                            return false;

                        } else {
                            logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] http error ' + httpResponse.statusCode + '/' + body);
                            return false;
                        }
                    });
                })
                .catch(function (error) {
                    logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] unable to get sip_uuid ' + error);
                    throw 'ERROR: [/utils/model module (batch_update_collection_metadata/update_metadata_records)] unable to get sip_uuid ' + error;
                });

        }, 14000);
    }

    async.waterfall([
        reset_update_flags,
        update_metadata_records
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/utils/model module (batch_update_collection_metadata/async.waterfall)] ' + error);
            throw 'ERROR: [/utils/model module (batch_update_collection_metadata/async.waterfall)] ' + error;
        }

        logger.module().info('INFO: [/utils/model module (batch_update_collection_metadata/async.waterfall)] ' + results.total_records + ' Collection metadata records updated');
    });

    callback({
        status: 201,
        message: 'Batch updating collection metadata records...'
    });
};


exports.confirm_dip_file = function(req, callback) {

    let obj = {};
    obj.pid = req.query.pid;
    dip.confirm_dip(obj, function(result) {
        console.log(result);
    })

};

/**
 * reindexes all repository records
 * @param req
 * @param callback
 */
exports.reindex = function (req, callback) {

    function delete_index(callback) {

        let obj = {};
        obj.delete_indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];

        function del(index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/index/delete?api_key=' + config.apiKey,
                form: {
                    'index_name': index_name
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/delete_index)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    logger.module().info('INFO: [/import/utils module (reindex/delete_index/del)] ' + index_name + ' deleted.');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/delete_index/del)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        let timer = setInterval(function () {

            if (obj.delete_indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = obj.delete_indexes.pop();
            del(index);

        }, 500);
    }

    function create_index(obj, callback) {

        if (obj.delete_indexes.length !== 0) {
            obj.delete = false;
            callback(null, obj);
            return false;
        }

        obj.create_indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];

        function create(index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/index/create?api_key=' + config.apiKey,
                form: {
                    'index_name': index_name
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/create_index/create)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    logger.module().info('INFO: [/import/utils module (reindex/create_index/create)] ' + index_name + ' created.');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/create_index/create)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        let timer = setInterval(function () {

            if (obj.create_indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = obj.create_indexes.pop();
            create(index);

        }, 5000);
    }

    function index(obj, callback) {

        if (obj.create_indexes.length !== 0) {
            obj.create = false;
            callback(null, obj);
            return false;
        }

        function reindex(index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/all?api_key=' + config.apiKey,
                form: {
                    'index_name': index_name,
                    'reindex': true
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/index/reindex)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    logger.module().info('INFO: [/import/utils module (reindex/index/reindex)] reindexing ' + index_name + '.');
                    obj.reindexed = true;
                    callback(null, obj);
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/index/reindex)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        reindex(config.elasticSearchBackIndex);
    }

    function monitor_index_progress(obj, callback) {

        function monitor() {

            knex(REPO_OBJECTS)
                .count('is_indexed as is_indexed_count')
                .where({
                    is_indexed: 0,
                    is_active: 1
                })
                .then(function (data) {

                    console.log('Record index count: ', data[0].is_indexed_count);

                    if (data[0].is_indexed_count < 50) {
                        clearInterval(timer);
                        obj.reindex_complete = true;
                        callback(null, obj);
                        return false;
                    }

                    return null;
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error);
                    throw 'FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error;
                });
        }

        var timer = setInterval(function () {
            monitor();
        }, 60000);
    }

    async.waterfall([
        delete_index,
        create_index,
        index,
        monitor_index_progress
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] ' + error);
        }

        if (results.reindexed !== undefined) {
            logger.module().info('INFO: [/utils/model module (reindex/async.waterfall)] indexing in progress');
        } else {
            logger.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] reindex failed. ' + results);
        }

        if (results.reindex_complete !== undefined && results.reindex_complete === true) {
            republish();
        }

    });

    callback({
        status: 201,
        message: 'reindexing repository',
        data: []
    });
};

/**
 * Republishes collections
 */
const republish = function () {

    function publish(sip_uuid) {

        request.post({
            url: config.apiUrl + '/api/admin/v1/repo/publish?api_key=' + config.apiKey,
            form: {
                'pid': sip_uuid,
                'type': 'collection'
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/import/utils module (republish/publish)] indexer error ' + error);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                logger.module().info('INFO: [/import/utils module (republish/publish)] published ' + sip_uuid + '.');
                return false;
            } else {
                logger.module().error('ERROR: [/import/utils module (republish/publish)] http error ' + httpResponse.statusCode + '/' + body);
                return false;
            }
        });
    }

    knex(REPO_OBJECTS)
        .select('pid')
        .where({
            object_type: 'collection',
            is_published: 1,
            is_active: 1
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();
                publish(record.pid);

            }, 10000);

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/utils module (reindex/republish/publish)] Unable to get object ' + error);
            throw 'FATAL: [/import/utils module (reindex/republish/publish)] Unable to get object ' + error;
        });
};

////////////////////////////////////////////////////////////////////////////////////

/**
 * Batch deletes records (repository DB and Index)
 * @param req
 * @param callback
 */
exports.batch_delete_objects = function (req, callback) {

    function get_sip_uuids(callback) {

        let obj = {};

        knexQ('broken_tiffs')
            .then(function (data) {
                console.log(data.length);
                if (data.length > 0) {
                    obj.sip_uuids = data;
                    callback(null, obj);
                }

            })
            .catch(function (error) {
                logger.module().error('ERROR: [/repository/model module (batch_delete_objects/get_sip_uuids)] Unable to get uuids ' + error);
            });
    }

    function delete_from_db(obj, callback) {

        obj.sip_uuid_index = [];

        let timer = setInterval(function () {

            if (obj.sip_uuids.length === 0) {
                console.log('complete.');
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let record = obj.sip_uuids.pop();
            obj.sip_uuid_index.push(record);

            if (record.sip_uuid === undefined) {
                console.log(record.sip_uuid + ' does not exist.');
                return false;
            }

            console.log('deleting ', record.sip_uuid + ' from DB.');

            knex(REPO_OBJECTS)
                .where({
                    sip_uuid: record.sip_uuid
                })
                .update({
                    is_indexed: 0,
                    is_active: 0,
                    is_published: 0
                })
                .then(function (data) {
                    console.log(data);
                    logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] ' + record.sip_uuid + ' set to inactive in database ');
                })
                .catch(function (error) {
                    logger.module().error('ERROR: [/repository/model module (batch_delete_objects/get_sip_uuids)] Unable to get uuids ' + error);

                });

            /*
             knex(REPO_OBJECTS)
             .where({
             sip_uuid: record.sip_uuid
             })
             .del()
             .then(function(data) {
             console.log(data);
             logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] ' + record.sip_uuid + ' removed from database ');
             })
             .catch(function(error) {
             console.log(error);
             });
             */

        }, 550);
    }

    function delete_from_index(obj, callback) {

        let timer = setInterval(function () {

            if (obj.sip_uuid_index.length === 0) {
                console.log('complete.');
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let record = obj.sip_uuid_index.pop();

            if (record.sip_uuid === undefined) {
                console.log(record.sip_uuid + ' does not exist.');
                return false;
            }

            console.log('Deleting ' + record.sip_uuid + ' from index.');

            // deletes from public index
            request.delete({
                url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey + '&pid=' + record.sip_uuid
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (batch_delete_objects/delete_from_index)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 204) {
                    logger.module().info('INFO: [/repository/model module (batch_delete_objects/delete_from_index)] ' + record.sip_uuid + ' removed from index ');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (batch_delete_objects/delete_from_index)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });

            // deletes from admin index
            request.delete({
                url: config.apiUrl + '/api/admin/v1/indexer/delete?api_key=' + config.apiKey + '&pid=' + record.sip_uuid
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (batch_delete_objects/delete_from_index)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 204) {
                    logger.module().info('INFO: [/repository/model module (batch_delete_objects/delete_from_index)] ' + record.sip_uuid + ' removed from index ');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (batch_delete_objects/delete_from_index)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });

        }, 600);
    }

    async.waterfall([
        get_sip_uuids,
        delete_from_db,
        delete_from_index
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error);
            throw 'ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error;
        }

        logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] records deleted');
    });

    callback({
        status: 204,
        message: 'deleting records...'
    });
};

/**
 * confirms that repository files exist on Archivematica service/duracloud service
 * @param req
 * @param callback
 */
exports.check_objects = function (req, callback) {

    let apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/',
        mime_type = 'image/tiff';
    // 'image/tiff',
    // 'application/pdf',
    // 'video/mp4',
    // 'audio/x-wav'

    knex(REPO_OBJECTS)
        .select('sip_uuid', 'object_type', 'mods', 'thumbnail', 'file_name', 'file_size', 'mime_type', 'is_compound', 'created')
        .where({
            object_type: 'object',
            mime_type: mime_type,
            is_active: 1
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    console.log('done');
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();
                let mods = JSON.parse(record.mods);
                var call_number = 'none';

                if (mods === null && mods.parts === null) {
                    return false;
                }

                if (mods.parts.length > 1) {

                    let partsArr = [];
                    for (let i = 0; i < mods.parts.length; i++) {
                        partsArr.push(mods.parts[i].title);
                    }

                    call_number = partsArr.toString();

                } else if (mods.parts.length === 1) {
                    call_number = mods.parts[0].title;
                } else {
                    call_number = 'call number not found';
                }

                if (record.file_name === null) {
                    console.log('sip_uuid: ', record.sip_uuid);
                    console.log('No path associated with object');
                }

                request.head({
                    url: apiUrl + record.file_name,
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (httpResponse !== undefined) {
                        console.log(httpResponse.statusCode);
                    }

                    if (error) {
                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + error);


                        let obj = {
                            sip_uuid: record.sip_uuid,
                            object: record.file_name,
                            type: 'master',
                            call_number: call_number,
                            mime_type: record.mime_type,
                            status_code: 0
                        };

                        // save data for incomplete record
                        knexQ('tbl_incomplete_queue')
                            .insert(obj)
                            .then(function (data) {
                                return null;
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error);
                                throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error;
                            });

                        return false;
                    }

                    if (httpResponse !== undefined && httpResponse.statusCode === 200) {

                        console.log('sip_uuid: ', record.sip_uuid);
                        console.log('Master record exists');
                        console.log('--------------------------');
                        return false;

                    } else {

                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + 'sip_uuid: ' + record.sip_uuid + '--- (' + record.file_size + ') ' + httpResponse.statusCode + '/' + body);
                        console.log('--------------------------');

                        let obj = {
                            sip_uuid: record.sip_uuid,
                            object: record.file_name,
                            type: 'master',
                            mime_type: record.mime_type,
                            status_code: httpResponse.statusCode
                        };

                        knexQ('tbl_incomplete_queue')
                            .insert(obj)
                            .then(function (data) {
                                // update incomplete record in main repo DB
                                knex(REPO_OBJECTS)
                                    .where({
                                        sip_uuid: record.sip_uuid
                                    })
                                    .update({
                                        is_active: 0,
                                        is_complete: 0
                                    })
                                    .then(function (data) {
                                        console.log(data);
                                    })
                                    .catch(function (error) {
                                        logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to update incomplete record data ' + error);
                                        throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to update incomplete record data ' + error;
                                    });
                                return null;
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error);
                                throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error;
                            });

                        return false;
                    }
                });

                if (record.mime_type !== 'image/tiff') {
                    return false;
                }

                request.head({
                    url: apiUrl + record.thumbnail,
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud thumbnail ' + error);
                    }

                    if (httpResponse !== undefined && httpResponse.statusCode === 200) {

                        console.log('sip_uuid: ', record.sip_uuid);
                        console.log('Thumbnail record exists');
                        console.log('--------------------------');
                        return false;

                    } else if (httpResponse !== undefined && httpResponse.statusCode !== undefined) {

                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud thumbnail ' + 'sip_uuid: ' + record.sip_uuid + '--- (' + record.file_size + ') ' + httpResponse.statusCode + '/' + body);
                        console.log('--------------------------');

                        let obj = {
                            sip_uuid: record.sip_uuid,
                            object: record.thumbnail,
                            type: 'thumbnail',
                            mime_type: record.mime_type,
                            status_code: httpResponse.statusCode
                            // message: JSON.stringify(body)
                        };

                        knexQ('tbl_incomplete_queue')
                            .insert(obj)
                            .then(function (data) {
                                return null;
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error);
                                throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error;
                            });

                        return false;
                    }
                });

            }, 450);

            callback({
                status: 200,
                message: 'Checking objects.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
            throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
        });
};

/**
 *  gets archivesspace ids for incomplete records
 */
exports.get_archivesspace_ids = function (req, callback) {

    knexQ('tbl_incomplete_queue')
        .distinct('sip_uuid', 'call_number')
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();

                knex(REPO_OBJECTS)
                    .select('uri')
                    .where({
                        sip_uuid: record.sip_uuid
                    })
                    .then(function (data) {

                        let obj = {};
                        obj.sip_uuid = record.sip_uuid.trim();
                        obj.uri = data[0].uri.trim();
                        obj.call_number = record.call_number.trim();

                        knexQ('broken_tiffs')
                            .insert(obj)
                            .then(function (data) {
                                console.log(data);
                                return null;
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error);
                                throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error;
                            });
                    })
                    .catch(function (error) {
                        logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
                        throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
                    });

            }, 150);

        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
            throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
        });

    callback({
        status: 200,
        message: 'Getting archivesspace ids.'
    });
};

/**
 * flags display records that are missing thumbnail and object paths
 * @param req
 * @param res
 */
exports.fix_display_records = function (req, callback) {

    knex(REPO_OBJECTS)
        .select('*')
        .where({
            object_type: 'object',
            is_active: 1,
            is_compound: 1
            // sip_uuid: 'f2f3ca92-9b8f-4b35-954a-a5b8600ab234'
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    console.log('done');
                    clearInterval(timer);
                    return false;
                }

                let doc = data.pop();

                console.log(data.length);
                console.log(doc.sip_uuid);
                // console.log(doc.thumbnail);
                // console.log(doc.file_name);

                let apiUrl = 'http://lib-es01-vlp.du.edu:9200/repo_admin/data/';

                request.get({
                    url: apiUrl + doc.sip_uuid,
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud thumbnail ' + error);
                    }

                    if (httpResponse !== undefined && httpResponse.statusCode === 200) {

                        let tmp = JSON.parse(body);

                        for (let i = 0; i < tmp._source.display_record.parts.length; i++) {

                            if (tmp._source.display_record.parts[i].thumbnail === undefined || tmp._source.display_record.parts[i].object === undefined) {

                                console.log('missing properties');

                                let record = tmp._source.display_record;
                                let obj = {};
                                obj.sip_uuid = doc.sip_uuid;
                                obj.display_record = JSON.stringify(record);
                                obj.is_compound = doc.is_compound;

                                knexQ('broken_display_records')
                                    .insert(obj)
                                    .then(function (data) {
                                        return null;
                                    })
                                    .catch(function (error) {
                                        logger.module().fatal('FATAL: unable to save broken record data ' + error);
                                        throw 'FATAL: unable to save broken record data ' + error;
                                    });
                            }
                        }

                        // console.log('Thumbnail record exists');
                        console.log('--------------------------');

                        return false;

                    } else if (httpResponse !== undefined && httpResponse.statusCode !== undefined) {

                        // logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud thumbnail ' + 'sip_uuid: ' + doc.sip_uuid + '--- (' + doc.file_size + ') ' + httpResponse.statusCode + '/' + body);
                        console.log('Doc not found on server');
                        console.log('--------------------------');
                    }
                });

                /*
                 if (doc.thumbnail === null || doc.file_name === null) {

                 let obj = {};
                 obj.sip_uuid = doc.sip_uuid;
                 obj.display_record = doc.display_record;

                 knexQ('broken_tn_file_name')
                 .insert(obj)
                 .then(function (data) {
                 return null;
                 })
                 .catch(function (error) {
                 logger.module().fatal('FATAL: unable to save broken record data ' + error);
                 throw 'FATAL: unable to save broken record data ' + error;
                 });
                 }
                 */

            }, 100);

        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/utils/model module (fix_display_records)] Unable to get objects ' + error);
            throw 'FATAL: [/utils/model module (fix_display_records)] Unable to check objects ' + error;
        });

    callback({
        status: 200,
        message: 'Checking display records.'
    });
};

// TODO: rebuild display records after archivesspace plugin changes (compound objects are affected)
// 1.) query all compound objects
// 2.) get mods record from archivesspace
// 3.) update local mods and display records
exports.fix_compound_objects = function (req, callback) {

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

    function update_broken_records(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        function get_broken_compound_records(callback) {

            knex(REPO_OBJECTS)
                .select('*')
                .where({
                    is_compound: 1,
                    is_active: 1
                })
                .then(function (data) {
                    obj.data = data;
                    callback(null, obj);
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/import/utils module (get_broken_compound_records)] Unable to get broken compound records ' + error);
                    throw 'FATAL: [/import/utils module (get_broken_compound_records)] Unable to get broken compound records ' + error;
                });
        }

        function get_updated_mods_records(obj, callback) {

            let data = obj.data;
            delete obj.data;

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    archivespace.destroy_session_token(obj.session, function (data) {
                        console.log(data);
                        callback(null, obj);
                    });

                    return false;
                }

                let record = data.pop();

                function get_mods(callback) {

                    archivespace.get_mods(record.mods_id, obj.session, function (data) {

                        let recordObj = {};
                        recordObj.pid = record.pid;
                        recordObj.is_member_of_collection = record.is_member_of_collection;
                        recordObj.object_type = record.object_type;
                        recordObj.sip_uuid = record.sip_uuid;
                        recordObj.handle = record.handle;
                        recordObj.entry_id = record.entry_id;
                        recordObj.thumbnail = record.thumbnail;
                        recordObj.object = record.file_name;
                        recordObj.mime_type = record.mime_type;
                        recordObj.is_published = record.is_published;
                        recordObj.mods = data.mods;

                        obj.recordObj = recordObj;
                        callback(null, obj);
                    });
                }

                function create_display_record(obj, callback) {

                    let recordObj = obj.recordObj;

                    modslibdisplay.create_display_record(recordObj, function (result) {
                        obj.display_record = JSON.parse(result);
                        // obj.display_record_parts = obj.display_record.display_record.parts;
                        callback(null, obj);
                    });
                }

                function get_mets(obj, callback) {

                    archivematica.get_dip_path(obj.recordObj.sip_uuid, function (dip_path) {

                        obj.dip_path = dip_path;
                        obj.sip_uuid = obj.recordObj.sip_uuid;

                        duracloud.get_mets(obj, function (response) {

                            if (response.error !== undefined && response.error === true) {
                                logger.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets');
                            }

                            let metsResults = metslib.process_mets(obj.sip_uuid, obj.dip_path, response.mets);

                            importlib.save_mets_data(metsResults, function (result) {
                                callback(null, obj);
                            });
                        });
                    });
                }

                function construct_parts(obj, callback) {

                    let parts = [];

                    for (let i = 0; i < obj.display_record.display_record.parts.length; i++) {

                        knexQ('tbl_duracloud_queue')
                            .select('uuid')
                            .where({
                                file: obj.display_record.display_record.parts[i].title.trim(),
                                sip_uuid: obj.sip_uuid
                            })
                            .then(function (data) {

                                if (data[0] !== undefined && data[0].uuid === undefined) {
                                    console.log('no uuid found for ' + obj.sip_uuid);
                                    return false;
                                }

                                console.log(data[0].uuid);

                                obj.display_record.display_record.parts[i].object = obj.dip_path + '/objects/' + data[0].uuid + '-' + obj.display_record.display_record.parts[i].title.replace('tif', 'jp2');
                                obj.display_record.display_record.parts[i].thumbnail = obj.dip_path + '/thumbnails/' + data[0].uuid + '.jpg';
                                // parts.push(obj.display_record.display_record.parts[i]);

                                if ((i + 1) === obj.display_record.display_record.parts.length) {

                                    setTimeout(function () {

                                        knex(REPO_OBJECTS)
                                            .where({
                                                sip_uuid: obj.sip_uuid,
                                                is_active: 1
                                            })
                                            .update({
                                                mods: obj.recordObj.mods,
                                                display_record: JSON.stringify(obj.display_record)
                                            })
                                            .then(function (data) {

                                                request.post({
                                                    url: config.apiUrl + '/api/admin/v1/indexer?api_key=' + config.apiKey,
                                                    form: {
                                                        'sip_uuid': obj.sip_uuid
                                                    }
                                                }, function (error, httpResponse, body) {

                                                    if (error) {
                                                        logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] indexer error ' + error);
                                                        return false;
                                                    }

                                                    if (httpResponse.statusCode === 200) {
                                                        console.log(obj.sip_uuid + ' indexed.');
                                                        // return false;
                                                    } else {
                                                        logger.module().fatal('FATAL: [/repository/model module (update_metadata_cron/update_records/update_mods)] http error ' + httpResponse.statusCode + '/' + body);
                                                        return false;
                                                    }
                                                });

                                                if (obj.recordObj.is_published === 1) {

                                                    request.post({
                                                        url: config.apiUrl + '/api/admin/v1/repo/publish',
                                                        form: {
                                                            'pid': obj.recordObj.pid,
                                                            'type': obj.recordObj.object_type
                                                        }
                                                    }, function (error, httpResponse, body) {

                                                        if (error) {
                                                            logger.module().error('ERROR: [/import/utils module (republish/publish)] indexer error ' + error);
                                                            return false;
                                                        }

                                                        if (httpResponse.statusCode === 201) {
                                                            // console.log('Published ' + recordObj.pid);
                                                            // logger.module().info('INFO: [/import/utils module (republish/publish)] published ' + sip_uuid + '.');
                                                            // return false;
                                                        } else {
                                                            logger.module().error('ERROR: [/import/utils module (republish/publish)] http error ' + httpResponse.statusCode + '/' + body);
                                                            return false;
                                                        }
                                                    });
                                                }

                                                return null;
                                            })
                                            .catch(function (error) {
                                                logger.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error);
                                                throw 'FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error;
                                            });


                                    }, 2000);

                                    return false;
                                }
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/import/utils module (get_broken_compound_records)] Unable to get broken compound records ' + error);
                                throw 'FATAL: [/import/utils module (get_broken_compound_records)] Unable to get broken compound records ' + error;
                            });
                    }
                }

                // 3.)
                async.waterfall([
                    get_mods,
                    create_display_record,
                    get_mets,
                    construct_parts
                ], function (error, results) {

                    // console.log('complete: ' + results);

                    if (error) {
                        logger.module().error('ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error);
                        throw 'ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error;
                    }

                    logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] records updated');
                });

            }, 15000);
        }

        // 2.)
        async.waterfall([
            get_broken_compound_records,
            get_updated_mods_records
        ], function (error, results) {

            if (error) {
                logger.module().error('ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error);
                throw 'ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error;
            }

            logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] records updated');
        });
    }

    // 1.)
    async.waterfall([
        get_session_token,
        update_broken_records
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error);
            throw 'ERROR: [/repository/model module (update_metadata_cron/async.waterfall)] ' + error;
        }

        logger.module().info('INFO: [/repository/model module (update_metadata_cron/async.waterfall)] records updated');
    });

    callback({
        status: 200,
        message: 'fixing compound object mime types'
    });
};