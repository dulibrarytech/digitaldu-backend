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

const CONFIG = require('../config/config'),
    ES = require('elasticsearch'),
    CLIENT = new ES.Client({
        host: CONFIG.elasticSearch
    });

/**
 * Full-text search
 * @param req
 * @param callback
 */
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
        type: 'data',
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