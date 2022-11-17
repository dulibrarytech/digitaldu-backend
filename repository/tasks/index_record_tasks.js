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

const INDEX_RECORD_LIB = require('../../libs/index_record_lib');
const VALIDATOR_CONFIG = require('../../config/index_records_validator_config')();
const INDEXER_TASKS = require('../../indexer/tasks/indexer_index_tasks');
const LOGGER = require('../../libs/log4');
const ES_CONFIG = require('../../test/elasticsearch_config')();
const ES = require('elasticsearch');
const CLIENT = new ES.Client({
    host: ES_CONFIG.elasticsearch_host
});

/**
 * Updates index record
 * @param uuid
 * @type {Index_record_tasks}
 */
const Index_record_tasks = class {

    constructor(uuid, DB, TABLE) {
        this.UUID = uuid;
        this.DB = DB;
        this.TABLE = TABLE;
        this.RECORD_LIB = new INDEX_RECORD_LIB(this.DB, this.TABLE, VALIDATOR_CONFIG);
    }

    /**
     * Executes tasks to update index record
     */
    update = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    let data;
                    let index_record;
                    let record = {};
                    data = await this.get_index_record_data(this.UUID);
                    index_record = await this.create_index_record(data);
                    record.index_record = index_record;
                    await this.update_index_record(index_record);
                    await this.reindex_index_record(record);
                    resolve(true);
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks/index_record_tasks (update)] Unable to update index record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    };

    /**
     * Gets index record data
     * @returns Promise string
     */
    get_index_record_data = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    resolve(await this.RECORD_LIB.get_index_record_data(this.UUID));
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks/index_record_tasks (get_index_record_data)] Unable to get index record data ' + error.message);
                    reject(false);
                }
            })();
        });

        return promise.then((data) => {
            return data;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Creates updated display record
     * @param data
     * returns Promise
     */
    create_index_record = (data) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    resolve(this.RECORD_LIB.create_index_record(data));
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks/index_record_tasks (create_index_record)] Unable to get create index record: ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((index_record) => {
            return index_record;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Updates index record
     * @param index_record
     */
    update_index_record = (index_record) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    resolve(this.RECORD_LIB.update_index_record(this.UUID, index_record));
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks/index_record_tasks (update_index_record)] Unable to get update index record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((index_record) => {
            return index_record;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Re-indexes index record
     */
    reindex_index_record = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    const INDEX_TASK = new INDEXER_TASKS(this.DB, this.TABLE, CLIENT, ES_CONFIG);
                    let index_record_data = await this.get_index_record_data(this.UUID);
                    let index_record = await this.create_index_record(index_record_data);
                    let record = {};
                    let result;
                    record.index_record = JSON.stringify(index_record);

                    if (index_record.is_published === 1) {
                        result = await INDEX_TASK.index_record(this.UUID, true, record);
                    }

                    if (index_record.is_published === 0) {
                        result = await INDEX_TASK.index_record(this.UUID, false, record);
                    }

                    if (result !== false) {
                        resolve(result);
                    } else {
                        reject(false);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks/index_record_tasks (update_index_record)] Unable to re-index record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Index_record_tasks;
