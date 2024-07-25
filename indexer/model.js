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

const CACHE = require('../libs/cache');
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
            const REINDEX_BACKEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
            const REINDEX_FRONTEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            const is_backend_exists = await INDEXER_UTILS_BACKEND_TASK.check_index();
            const is_frontend_exists = await INDEXER_UTILS_FRONTEND_TASK.check_index();

            if (is_backend_exists === true) {
                await INDEXER_UTILS_BACKEND_TASK.delete_index();
                await INDEXER_UTILS_BACKEND_TASK.create_index();
                await INDEXER_UTILS_BACKEND_TASK.create_mappings(OBJ.es_config.elasticsearch_index_back);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] backend index created.');
            } else {
                await INDEXER_UTILS_BACKEND_TASK.create_index();
                await INDEXER_UTILS_BACKEND_TASK.create_mappings(OBJ.es_config.elasticsearch_index_back);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] backend index created.');
            }

            if (is_frontend_exists === true) {
                await INDEXER_UTILS_FRONTEND_TASK.delete_index();
                await INDEXER_UTILS_FRONTEND_TASK.create_index();
                await INDEXER_UTILS_FRONTEND_TASK.create_mappings(OBJ.es_config.elasticsearch_index_front);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] frontend index created.');
            } else {
                await INDEXER_UTILS_FRONTEND_TASK.create_index();
                await INDEXER_UTILS_BACKEND_TASK.create_mappings(OBJ.es_config.elasticsearch_index_front);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] frontend index created.');
            }

            await REINDEX_BACKEND_TASK.reset_indexed_flags();

            let index_timer = setInterval(async () => {

                const backend_records = await REINDEX_BACKEND_TASK.get_record(DB_TABLES, false);

                console.log(backend_records.length + ' record queried');

                if (backend_records.length === 0) {
                    clearInterval(index_timer);
                    CACHE.clear_cache();
                    LOGGER.module().info('INFO: [/indexer/model (reindex)] reindex complete.');
                    return false;
                }

                let backend_index_record = await REINDEX_BACKEND_TASK.get_index_record(backend_records[0].pid);
                backend_index_record = JSON.parse(backend_index_record.display_record);
                backend_index_record.title = decodeURI(backend_index_record.title);

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
                        LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + collection_record.object_type + ' record ' + collection_record.pid + ' indexed (admin)');
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
                        LOGGER.module().info('INFO: [/indexer/model (reindex)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' indexed (admin)');
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
                    clearInterval(index_timer);
                    LOGGER.module().error('ERROR: [/indexer/model (reindex)] reindex HALTED. Unable to update status');
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
 * indexes records by collection
 * @param uuid
 * @param callback
 */
exports.index_collection_records = function (uuid, callback) {

    try {

        (async function () {

            const ES = new ES_TASKS();
            const OBJ = ES.get_es();
            const REINDEX_BACKEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
            const REINDEX_FRONTEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            await REINDEX_BACKEND_TASK.reset_indexed_flags();

            let index_timer = setInterval(async () => {

                const backend_records = await REINDEX_BACKEND_TASK.get_collection_records(DB_TABLES, uuid);

                console.log(backend_records.length + ' record queried');

                if (backend_records.length === 0) {
                    clearInterval(index_timer);
                    CACHE.clear_cache();
                    LOGGER.module().info('INFO: [/indexer/model (index_collection)] collection reindex complete.');
                    return false;
                }

                let backend_index_record = await REINDEX_BACKEND_TASK.get_index_record(backend_records[0].pid);
                backend_index_record = JSON.parse(backend_index_record.display_record);
                backend_index_record.title = decodeURI(backend_index_record.title);

                LOGGER.module().info('INFO: [/indexer/model (reindex)] Record TITLE: ' + backend_index_record.display_record.title);
                LOGGER.module().info('INFO: [/indexer/model (reindex)] indexing ' + backend_index_record.object_type + ' record ' + backend_index_record.pid);

                let is_indexed = await REINDEX_BACKEND_TASK.index_record(backend_index_record);

                if (is_indexed === true) {
                    LOGGER.module().info('INFO: [/indexer/model (index_collection)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' indexed (admin)');
                }

                if (backend_index_record.is_published === 1) {

                    let is_published = await REINDEX_FRONTEND_TASK.index_record(backend_index_record);

                    if (is_published === true) {
                        LOGGER.module().info('INFO: [/indexer/model (index_collection)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' published.');
                    }
                }

                let is_status_updated = await REINDEX_BACKEND_TASK.update_indexing_status(backend_records[0].pid);

                if (is_status_updated === false) {
                    clearInterval(index_timer);
                    LOGGER.module().error('ERROR: [/indexer/model (index_collection)] Collection reindex HALTED. Unable to update status');
                }

            }, 500);

            callback({
                status: 200,
                message: 'Reindexing collection records'
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/indexer/model (reindex)] reindex failed. ' + error.message);
    }
};

/**
 * Indexes single object record
 * @param uuid
 * @param callback
 */
exports.index_object_record = function (uuid, callback) {

    try {

        (async function () {

            const ES = new ES_TASKS();
            const OBJ = ES.get_es();
            const REINDEX_BACKEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
            const REINDEX_FRONTEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            await REINDEX_BACKEND_TASK.reset_indexed_flags();

            let backend_index_record = await REINDEX_BACKEND_TASK.get_index_record(uuid);
            backend_index_record = JSON.parse(backend_index_record.display_record);
            backend_index_record.title = decodeURI(backend_index_record.title);

            LOGGER.module().info('INFO: [/indexer/model (index_object_record)] Record TITLE: ' + backend_index_record.display_record.title);
            LOGGER.module().info('INFO: [/indexer/model (index_object_record)] indexing ' + backend_index_record.object_type + ' record ' + backend_index_record.pid);

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
                    title: decodeURI(backend_index_record.display_record.title),
                    abstract: collection_record.abstract
                };

                let is_indexed = await REINDEX_BACKEND_TASK.index_record(collection_record);

                if (is_indexed === true) {
                    LOGGER.module().info('INFO: [/indexer/model (index_object_record)] ' + collection_record.object_type + ' record ' + collection_record.pid + ' indexed (admin)');
                }

                if (collection_record.is_published === 1) {

                    let is_published = await REINDEX_FRONTEND_TASK.index_record(collection_record);

                    if (is_published === true) {
                        LOGGER.module().info('INFO: [/indexer/model (index_object_record)] ' + collection_record.object_type + ' record ' + collection_record.pid + ' published.');
                    }
                }

            } else if (backend_index_record.object_type === 'object') {

                let is_indexed = await REINDEX_BACKEND_TASK.index_record(backend_index_record);

                if (is_indexed === true) {
                    LOGGER.module().info('INFO: [/indexer/model (index_object_record)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' indexed (admin)');
                }

                if (backend_index_record.is_published === 1) {

                    let is_published = await REINDEX_FRONTEND_TASK.index_record(backend_index_record);

                    if (is_published === true) {
                        LOGGER.module().info('INFO: [/indexer/model (index_object_record)] ' + backend_index_record.object_type + ' record ' + backend_index_record.pid + ' published.');
                    }
                }
            }

            let is_status_updated = await REINDEX_BACKEND_TASK.update_indexing_status(backend_index_record.pid);

            if (is_status_updated === false) {
                clearInterval(index_timer);
                LOGGER.module().error('ERROR: [/indexer/model (index_object_record)] Object record reindex HALTED. Unable to update status');
            }

            callback({
                status: 200,
                message: 'Reindexing object record'
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/indexer/model (index_object_record)] Object record reindex failed. ' + error.message);
    }
};
