/**

 Copyright 2022 University of Denver

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

const ES = require('elasticsearch');
const TIMERS_CONFIG = require('../config/timers_config')();
const ES_CONFIG = require('../config/elasticsearch_config')();
const DB = require('../config/db_config')();
const HELPER = require('../indexer/helper');
const INDEXER_INDEX_RECORD_TASKS = require('../indexer/tasks/indexer_index_record_tasks');
const INDEXER_INDEX_TASKS = require('../indexer/tasks/indexer_index_tasks');
const DB_TABLES = require('../config/db_tables_config')();
const REPO_OBJECTS = DB_TABLES.repo.repo_objects;
const LOGGER = require('../libs/log4');
const CLIENT = new ES.Client({
        host: ES_CONFIG.elasticsearch_host
    });

/**
 * Indexes single repository record
 * @param uuid
 * @param is_published
 * @param callback
 * @returns {boolean}
 */
exports.index_record = (uuid, is_published, callback) => {

    (async () => {

        try {

            const DISPLAY_RECORD_TASKS = new INDEXER_INDEX_RECORD_TASKS(DB, REPO_OBJECTS);
            const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
            let record = await DISPLAY_RECORD_TASKS.get_index_display_record_data(uuid);

            if (record.pid === undefined) {
                record = HELPER.uuid_pid(record);
            }

            let response = await INDEX_TASKS.index_record(uuid, is_published, record);

            if (response.result === 'created' || response.result === 'updated') {

                callback({
                    status: 201,
                    message: 'record indexed'
                });

            }

        } catch (error) {

            callback({
                status: 200,
                message: 'Unable to index record'
            });
        }

    })();
};

/**
 * Indexes all repository records
 * @param index
 * @param callback
 * @returns {boolean}
 */
exports.index_records = (index, callback) => {

    (async () => {

        console.log('indexing...');
        LOGGER.module().info('INFO: [/indexer/model (index_records)] indexing...');

        const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
        const INDEX_RECORD_TASKS = new INDEXER_INDEX_RECORD_TASKS(DB, REPO_OBJECTS);
        let is_published = false;
        let is_reset = await INDEX_TASKS.reset_indexed_flags();
        let where_obj = {};
        where_obj.is_active = 1;
        where_obj.is_indexed = 0;

        if (index === 'frontend') {
            is_published = true;
            where_obj.is_published = 1;
        }

        if (is_reset === false) {
            LOGGER.module().error('ERROR: [/indexer/model (index_records)] is_indexed flag reset failed.');
            return false;
        }

        let timer = setInterval(async () => {

            try {

                let uuid;
                let result;
                let record;
                let response;

                uuid = await INDEX_TASKS.get_record_uuid(where_obj);

                if (uuid === 0 || uuid === undefined) {
                    clearInterval(timer);
                    LOGGER.module().info('INFO: [/indexer/model (index_records)] Full re-indexing complete.');
                    return false;
                }

                record = await INDEX_RECORD_TASKS.get_index_display_record_data(uuid);

                if (record.pid === undefined) {
                    record = HELPER.uuid_pid(record);
                }

                response = await INDEX_TASKS.index_record(uuid, is_published, record);

                if (response.result === 'created' || response.result === 'updated') {

                    LOGGER.module().info('INFO: [/indexer/model (index_records)] ' + uuid + ' indexed.');
                    result = await INDEX_TASKS.update_indexing_status(uuid);

                    if (result !== true) {
                        console.log('index status update failed.');
                        LOGGER.module().error('ERROR: [/indexer/model (index_records)] index status update failed.');
                    }
                }

            } catch (error) {
                LOGGER.module().error('ERROR: [/indexer/model (index_records)] Unable to index record(s). ' + error.message);
            }

        }, TIMERS_CONFIG.index_timer);

    })();

    callback({
        status: 201,
        message: 'Indexing repository records...'
    });
};

/**
 * Copies ES index records from admin to public index
 * @param query
 * @param callback
 */
exports.publish = (query, callback) => {

    (async () => {

        let cb = {
            status: 200,
            message: 'Unable to publish record(s).'
        };

        const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
        let is_published = await INDEX_TASKS.publish(query);

        if (is_published === true) {
            cb = {
                status: 201,
                message: 'record(s) published'
            };
        }

        callback(cb);

    })();
};

/**
 * Removes record from public index
 * @param uuid
 * @param callback
 */
exports.suppress = (uuid, callback) => {

    (async () => {

        let cb = {
            status: 200,
            message: 'Unable to suppress record.'
        };

        const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
        let is_suppressed = await INDEX_TASKS.suppress(uuid);

        if (is_suppressed === true) {
            cb = {
                status: 204,
                message: 'record suppressed.'
            };
        }

        callback(cb);

    })();
};

/**
 * Deletes record from admin index
 * @param uuid
 * @param callback
 */
exports.delete = (uuid, callback) => {

    (async () => {

        let cb = {
            status: 200,
            message: 'Unable to delete record.'
        };

        const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
        let is_deleted = await INDEX_TASKS.delete(uuid);

        if (is_deleted === true) {
            cb = {
                status: 204,
                message: 'record deleted.'
            };
        }

        callback(cb);

    })();
};
