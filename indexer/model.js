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
const SERVICE = require('../indexer/service');
const MODS = require('../libs/display-record');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const ES_TASKS = require('../libs/elasticsearch');
const INDEXER_UTILS_TASKS = require('../indexer/tasks/indexer_index_utils_tasks');
const INDEXER_TASKS = require('../indexer/tasks/indexer_index_tasks');
const LOGGER = require('../libs/log4');

/**
 * Reindex repository
 * @param callback
 */
exports.reindex = function (callback) {

    try {

        (async function () {

            const ES = new ES_TASKS();
            const OBJ = ES.get_es();
            const INDEXER_UTILS_BACKEND_TASK = new INDEXER_UTILS_TASKS(OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const INDEXER_UTILS_FRONTEND_TASK = new INDEXER_UTILS_TASKS(OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const REINDEX_BACKEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const REINDEX_FRONTEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
            const is_backend_exists = await INDEXER_UTILS_BACKEND_TASK.check_index();
            const is_frontend_exists = await INDEXER_UTILS_FRONTEND_TASK.check_index();

            if (is_backend_exists === true) {
                await INDEXER_UTILS_BACKEND_TASK.delete_index();
                await INDEXER_UTILS_BACKEND_TASK.create_index();
                await INDEXER_UTILS_BACKEND_TASK.create_mappings();
            }

            if (is_frontend_exists === true) {
                await INDEXER_UTILS_FRONTEND_TASK.delete_index();
                await INDEXER_UTILS_FRONTEND_TASK.create_index();
                await INDEXER_UTILS_FRONTEND_TASK.create_mappings();
            }

            await REINDEX_BACKEND_TASK.reset_indexed_flags();

            let index_timer = setInterval(async () => {

                const backend_records = await REINDEX_BACKEND_TASK.get_record(DB_TABLES, false);

                console.log(backend_records.length + ' record queried');

                if (backend_records.length === 0) {
                    clearInterval(index_timer);
                    LOGGER.module().info('INFO: [/indexer/model (reindex)] reindex complete.');
                    return false;
                }

                let backend_index_record = await REINDEX_BACKEND_TASK.get_index_record(backend_records[0].pid);
                backend_index_record = JSON.parse(backend_index_record.display_record);

                LOGGER.module().info('INFO: [/indexer/model (reindex)] Record TITLE: ' + backend_index_record.display_record.title);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] indexing ' + backend_index_record.object_type + ' record ' + backend_index_record.pid);

                if (backend_index_record.object_type === 'collection') {

                    let collection_record = {};
                    collection_record.pid = backend_index_record.pid;
                    collection_record.uri = backend_index_record.uri;
                    collection_record.is_member_of_collection = backend_index_record.is_member_of_collection;
                    collection_record.handle = backend_index_record.handle;
                    collection_record.object_type = backend_index_record.object_type;
                    collection_record.title = backend_index_record.display_record.title;
                    collection_record.thumbnail = backend_index_record.thumbnail;
                    collection_record.is_published = backend_index_record.is_published;
                    collection_record.date = backend_index_record.created;

                    if (backend_index_record.display_record.notes !== undefined) {

                        for (let i = 0; i < backend_index_record.display_record.notes.length; i++) {

                            if (backend_index_record.display_record.notes[i].type === 'abstract') {
                                collection_record.abstract = backend_index_record.display_record.notes[i].content.toString();
                            }
                        }
                    }

                    collection_record.display_record = {
                        title: backend_index_record.display_record.title,
                        abstract: collection_record.abstract
                    };

                    let is_indexed = await REINDEX_BACKEND_TASK.index_record(collection_record);

                    if (is_indexed === true) {
                        LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + collection_record.object_type + ' record ' + collection_record.pid + ' indexed');
                    }

                    if (collection_record.is_published === 1) {

                        let is_published = await REINDEX_FRONTEND_TASK.index_record(collection_record);

                        if (is_published === true) {
                            LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + collection_record.object_type + ' record ' + collection_record.pid + ' published.');
                        }
                    }

                } else if (backend_index_record.object_type === 'object') {

                    let is_indexed = await REINDEX_BACKEND_TASK.index_record(backend_index_record);

                    if (is_indexed === true) {
                        LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' indexed');
                    }

                    if (backend_index_record.is_published === 1) {

                        let is_published = await REINDEX_FRONTEND_TASK.index_record(backend_index_record);

                        if (is_published === true) {
                            LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' published.');
                        }
                    }
                }

                let is_status_updated = await REINDEX_BACKEND_TASK.update_indexing_status(backend_index_record.pid);

                if (is_status_updated === false) {
                    LOGGER.module().error('ERROR: [/indexer/model (reindex)] reindex HALTED.');
                }

            }, 500);

            callback({
                status: 200,
                message: 'Reindexing repository'
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/indexer/model (reindex)] reindex failed. ' + error.message);
    }
};

