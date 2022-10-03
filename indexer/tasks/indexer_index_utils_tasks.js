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

const FS = require('fs');
const ES_MAPPINGS = './indexer/mappings.json';
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to create ES index
 * @param DB
 * @param TABLE
 * @type {Indexer_display_record_tasks}
 */
const Indexer_index_utils_tasks = class {

    constructor(index_name, CLIENT, CONFIG) {
        this.index_name = index_name;
        this.CLIENT = CLIENT;
        this.CONFIG = CONFIG;
    }

    /**
     * Creates ES index
     */
    create_index = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                this.CLIENT.indices.create({
                    index: this.index_name,
                    body: {
                        'settings': {
                            'number_of_shards': this.CONFIG.number_of_shards,
                            'number_of_replicas': this.CONFIG.number_of_replicas
                        }
                    }

                }).then(function (result) {

                    if (result.acknowledged === true) {
                        LOGGER.module().info('INFO: [/indexer/tasks (create_index)] new index created');
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/indexer/tasks (create_index)] unable to create new index');
                        reject(true);
                    }
                });
            })();
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Creates ES index mappings
     */
    create_mappings = () => {

        let promise = new Promise((resolve, reject) => {

            let mappings_obj = this.get_mappings(),
                body = {
                    properties: mappings_obj
                };

            this.CLIENT.indices.putMapping({
                index: this.index_name,
                body: body
            }).then(function (result) {

                if (result.acknowledged === true) {
                    LOGGER.module().info('INFO: [/indexer/tasks (create_mappings)] mappings created');
                   resolve(true);
                } else {
                    LOGGER.module().error('ERROR: [/indexer/tasks (create_mappings)] unable to create mappings');
                    reject(true);
                }
            });
        });

        return promise.then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    /**
     *  Returns field mappings
     */
    get_mappings = () => {
        return JSON.parse(FS.readFileSync(ES_MAPPINGS, 'utf8'));
    }

    /**
     * Deletes
     * @return {Promise<boolean>}
     */
    delete_index = () => {

        let promise = new Promise((resolve, reject) => {

            this.CLIENT.indices.delete({
                index: this.index_name
            }).then((result) => {

                let message = '';

                if (result.acknowledged === true) {
                    LOGGER.module().info('INFO: [/indexer/service module (create_repo_index/delete_repo_index)] index deleted');
                    resolve(true);
                } else {
                    LOGGER.module().error('ERROR: [/indexer/service module (create_repo_index/delete_repo_index)] unable to delete index (deleteIndex)');
                    reject(true);
                }

                callback({
                    status: 201,
                    message: message
                });

            });
        });

        return promise.then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    };
};

module.exports = Indexer_index_utils_tasks;