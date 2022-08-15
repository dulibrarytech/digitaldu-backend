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

const LOGGER = require('../../libs/log4');

/**
 *
 * @param DB
 * @param TABLE
 * @type {Create_collection_tasks}
 */
const Search_tasks = class {

    constructor(CLIENT, CONFIG) {
        this.CLIENT = CLIENT;
        this.CONFIG = CONFIG;
    }

    /**
     * Full-text search
     * @param q
     * @param page
     * @param total_on_page
     */
    search = (q, page, total_on_page) => {

        let promise = new Promise((resolve, reject) => {

            // TODO
            // page = page,
            // let total_on_page = 10;
            if (q.length === 0) {
                q = '*:*';
            }

            // TODO
            if (total_on_page === undefined) {
                // total_on_page = total_on_page;
                total_on_page = 10;
            }

            if (page === undefined) {
                page = 0;
            } else {
                page = (page - 1) * total_on_page;
            }

            this.CLIENT.search({
                from: page,
                size: total_on_page,
                index: this.CONFIG.elasticsearch_back_index,
                q: q
            }).then(function (body) {
                resolve(body.hits);
            }, function (error) {
                // TODO: log error
                reject(false);
            });

        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };
}

module.exports = Search_tasks;
