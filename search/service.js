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

const SEARCH_TASKS = require('../search/tasks/search_tasks');
const {Client} = require("@elastic/elasticsearch");
const LOGGER = require("../libs/log4");
const ES_CONFIG = require('../config/elasticsearch_config')();
const CLIENT = new Client({
    node: ES_CONFIG.elasticsearch_host
});

/**
 * Full-text search
 * @param q
 * @param page
 * @param total_on_page
 * @param callback
 */
exports.search = function (q, page, total_on_page, callback) {

    (async () => {

        try {

            const TASK = new SEARCH_TASKS(CLIENT, ES_CONFIG);
            const data = await TASK.search(q, page, total_on_page);

            if (data !== false) {
                callback({
                    status: 200,
                    message: 'Search record(s) retrieved.',
                    data: data
                });
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/search/service (search)] unable to search ' + error.message);
            callback({
                status: 204,
                message: 'Unable to retrieve Search record(s).'
            });
        }

    })();
};