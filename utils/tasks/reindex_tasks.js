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

const ES = require('elasticsearch');
const HTTP = require('../../libs/http');
const ENDPOINTS = require('../../indexer/endpoints');
const INDEXER_UTILS_TASKS = require('../../indexer/tasks/indexer_index_utils_tasks');
const LOGGER = require('../../libs/log4');

const Reindex_tasks = class {

    constructor(ES_CONFIG, INDEX, DB, TABLE) {
        this.ES_CONFIG = ES_CONFIG;
        this.INDEX = INDEX;
        this.DB = DB;
        this.TABLE = TABLE;
        this.CLIENT = new ES.Client({
            host: this.ES_CONFIG.elasticsearch_host
        });
    }

    /**
     * Checks if the backend index exists
     */
    check_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let response = await HTTP.head({
                    url: this.ES_CONFIG.elasticsearch_host + '/' + this.INDEX
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/tasks (check_index)] request failed. Index does not exist.');
                    reject(false);
                }

                resolve(true);

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Deletes backend (admin) index
     */
    delete_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {
                try {
                    const UTILS_TASKS = new INDEXER_UTILS_TASKS(this.INDEX, this.CLIENT, this.ES_CONFIG);
                    resolve(await UTILS_TASKS.delete_index());
                } catch (error) {
                    LOGGER.module().error('ERROR: [/utils/tasks (check_index)] Unable to delete index.');
                    reject(true);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Creates index
     */
    create_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    const UTILS_TASKS = new INDEXER_UTILS_TASKS(this.INDEX, this.CLIENT, this.ES_CONFIG);
                    resolve(await UTILS_TASKS.create_index());
                } catch(error) {
                    LOGGER.module().error('ERROR: [/import/utils module (backend_reindex/create_index/create)] backend indexer error ' + error.message);
                    reject(true);
                }

                resolve(true);

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Initiates repository records indexing
     * @param index
     * @return boolean
     */
    index = (index) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let data = {
                    'index_name': this.INDEX,
                    'reindex': true,
                    'index': index
                };

                let response = await HTTP.put({
                    endpoint: ENDPOINTS().indexer.indexer_index_records.endpoint,
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/utils module (index)] backend indexer error ' + response.error);
                    reject(false);
                }

                resolve(true);

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Monitors indexing progress
     * @param where_obj
     * @return boolean
     */
    monitor_index_progress = (where_obj) => {

        console.log('Starting monitor...');

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('is_indexed as is_indexed_count')
                .where(where_obj)
                .then((data) => {

                    console.log('Record backend index count: ', data[0].is_indexed_count);

                    if (data[0].is_indexed_count < 50) {
                        resolve(true);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/tasks (monitor_index_progress)] unable to monitor backend index progress ' + error.message);
                    resolve(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Reindex_tasks;
