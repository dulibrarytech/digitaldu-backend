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

const CONFIG = require('../config/elasticsearch_config')(),
    SEARCH_TASKS = require('../search/tasks/search_tasks'),
    ES = require('elasticsearch'),
    CLIENT = new ES.Client({
        host: CONFIG.elasticSearch
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

        const TASK = new SEARCH_TASKS(CLIENT, CONFIG);
        const data = await TASK.search(q, page, total_on_page);

        if (data !== false) {
            callback({
                status: 200,
                message: 'Search record(s) retrieved.',
                data: data
            });
        } else {
            callback({
                status: 500,
                message: 'Unable to retrieve Search record(s).'
            });
        }

    })();
};