/**
 * Removes record from public index
 * @param req
 * @param callback
 */
exports.unindex_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.unindex_record({
        index: CONFIG.elasticSearchFrontIndex,
        id: pid
    }, function (response) {

        if (response.result === 'deleted') {

            callback({
                status: 204,
                message: 'record unindexed'
            });

        } else {

            callback({
                status: 500,
                data: 'unable to remove record from index'
            });
        }
    });
};

/**
 * Removes record from admin index
 * @param req
 * @param callback
 */
exports.unindex_admin_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.unindex_record({
        index: CONFIG.elasticSearchBackIndex,
        id: pid
    }, function (response) {

        if (response.result === 'deleted') {

            callback({
                status: 204,
                message: 'record admin unindexed'
            });

        } else {

            callback({
                status: 500,
                data: 'unable to remove admin record from index'
            });
        }
    });
};

/**
 * indexes all published records to public index after full reindex
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.republish_record = function (req, callback) {

    let pid = req.body.sip_uuid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let index_name = CONFIG.elasticSearchFrontIndex;

    function index(pid, index_name) {

        DB(REPO_OBJECTS)
        .select('*')
        .where({
            pid: pid,
            is_published: 1,
            is_indexed: 0,
            is_active: 1
        })
        .whereNot({
            display_record: null
        })
        .limit(1)
        .then(function (data) {

            if (data.length > 0) {

                let record = JSON.parse(data[0].display_record);
                // TODO: update to use display record lib
                // collection record
                if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                    let collection_record = {};
                    collection_record.pid = data[0].pid;
                    collection_record.uri = data[0].uri;
                    collection_record.is_member_of_collection = data[0].is_member_of_collection;
                    collection_record.handle = data[0].handle;
                    collection_record.object_type = data[0].object_type;
                    collection_record.title = record.display_record.title;
                    collection_record.thumbnail = data[0].thumbnail;
                    collection_record.is_published = data[0].is_published;
                    collection_record.date = data[0].created;

                    // get collection abstract
                    if (record.display_record.notes !== undefined) {

                        for (let i = 0; i < record.display_record.notes.length; i++) {

                            if (record.display_record.notes[i].type === 'abstract') {
                                collection_record.abstract = record.display_record.notes[i].content.toString();
                            }
                        }
                    }

                    collection_record.display_record = {
                        title: record.display_record.title,
                        abstract: collection_record.abstract
                    };

                    record = collection_record;

                } else {

                    if (record.display_record.language !== undefined) {

                        if (typeof record.display_record.language !== 'object') {

                            let language = {
                                language: record.display_record.language
                            };

                            record.display_record.t_language = language;
                            delete record.display_record.language;

                        } else {
                            record.display_record.t_language = record.display_record.language;
                            delete record.display_record.language;
                        }
                    }

                    record.created = data[0].created;
                }

                // TODO: figure out why some records are getting their is_published value changed to 0 (unpublished)
                // Everything getting funneled through here is published
                if (record.is_published === 0) {
                    record.is_published = 1;
                }

                SERVICE.index_record({
                    index: index_name,
                    id: record.pid,
                    body: record
                }, function (response) {

                    if (response.result === 'created' || response.result === 'updated') {

                        DB(REPO_OBJECTS)
                        .where({
                            pid: record.pid
                        })
                        .update({
                            is_indexed: 1
                        })
                        .then(function (data) {

                            if (data === 1) {

                                setTimeout(function () {
                                    // index next record
                                    index(index_name);
                                }, INDEX_TIMER);

                            } else {
                                LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] more than one record was updated');
                            }

                        })
                        .catch(function (error) {
                            LOGGER.module().fatal('FATAL: [/indexer/model module (republish_record)] unable to update is_indexed field ' + error);
                            throw 'FATAL: [/indexer/model module (republish_record)] unable to update is_indexed field ' + error;
                        });

                    } else {
                        LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] unable to index record');
                    }
                });

            } else {
                LOGGER.module().info('INFO: [/indexer/model module (republish_record)] indexing complete');
            }
        })
        .catch(function (error) {
            LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] unable to get record ' + error);
            throw error;
        });
    }

    // reset is_indexed fields
    DB(REPO_OBJECTS)
    .where({
        pid: pid,
        is_indexed: 1,
        is_active: 1,
        is_published: 1
    })
    .update({
        is_indexed: 0,
        is_active: 1
    })
    .then(function (data) {
        index(pid, index_name);
    })
    .catch(function (error) {
        LOGGER.module().error('ERROR: [/indexer/model module (publish_records)] unable to reset is_indexed fields ' + error);
        throw error;
    });

    callback({
        status: 201,
        message: 'reindexing (publishing) repository records...'
    });
};