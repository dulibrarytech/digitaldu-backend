/**

 Copyright 2024 University of Denver

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

const ES_TASKS = require('../libs/elasticsearch');
const SEARCH_TASKS = require('../search/tasks/search_tasks');

/**
 * Full-text search
 * @param search
 * @param callback
 */
exports.get_search_results = function (search, callback) {

    const ES = new ES_TASKS();
    const OBJ = ES.get_es();
    const TASK = new SEARCH_TASKS(OBJ.es_client);

    search.index = OBJ.es_config.elasticsearch_index_back;

    if (search.q.length === 0) {
        search.q = '*:*';
    }

    if (search.from === undefined) {
        search.from = 0;
    } else {
        search.from = (search.from - 1) * search.size;
    }

    (async function() {

        const SEARCH_RESULTS = await TASK.search_records(search);

        callback({
            status: 200,
            data: SEARCH_RESULTS
        });

    })();
};

/**
 * Full-text search
 * @param req
 * @param callback
 */
/*
exports.get_search_results = function (req, callback) {

    if (req.query.q === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let q = req.query.q,
        page = req.query.page,
        total_on_page = 10;

    if (q.length === 0) {
        q = '*:*';
    }

    if (req.query.total_on_page !== undefined) {
        total_on_page = req.query.total_on_page;
    }

    if (page === undefined) {
        page = 0;
    } else {
        page = (page - 1) * total_on_page;
    }

    CLIENT.search({
        from: page,
        size: total_on_page,
        index: CONFIG.elasticSearchBackIndex,
        q: q
    }).then(function (body) {

        callback({
            status: 200,
            data: body.hits
        });

    }, function (error) {
        callback(error);
    });
};
*/