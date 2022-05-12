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

const HTTP = require('../../libs/http');
const LOGGER = require('../../libs/log4');

const Reindex_tasks = class {

    constructor(ES, INDEX, DB, TABLE) {
        this.ES = ES;
        this.INDEX = INDEX;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Checks if the backend index exists
     */
    check_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let result = true;
                let response = await HTTP.head({
                    url: this.ES + '/' + this.INDEX
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/tasks (check_backend_index)] request failed. Backend index does not exist.');
                    result = false;
                }

                resolve(result);

            })();
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Deletes backend (admin) index
     */
    delete_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let is_deleted = true;
                let data = {
                    'index_name': this.INDEX
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/index/delete', // TODO: get from endpoints.js
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/tasks (delete_index)] backend indexer error ' + response.error);
                    is_deleted = false;
                }

                resolve(is_deleted);

            })();
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Creates index (admin)
     */
    create_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let is_created = true;
                let data = {
                    'index_name': this.INDEX
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/index/create',
                    data: data
                });

                if (response.error === true) {
                    is_created = false;
                    LOGGER.module().error('ERROR: [/import/utils module (backend_reindex/create_index/create)] backend indexer error ' + response.error);
                }

                resolve(is_created);

            })();
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * indexes repository records
     * @return {boolean}
     */
    index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let is_indexing = true;
                let data = {
                    'index_name': this.INDEX,
                    'reindex': true
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/all',  // TODO: get from endpoints.js
                    data: data
                });

                if (response.error === true) {
                    is_indexing = false;
                    LOGGER.module().error('ERROR: [/import/utils module (reindex_backend/index/reindex)] backend indexer error ' + response.error);
                }

                resolve(is_indexing);

            })();
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Monitors index progress
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

                    return null;
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor backend index progress ' + error);
                    resolve(false);
                });

        });

        return promise.then((result) => {
            return result;
        });
    }
};

module.exports = Reindex_tasks;
