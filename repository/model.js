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

const CONFIG = require('../config/config');
const HTTP = require('../libs/http');
const ASYNC = require('async');
const UUID = require('node-uuid'); // TODO: replace with create uuid in helper
const VALIDATOR = require('validator');
const HANDLES = require('../libs/handles');
const MODS = require('../libs/display-record');
const ARCHIVEMATICA = require('../libs/archivematica');
const SERVICE = require('.//service');
const LOGGER = require('../libs/log4');
const CACHE = require('../libs/cache');
// const DB = require('../config/db')();
const REPO_OBJECTS = 'tbl_objects';
//
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const ES_TASKS = require('../libs/elasticsearch');
const INDEXER_TASKS = require('../indexer/tasks/indexer_index_tasks');

/**
 * Suppresses records
 * @param uuid
 * @param type
 * @param callback
 */
exports.suppress = function (uuid, type, callback) {

    try {

        const ES = new ES_TASKS();
        const OBJ = ES.get_es();
        let is_suppressed = false;

        if (type === 'object') {

            (async function () {

                const SUPRESS_PUBLIC_OBJECT_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
                const SUPRESS_ADMIN_OBJECT_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
                is_suppressed = await SUPRESS_PUBLIC_OBJECT_TASK.delete_record(uuid);

                if (is_suppressed === false) {
                    LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to suppress record.');
                    callback(false);
                }

                LOGGER.module().info('INFO: [/repository/model module (suppress)] record suppressed.');

                let db_record = await DB(DB_TABLES.repo.repo_records)
                .select('display_record')
                .where({
                    pid: uuid,
                    is_active: 1
                });

                let record = JSON.parse(db_record[0].display_record);
                record.is_published = 0;

                let result = await DB(DB_TABLES.repo.repo_records)
                .where({
                    pid: uuid,
                    is_active: 1
                })
                .update({
                    is_published: 0,
                    display_record: JSON.stringify(record)
                });

                if (result === 1) {

                    let indexed_admin_record = await SUPRESS_ADMIN_OBJECT_TASK.get_indexed_record(uuid);
                    indexed_admin_record.is_published = 0;
                    let is_indexed = await SUPRESS_ADMIN_OBJECT_TASK.index_record(indexed_admin_record);

                    if (is_indexed === true) {
                        LOGGER.module().info('INFO: [/repository/model module (suppress)] admin record indexed.');
                        callback(true);
                    } else {
                        LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to index admin record.');
                        callback(false);
                    }

                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to update db.');
                    callback(false);
                }

            })();

        } else if (type === 'collection') {
            // TODO: suppress collection
            // is_suppressed = TASK.delete_record(uuid);
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (suppress)] suppress failed. ' + error.message);
    }
};

/**
 * Publishes records
 * @param uuid
 * @param type
 * @param callback
 */
exports.publish = function (uuid, type, callback) {

    try {

        const ES = new ES_TASKS();
        const OBJ = ES.get_es();
        let is_published = false;

        if (type === 'object') {

            (async function () {

                const PUBLISH_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
                const ADMIN_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);

                let db_record = await DB(DB_TABLES.repo.repo_records)
                .select('display_record')
                .where({
                    pid: uuid,
                    is_active: 1
                });

                let record = JSON.parse(db_record[0].display_record);
                record.is_published = 1;

                let result = await DB(DB_TABLES.repo.repo_records)
                .where({
                    pid: uuid,
                    is_active: 1
                })
                .update({
                    is_published: 1,
                    display_record: JSON.stringify(record)
                });

                if (result === 1) {

                    let indexed_admin_record = await ADMIN_RECORD_TASK.get_indexed_record(uuid);
                    indexed_admin_record.is_published = 1;
                    let is_admin_indexed = await ADMIN_RECORD_TASK.index_record(indexed_admin_record);

                    if (is_admin_indexed === true) {
                        LOGGER.module().info('INFO: [/repository/model module (publish)] admin record indexed.');
                    } else {
                        LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to index admin record.');
                    }

                    is_published = await PUBLISH_RECORD_TASK.index_record(indexed_admin_record);

                    if (is_published === true) {
                        LOGGER.module().info('INFO: [/repository/model module (publish)] record published.');
                        callback(true);
                    } else {
                        LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to publish record.');
                        callback(false);
                    }

                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to update db.');
                    callback(false);
                }

            })();

        } else if (type === 'collection') {
            // TODO: suppress collection
            // is_suppressed = TASK.delete_record(uuid);
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (publish)] publish failed. ' + error.message);
    }
};

