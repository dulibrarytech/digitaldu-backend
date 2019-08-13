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

const config = require('../config/config'),
    es = require('elasticsearch'),
    client = new es.Client({
        host: config.elasticSearch
    });

/**
 * Full-text search
 * @param req
 * @param callback
 */
exports.get_search_results = function (req, callback) {

    let q = req.query.q;

    if (q.length === 0) {
        q = '*:*';
    }

    client.search({
        from: 0,
        size: 5000,
        index: config.elasticSearchBackIndex,
        q: q
    }).then(function (results) {
        callback({
            status: 200,
            message: 'Search results',
            data: results.hits
        });
    });
};