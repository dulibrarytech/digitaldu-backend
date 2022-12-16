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

const {Client} = require("@elastic/elasticsearch");
const ES_CONFIG = require('../config/elasticsearch_config')();
const INDEXER_UTILS_TASKS = require('./tasks/indexer_index_utils_tasks');
const LOGGER = require('../libs/log4');
const CLIENT = new Client({
    node: ES_CONFIG.elasticsearch_host
});

/**
 * Create new index and mapping
 * @param index_name
 * @param callback
 */
exports.create_index = function (index_name, callback) {

    (async () => {

        let cb = {
            status: 200,
            data: 'Index not created'
        };

        try {

            const INDEX_UTILS_TASKS = new INDEXER_UTILS_TASKS(index_name, CLIENT, ES_CONFIG);
            let is_index_created = await INDEX_UTILS_TASKS.create_index();

            if (is_index_created === true) {

                let is_mappings_created = INDEX_UTILS_TASKS.create_mappings();

                if (is_mappings_created === true) {

                    callback({
                        status: 201,
                        data: 'Creating index...'
                    });

                } else {
                    LOGGER.module().error('ERROR: [/indexer/service module (create_index)] Unable to create index.');
                    callback(cb);
                }

            } else {
                LOGGER.module().error('ERROR: [/indexer/service module (create_index)] Unable to create index.');
                callback(cb);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/service module (create_index)] Unable to create index. ' + error.message);
            callback(cb);
        }

    })();
};

/**
 * Deletes index
 * @param index_name
 * @param callback
 */
exports.delete_index = function (index_name, callback) {

    (async () => {

        let cb = {
            status: 200,
            message: 'Index not deleted.'
        };

        try {

            const INDEX_UTILS_TASKS = new INDEXER_UTILS_TASKS(index_name, CLIENT, ES_CONFIG);
            let is_index_deleted = await INDEX_UTILS_TASKS.delete_index();

            if (is_index_deleted === true) {

                callback({
                    status: 204,
                    message: 'Index deleted.'
                });

            } else {
                callback(cb);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/service module (delete_index)] Unable to delete index ' + error.message);
            callback(cb);
        }
    })();
};