/**
 * Gets object display record
 * @param req
 * @param callback
 */
exports.get_display_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0 || !VALIDATOR.isUUID(pid)) {
        callback({
            status: 400,
            message: 'Bad request.',
            data: []
        });

        return false;

    } else if (Array.isArray(pid)) {
        // TODO: bug appears to be caused by http wrapper <-- from publishing process
        // workaround for http bug that creates array instead of string
        pid = pid[0];
    }

    MODS.get_db_display_record_data(pid, function(data) {

        callback({
            status: 200,
            message: 'Object retrieved.',
            data: data
        });
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

    let pid = req.body.pid;
    let thumbnail = req.body.thumbnail_url;
    let obj = {};
    obj.pid = pid;
    obj.thumbnail = thumbnail;

    DB(REPO_OBJECTS)
        .where({
            pid: obj.pid,
            is_active: 1
        })
        .update({
            thumbnail: obj.thumbnail
        })
        .then(function (data) {

            // Get existing record from repository
            MODS.get_display_record_data(obj.pid, function (recordObj) {

                MODS.create_display_record(recordObj, function (result) {

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

                    let where_obj = {
                        is_member_of_collection: recordObj.is_member_of_collection,
                        pid: recordObj.pid,
                        is_active: 1
                    };

                    MODS.update_display_record(where_obj, obj.display_record, function (result) {

                        index(recordObj.sip_uuid, function (result) {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail.');

                                callback({
                                    error: true,
                                    error_message: 'ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail.'
                                });

                                return false;
                            }

                            if (recordObj.is_published === 1) {

                                // wait to make sure updated admin record is ready
                                setTimeout(function () {

                                    let match_phrase = {
                                        'pid': recordObj.sip_uuid
                                    };

                                    reindex(match_phrase, function (result) {

                                        if (result.error === true) {
                                            LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail ' + response.error);
                                        }

                                        return false;
                                    });

                                    CACHE.clear_cache();

                                }, 7000);
                            }

                            return false;
                        });
                    });
                });
            });

            callback({
                status: 201,
                message: 'Thumbnail updated.'
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error);
            throw 'FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error;
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

        DB(REPO_OBJECTS)
            .count('uri as uri')
            .where('uri', VALIDATOR.unescape(data.uri))
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
                LOGGER.module().fatal('FATAL: [/repository/model module (create_collection_object)] unable to check uri ' + error);
            });
    }

    function get_session_token(obj, callback) {

        if (obj.dupe === true) {
            obj.session = null;
            callback(null, obj);
            return false;
        }

        (async () => {

            let uriArr = data.uri.split('/');
            let response = await HTTP.get({
                endpoint: '/api/admin/v1/import/metadata/session'
            });

            if (response.error === true) {
                obj.session = null;
                callback(null, obj);
            } else {
                obj.mods_id = uriArr[uriArr.length - 1];
                obj.uri = data.uri;
                obj.session = response.data.session;
                callback(null, obj);
            }

            return false;

        })();
    }

    function get_mods(obj, callback) {

        if (obj.session === null || obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        obj.mods_id = VALIDATOR.unescape(obj.uri);

        SERVICE.get_mods(obj, function (response) {

            if (response.error !== undefined && response.error === true) {

                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_mods)] unable to get mods ' + response.error_message);

                obj.mods = null;
                callback(null, obj);
                return false;
            }

            obj.object_type = 'collection';
            obj.is_member_of_collection = data.is_member_of_collection;
            delete obj.session;
            callback(null, obj);
        });
    }

    function get_pid(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        try {
            obj.pid = UUID(CONFIG.uuidDomain, UUID.DNS);
            obj.sip_uuid = obj.pid;
            callback(null, obj);
        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_pid)] unable to generate uuid');
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

        LOGGER.module().info('INFO: [/repository/model module (create_collection_object/get_handle)] getting handle');

        HANDLES.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_handle/handles.create_handle)] handle error');
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

        let uriArr = obj.mods_id.split('/');
        obj.mods_id = uriArr[uriArr.length - 1];

        MODS.create_display_record(obj, function (result) {
            obj.display_record = result;
            callback(null, obj);
        });
    }

    function save_record(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        let record = {};
        record.handle = obj.handle;
        record.mods_id = obj.mods_id;
        record.uri = VALIDATOR.unescape(obj.uri); // TODO: test
        record.mods = obj.mods;
        record.object_type = obj.object_type;
        record.is_member_of_collection = obj.is_member_of_collection;
        record.pid = obj.pid;
        record.sip_uuid = obj.sip_uuid;
        record.display_record = obj.display_record;

        DB(REPO_OBJECTS)
            .insert(record)
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (create_collection_object/save_record)] unable to save collection record ' + error);
                obj.error = 'FATAL: unable to save collection record ' + error;
                callback(null, obj);
            });
    }

    function index_collection(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        index(obj.sip_uuid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record.');
                return false;
            }

            callback(null, obj);
        });
    }

    ASYNC.waterfall([
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
            LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/async.waterfall)] ' + error);
        }

        if (results.dupe !== undefined && results.dupe === true) {

            callback({
                status: 200,
                message: 'Cannot create duplicate collection object.'
            });

        } else {

            LOGGER.module().info('INFO: [/repository/model module (create_collection_object/async.waterfall)] collection record saved');

            callback({
                status: 201,
                message: 'Object created.',
                data: [{'pid': results.pid}]
            });
        }
    });
};

