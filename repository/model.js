/**

 Copyright 2024 University of Denver

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

const ASYNC = require('async');
const UUID = require('node-uuid'); // TODO: replace with create uuid in helper
const VALIDATOR = require('validator');
const MODS = require('../libs/display-record');
const ARCHIVEMATICA = require('../libs/archivematica');
const SERVICE = require('../repository/service');
const CACHE = require('../libs/cache');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const ES_TASKS = require('../libs/elasticsearch');
const REPOSITORY_TASKS = require('../repository/tasks/repository_tasks');
const THUMBNAIL_TASKS = require('../repository/tasks/thumbnail_tasks');
const INDEXER_TASKS = require('../indexer/tasks/indexer_index_tasks');
const LOGGER = require('../libs/log4');

/**
 * Suppress records
 * @param uuid
 * @param type
 * @param callback
 */
exports.suppress = function (uuid, type, callback) {

    try {

        (async function () {

            const ES = new ES_TASKS();
            const OBJ = ES.get_es();
            const SUPPRESS_PUBLIC_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const SUPPRESS_ADMIN_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);

            if (type === 'object') {

                let is_suppressed = await suppress_record(SUPPRESS_PUBLIC_RECORD_TASK, SUPPRESS_ADMIN_RECORD_TASK, uuid, type);

                if (is_suppressed === true) {
                    callback(true);
                } else {
                    callback(false);
                }

            } else if (type === 'collection') {

                let is_suppressed = await suppress_records(SUPPRESS_PUBLIC_RECORD_TASK, SUPPRESS_ADMIN_RECORD_TASK, uuid, type);

                if (is_suppressed === true) {
                    callback(true);
                } else {
                    callback(false);
                }
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (suppress)] suppress failed. ' + error.message);
    }
};

/**
 * Suppresses single record
 * @param SUPPRESS_PUBLIC_RECORD_TASK
 * @param SUPPRESS_ADMIN_RECORD_TASK
 * @param uuid
 * @param type
 */
async function suppress_record (SUPPRESS_PUBLIC_RECORD_TASK, SUPPRESS_ADMIN_RECORD_TASK, uuid, type) {

    try {

        const REPO_TASKS = new REPOSITORY_TASKS(DB, DB_TABLES);
        let is_suppressed = await SUPPRESS_PUBLIC_RECORD_TASK.delete_record(uuid);

        if (is_suppressed === false) {
            LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to suppress record.');
            return false;
        }

        LOGGER.module().info('INFO: [/repository/model module (suppress)] record suppressed.');

        const db_record = await REPO_TASKS.get_record(uuid, type, null);
        let record = JSON.parse(db_record[0].display_record);
        record.is_published = 0;
        const result = await REPO_TASKS.update_record(uuid, type, record, 0);

        if (result === 1) {

            let indexed_admin_record = await SUPPRESS_ADMIN_RECORD_TASK.get_indexed_record(uuid);
            indexed_admin_record.is_published = 0;
            let is_indexed = await SUPPRESS_ADMIN_RECORD_TASK.index_record(indexed_admin_record);

            if (is_indexed === true) {
                LOGGER.module().info('INFO: [/repository/model module (suppress)] admin record indexed.');
                return true;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to index admin record.');
                return false;
            }

        } else {
            LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to update db.');
            return false;
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to suppress record. ' + error.message);
    }
}

/**
 * Suppress collection
 * @param SUPPRESS_PUBLIC_RECORD_TASK
 * @param SUPPRESS_ADMIN_RECORD_TASK
 * @param uuid
 * @param type
 */
async function suppress_records (SUPPRESS_PUBLIC_RECORD_TASK, SUPPRESS_ADMIN_RECORD_TASK, uuid, type) {

    const REPO_TASKS = new REPOSITORY_TASKS(DB, DB_TABLES);
    let is_suppressed = await SUPPRESS_PUBLIC_RECORD_TASK.delete_record(uuid);

    if (is_suppressed === false) {
        LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to suppress records.');
    }

    LOGGER.module().info('INFO: [/repository/model module (suppress)] collection record suppressed.');

    const db_record = await REPO_TASKS.get_record(uuid, type, null);
    let record = JSON.parse(db_record[0].display_record);
    record.is_published = 0;
    const result = await REPO_TASKS.update_record(uuid, type, record, 0);

    if (result === 1) {

        let indexed_admin_record = await SUPPRESS_ADMIN_RECORD_TASK.get_indexed_record(uuid);
        indexed_admin_record.is_published = 0;
        let is_indexed = await SUPPRESS_ADMIN_RECORD_TASK.index_record(indexed_admin_record);

        if (is_indexed === true) {
            LOGGER.module().info('INFO: [/repository/model module (suppress)] admin record indexed.');
        } else {
            LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to index admin record.');
        }

        // process child records
        const result = await REPO_TASKS.update_child_records(uuid,'suppress');
        LOGGER.module().info('INFO: [/repository/model module (suppress)] updated ' + result + ' records');

        // get child records
        const db_records = await REPO_TASKS.get_child_records(uuid, 'suppress');
        let index_timer = setInterval(async () => {

            if (db_records.length === 0 ) {
                LOGGER.module().info('INFO: [/repository/model module (suppress)] collection records suppressed.');
                clearInterval(index_timer);
                return false;
            }

            let record_obj = db_records.pop();
            let record = JSON.parse(record_obj.display_record);

            LOGGER.module().info('INFO: [/repository/model module (suppress)] suppressing record ' + record.pid);
            is_suppressed = await SUPPRESS_PUBLIC_RECORD_TASK.delete_record(record.pid);
            record.is_published = 0;
            const result = REPO_TASKS.update_child_record(uuid, record.pid, record, 0);

            LOGGER.module().info('INFO: [/repository/model module (suppress)] updated ' + result + ' record');

            let indexed_admin_record = await SUPPRESS_ADMIN_RECORD_TASK.get_indexed_record(record.pid);
            indexed_admin_record.is_published = 0;

            let is_indexed = await SUPPRESS_ADMIN_RECORD_TASK.index_record(indexed_admin_record);

            if (is_indexed === true) {
                LOGGER.module().info('INFO: [/repository/model module (suppress)] admin record indexed.');
                return true;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to index admin record.');
                return false;
            }

        }, 500);

        return true;

    } else {
        LOGGER.module().error('ERROR: [/repository/model module (suppress)] db update update failed.');
        return false;
    }
}

/**
 * Publishes records
 * @param uuid
 * @param type
 * @param callback
 */
exports.publish = function (uuid, type, callback) {

    try {

        (async function () {

            const ES = new ES_TASKS();
            const OBJ = ES.get_es();
            const PUBLISH_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const ADMIN_RECORD_TASK = new INDEXER_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);

            if (type === 'object') {

                // TODO: check if collection is published
                /*
                let indexed_admin_record = await ADMIN_RECORD_TASK.get_indexed_record(uuid);
                console.log(indexed_admin_record.is);
                if (indexed_admin_record.is_published === 0) {
                    callback(false);
                    return false;
                }
                 */

                let is_published = await publish_record(PUBLISH_RECORD_TASK, ADMIN_RECORD_TASK, uuid, type);

                if (is_published === true) {
                    callback(true);
                } else {
                    callback(false);
                }

            } else if (type === 'collection') {

                let is_published = await publish_records(PUBLISH_RECORD_TASK, ADMIN_RECORD_TASK, uuid, type);

                if (is_published === true) {
                    callback(true);
                } else {
                    callback(false);
                }
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (publish)] publish failed. ' + error.message);
    }
};

/**
 *  Publishes single record
 * @param PUBLISH_RECORD_TASK
 * @param ADMIN_RECORD_TASK
 * @param uuid
 * @param type
 */
async function publish_record (PUBLISH_RECORD_TASK, ADMIN_RECORD_TASK, uuid, type) {

    try {

        const REPO_TASKS = new REPOSITORY_TASKS(DB, DB_TABLES);
        const db_record = await REPO_TASKS.get_record(uuid, type, 0);
        let record = JSON.parse(db_record[0].display_record);
        record.is_published = 1;
        const result = await REPO_TASKS.update_record(uuid, type, record, 1);

        if (result === 1) {

            let indexed_admin_record = await ADMIN_RECORD_TASK.get_indexed_record(uuid);
            indexed_admin_record.is_published = 1;
            let is_admin_indexed = await ADMIN_RECORD_TASK.index_record(indexed_admin_record);

            if (is_admin_indexed === true) {
                LOGGER.module().info('INFO: [/repository/model module (publish)] admin record indexed.');
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to index admin record.');
            }

            let is_published = await PUBLISH_RECORD_TASK.index_record(indexed_admin_record);

            if (is_published === true) {
                LOGGER.module().info('INFO: [/repository/model module (publish)] record published.');
                return true;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to publish record.');
                return false;
            }

        } else {
            LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to update db.');
            return false;
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to publish record. ' + error.message);
    }
}

/**
 * Publishes collections
 * @param PUBLISH_RECORD_TASK
 * @param ADMIN_RECORD_TASK
 * @param uuid
 * @param type
 */
async function publish_records (PUBLISH_RECORD_TASK, ADMIN_RECORD_TASK, uuid, type) {

    try {

        const REPO_TASKS = new REPOSITORY_TASKS(DB, DB_TABLES);
        const db_record = await REPO_TASKS.get_record(uuid, type, 0);
        let record = JSON.parse(db_record[0].display_record);
        record.is_published = 1;
        const result = await REPO_TASKS.update_record(uuid, type, record, 1);

        if (result === 1) {

            // update and re-index admin collection record
            let indexed_admin_record = await ADMIN_RECORD_TASK.get_indexed_record(uuid);
            indexed_admin_record.is_published = 1;
            await ADMIN_RECORD_TASK.index_record(indexed_admin_record);
            let is_published = await PUBLISH_RECORD_TASK.index_record(indexed_admin_record);

            if (is_published === false) {
                LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to publish collection record.');
            }

            LOGGER.module().info('INFO: [/repository/model module (publish)] collection record published.');

            // get unpublished child records
            const db_records = await REPO_TASKS.get_child_records(uuid, 'publish');

            // process child records
            const result = await REPO_TASKS.update_child_records(uuid,'publish');

            LOGGER.module().info('INFO: [/repository/model module (publish)] updated ' + result + ' records');

            let index_timer = setInterval(async () => {

                if (db_records.length === 0) {
                    LOGGER.module().info('INFO: [/repository/model module (publish)] collection child records published.');
                    clearInterval(index_timer);
                    return false;
                }

                let record_obj = db_records.pop();
                let record = JSON.parse(record_obj.display_record);
                record.is_published = 1;

                LOGGER.module().info('INFO: [/repository/model module (publish)] publishing child record ' + record.pid);

                // update db
                const result = REPO_TASKS.update_child_record(uuid, record.pid, record, 1);

                if (result.length === 1) {
                    LOGGER.module().info('INFO: [/repository/model module (publish)] updated ' + result + ' child record');
                }

                let indexed_admin_record = await ADMIN_RECORD_TASK.get_indexed_record(record.pid);
                indexed_admin_record.is_published = 1;
                let is_indexed = await ADMIN_RECORD_TASK.index_record(indexed_admin_record);

                if (is_indexed === true) {
                    LOGGER.module().info('INFO: [/repository/model module (publish)] admin record indexed.');
                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to index admin record.');
                }

                let is_published = await PUBLISH_RECORD_TASK.index_record(indexed_admin_record);

                if (is_published === false) {
                    LOGGER.module().error('ERROR: [/repository/model module (suppress)] unable to publish collection child record.');
                } else {
                    LOGGER.module().info('INFO: [/repository/model module (publish)] child record published ' + record.pid);
                }

            }, 450);

            return true;
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model module (publish)] unable to publish collection record(s). ' + error.message);
    }
}

/**
 * Gets all active unpublished records
 * @param callback
 */
exports.get_unpublished_records = function (callback) {

    try {

        (async function () {

            let unpublished = [];
            let obj = {};
            let collections = await DB(DB_TABLES.repo.repo_records)
            .select('id','pid', 'mods', 'is_published')
            .where({
                is_active: 1,
                object_type: 'collection'
            });

            for (let i=0;i<collections.length;i++) {

                let metadata = JSON.parse(collections[i].mods);
                obj.collection_uuid = collections[i].pid;
                obj.collection_title = metadata.title;

                if (collections[i].is_published === 0) {
                    obj.collection_status = 'unpublished';
                } else if (collections[i].is_published === 1) {
                    obj.collection_status = 'published';
                }

                let child_records = await DB(DB_TABLES.repo.repo_records)
                .select('id','pid', 'mods', 'is_published', 'created')
                .where({
                    is_member_of_collection: collections[i].pid,
                    is_active: 1,
                    is_published: 0
                });

                if (child_records.length > 0) {
                    obj.child_records = child_records;
                    unpublished.push(obj);
                    obj = {};
                } else {
                    obj = {};
                }
            }

            callback({
                status: 200,
                message: 'Unpublished records.',
                data: unpublished
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/import/model module (get_unpublished_records)] unable to get unpublished records ' + error.message);
    }
};

/**
 * Gets display record
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

    MODS.get_db_display_record_data(pid, function (data) {

        callback({
            status: 200,
            message: 'Object retrieved.',
            data: data
        });
    });
};

/**
 * Updates thumbnail
 * @param pid
 * @param thumbnail
 * @param callback
 */
exports.update_thumbnail = function (pid, thumbnail, callback) {

    try {

        (async function() {

            const TASK = new THUMBNAIL_TASKS(pid, thumbnail);
            const is_updated = await TASK.update_thumbnail();

            if (is_updated === false) {
                callback({
                    status: 200,
                    message: 'Unable to update thumbnail'
                });
            } else {

                CACHE.clear_cache();

                callback({
                    status: 201,
                    message: 'Thumbnail updated.'
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/repository/model (update_thumbnail)] unable to update thumbnail ' + error.message);
    }
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

/** TODO: deprecate
 * Gets the most recent ingested records
 * @param callback
 */
exports.get_recent_ingests = function (callback) {

    try {

        (async function () {

            let records = await DB(DB_TABLES.repo.repo_records)
            .select('id','is_member_of_collection', 'pid', 'mods','uri','mime_type', 'is_published', 'created')
            .where({
                is_active: 1,
                object_type: 'object'
            })
            .limit(1000)
            .orderBy('id', 'desc');

            let response = [];
            let timer = setInterval(async () => {

                if (records.length === 0) {

                    clearInterval(timer);

                    callback({
                        status: 200,
                        message: 'Complete records.',
                        data: response
                    });

                    return false;
                }

                let record = records.pop();

                let collection_record = await DB(DB_TABLES.repo.repo_records)
                .select('mods')
                .where({
                    pid: record.is_member_of_collection,
                    object_type: 'collection'
                });

                let metadata = JSON.parse(collection_record[0].mods);
                record.collection_title = metadata.title;
                response.push(record);

            }, 0);

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/import/model module (get_recent_ingests)] unable to get recently ingested records ' + error.message);
    }
};

/** TODO: deprecate
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

            MODS.get_db_display_record_data(sip_uuid, function (data) {

                let record = JSON.parse(data[0].display_record);
                record.transcript = transcript;

                let where_obj = {
                    sip_uuid: sip_uuid,
                    is_active: 1
                };

                MODS.update_display_record(where_obj, JSON.stringify(record), function (result) {

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

                                setTimeout(function () {

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

/** TODO: refactor/deprecate?
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