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

            if (q.length === 0) {
                q = '*:*';
            }

            if (total_on_page === undefined) {
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
                LOGGER.module().error('ERROR: [/search/tasks (search)] unable to search index');
                reject(false);
            });

        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     *
     * @param is_member_of_collection
     * @param page
     * @param total_on_page
     * @param sort
     */
    get_records = function (is_member_of_collection, page, total_on_page, sort) {

        let promise = new Promise((resolve, reject) => {

            let total_on_page_default = 10;
            let sort_default = 'title.keyword:asc';

            if (total_on_page === undefined) {
                total_on_page = total_on_page_default;
            }

            if (sort === undefined) {
                sort = sort_default;
            }

            if (page === undefined) {
                page = 0;
            } else {
                page = (page - 1) * total_on_page;
            }

            let query = {
                'query': {
                    'bool': {
                        'must': {
                            'match': {
                                'is_member_of_collection.keyword': is_member_of_collection
                            }
                        }
                    }
                }
            };

            this.CLIENT.search({
                from: page,
                size: total_on_page,
                index: this.CONFIG.elasticsearch_back_index,
                sort: sort,
                body: query
            }).then((body) => {
                resolve(body.hits);
            }, (error) => {
                LOGGER.module().error('ERROR: [/repository/service module (get_records)] Request to Elasticsearch failed: ' + error.message);
                reject(false);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets suppressed records by collection
     * @param uuid
     */
    get_suppressed_records = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            let page = 0
            let total_on_page = 10000;
            let sort = 'title.keyword:asc';
            let query = {
                'query': {
                    'bool': {
                        'must': [{
                            'match': {
                                'is_member_of_collection.keyword': uuid
                            }
                        },
                            {
                                'match': {
                                    'is_published': 0
                                }
                            }]
                    }
                }
            };

            this.CLIENT.search({
                from: page,
                size: total_on_page,
                index: this.CONFIG.elasticsearch_back_index,
                sort: sort,
                body: query
            }).then((body) => {
                resolve(body.hits);
            }, function (error) {
                LOGGER.module().error('ERROR: [/repository/service module (get_suppressed_records)] Request to Elasticsearch failed: ' + error.message);
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