/**
 * Recreates display record
 * @param req
 * @param callback
 */
exports.reset_display_record = function (req, callback) {

    if (req.body.pid === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    function create_display_record(callback) {

        let obj = {};
        let sip_uuid = req.body.pid;

        MODS.get_display_record_data(sip_uuid, function(record) {

            MODS.create_display_record(record, function (display_record) {

                let recordObj = JSON.parse(display_record);
                let where_obj = {
                    is_member_of_collection: recordObj.is_member_of_collection,
                    pid: recordObj.pid,
                    is_active: 1
                };

                MODS.update_display_record(where_obj, display_record, function(result) {
                    obj.sip_uuid = recordObj.pid;
                    obj.is_published = recordObj.is_published;
                    callback(null, obj);
                });
            });
        });
    }

    function admin_index(obj, callback) {

        // update admin index
        index(obj.sip_uuid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] indexer error.');
                obj.admin_index = false;
                callback(null, obj);
                return false;
            }

            obj.admin_index = true;
            callback(null, obj);
            return false;
        });
    }

    function public_index(obj, callback) {

        if (obj.is_published === 1) {

            // update public index
            index(obj.sip_uuid, function (result) {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] indexer error.');
                    obj.public_index = false;
                    callback(null, obj);
                    return false;
                }

                obj.public_index = true;
                callback(null, obj);
                return false;
            });

        } else {
            obj.public_index = false;
            callback(null, obj);
        }
    }

    ASYNC.waterfall([
        create_display_record,
        admin_index,
        public_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        LOGGER.module().info('INFO: [/repository/model module (reset_display_record/async.waterfall)] display record reset');

        callback({
            status: 201,
            message: 'Display record(s) updated.'
        });
    });
};

/**
 * Deletes repository object (DB, Index, and creates archivematica delete request)
 * @param req
 * @param callback
 */
