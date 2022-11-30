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

const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to index record(s)
 * @param DB
 * @param TABLE
 * @type {Indexer_display_record_tasks}
 */
const Indexer_index_tasks = class {

    constructor(DB, TABLE, CLIENT, CONFIG) {
        this.DB = DB;
        this.TABLE = TABLE;
        this.CLIENT = CLIENT;
        this.CONFIG = CONFIG;
    }

    /**
     * Indexes record
     * @param uuid
     * @param is_published
     * @param record
     */
    index_record = (uuid, is_published, record) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let index;

                    if (is_published === true) {
                        index = this.CONFIG.elasticsearch_front_index;
                    } else {
                        index = this.CONFIG.elasticsearch_back_index;
                    }

                    console.log('indexing ' + uuid + ' into ' + index);

                    let response = await this.CLIENT.index({
                        index: index,
                        id: uuid,
                        body: JSON.parse(record.index_record),
                        refresh: true
                    });

                    if (response.statusCode === 201 || response.statusCode === 200) {
                        resolve(response);
                    } else {
                        resolve(false);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (index_record)] unable to index record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Gets record uuid for indexing record
     * @param where_obj
     * returns Promise string
     */
    get_record_uuid = (where_obj) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('uuid')
                .where(where_obj)
                .whereNot({
                    index_record: null
                })
                .limit(1)
                .then((data) => {

                    if (data === undefined || data.length === 0) {
                        resolve(0);
                    }

                    resolve(data[0].uuid);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_record_uuid)] unable to get record ' + error.message);
                    reject(false);
                });
        });

        return promise.then((record) => {
            return record;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Updates is_indexed status flag after a successful record index
     * @param uuid
     * @returns {Promise<unknown>}
     */
    update_indexing_status = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    is_indexed: 1
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/indexer/model module (index_records)] more than one record was updated');
                        reject(false);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/indexer/model module (index_records)] unable to update is_indexed field ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Resets is_indexed DB flags
     * returns Promise string
     */
    reset_indexed_flags = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    is_indexed: 1,
                    is_active: 1
                })
                .update({
                    is_indexed: 0
                })
                .then((data) => {
                    resolve(true);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/indexer/model module (index_records)] unable to reset is_indexed fields ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Moves index record(s) from admin to public index
     * @return {boolean}
     */
    publish = (query) => {
        console.log(query);
        let promise = new Promise((resolve, reject) => {

            this.CLIENT.reindex({
                body: {
                    'source': {
                        'index': this.CONFIG.elasticsearch_back_index,
                        'query': query
                    },
                    'dest': {
                        'index': this.CONFIG.elasticsearch_front_index
                    }
                }
            }, (error, response) => {
                console.log('ERROR', error);
                console.log('RESPOSNE: ', response);
                if (error) {
                    LOGGER.module().error('ERROR: [/indexer/task (publish_records)] unable to publish record(s) ' + error.message);
                    reject(false);
                }

                resolve(response);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    };

    /**
     * Deletes record from public index
     * @param uuid
     */
    suppress = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.CLIENT.delete({
                index: this.CONFIG.elasticsearch_front_index,
                id: uuid
            }, (error, response) => {

                if (error) {
                    LOGGER.module().error('ERROR: [/indexer/tasks (suppress_record)] unable to suppress record ' + error.message);
                    reject(false);
                }

                resolve(response);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Deletes record from admin index
     * @param uuid
     * @return {Promise<unknown | boolean>}
     */
    delete = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.CLIENT.delete({
                index: this.CONFIG.elasticsearch_back_index,
                id: uuid
            }, (error, response) => {

                if (error) {
                    LOGGER.module().error('ERROR: [/indexer/tasks (delete_record)] unable to delete record ' + error.message);
                    reject(false);
                }

                resolve(response);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Indexer_index_tasks;