exports.delete_object = function (req, callback) {

    let pid = req.body.pid;
    let delete_reason = req.body.delete_reason;

    function check_if_published(callback) {

        let obj = {};
        obj.pid = pid;
        obj.delete_reason = delete_reason;

        DB(REPO_OBJECTS)
            .count('is_published as is_published')
            .where({
                pid: obj.pid,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                // delete only if object is not published
                if (data[0].is_published === 0) {
                    obj.is_published = false;
                } else {
                    obj.is_published = true;
                }

                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error;
            });
    }

    function delete_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                pid: obj.pid
            })
            .update({
                is_active: 0
            })
            .then(function (data) {

                if (data === 1) {
                    callback(null, obj);
                }
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object)] unable to delete record ' + error;
            });
    }

    function unindex_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        unindex(obj.pid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index.');
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            callback(null, obj);
        });
    }

    function delete_aip_request(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        ARCHIVEMATICA.delete_aip_request(obj, function (result) {

            if (result.error === false) {

                let json = JSON.parse(result.data);
                obj.delete_id = json.id;

                DB(REPO_OBJECTS)
                    .where({
                        pid: obj.pid
                    })
                    .update({
                        delete_id: obj.delete_id
                    })
                    .then(function (data) {

                        if (data === 1) {
                            LOGGER.module().info('INFO: [/repository/model module (delete_object/delete_aip_request)] delete id ' + obj.delete_id + ' saved');
                            callback(null, obj);
                        }
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error);
                        throw 'FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error;
                    });

            } else {
                LOGGER.module().error('ERROR: [/repository/model module (delete_object/delete_aip_request)] unable to create delete aip request');
                obj.delete_id = false;
            }
        });
    }

    ASYNC.waterfall([
        check_if_published,
        delete_record,
        unindex_record,
        delete_aip_request
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] ' + error);
        }

        // delete link only appears when record is unpublished
        if (results.is_published === true) {

            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] Cannot delete published object. ');
            return false;
        }

        LOGGER.module().info('INFO: [/repository/model module (delete_object/async.waterfall)] object deleted.');
    });

    callback({
        status: 204,
        message: 'Delete object.'
    });
};

/**
 * Adds transcript to existing record and re-indexes
 * @param req
 * @param callback
 */
exports.save_transcript = function (req, callback) {

    let sip_uuid = req.body.sip_uuid;
    let transcript = req.body.transcript;

    if (sip_uuid === undefined || transcript === undefined) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });
    }

    DB(REPO_OBJECTS)
        .where({
            pid: sip_uuid
        })
        .update({
            transcript: transcript
        })
        .then(function (data) {

            if (data === 1) {

                LOGGER.module().info('INFO: [/repository/model module (add_transcript)] Transcript saved to DB');

                MODS.get_db_display_record_data(sip_uuid, function(data) {

                    let record = JSON.parse(data[0].display_record);
                    record.transcript = transcript;

                    let where_obj = {
                        sip_uuid: sip_uuid,
                        is_active: 1
                    };

                    MODS.update_display_record(where_obj, JSON.stringify(record),function(result) {

                        (async () => {

                            let data = {
                                'sip_uuid': sip_uuid,
                                'fragment': {
                                    doc: {
                                        transcript: transcript
                                    }
                                }
                            };

                            let response = await HTTP.put({
                                endpoint: '/api/admin/v1/indexer/update_fragment',
                                data: data
                            });

                            let result = {};

                            if (response.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (update_fragment)] unable to update transcript.');
                                result.error = true;
                            } else if (response.data.status === 201) {
                                result.error = false;
                            }

                            if (result.error === false) {

                                if (record.is_published === 1) {

                                    let match_phrase = {
                                        'pid': sip_uuid
                                    };

                                    setTimeout(function() {

                                        // moves updated record to public index if already published
                                        reindex(match_phrase, function (result) {

                                            if (result.error === true) {
                                                LOGGER.module().error('ERROR: [/repository/model module (save_transcript)] unable to copy record to public index.');
                                            }
                                        });

                                    }, 3000);
                                }

                                callback({
                                    status: 201,
                                    message: 'Transcript Saved.'
                                });

                            } else if (result.error === true) {
                                callback({
                                    status: 200,
                                    message: 'Transcript not Saved.'
                                });
                            }

                        })();
                    });
                });
            }
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/repository/model module (add_transcript)] Unable to save transcript ' + error);
            throw 'FATAL: [/repository/model module (add_transcript)] Unable to save transcript ' + error;
        });
};