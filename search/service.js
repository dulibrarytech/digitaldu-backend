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
    validator = require('validator'),
    dom = require('../libs/dom'),
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

    if (validator.isInt(req.query.page) === false) {

        callback({
            status: 400,
            message: 'Bad request.',
            data: []
        });

        return false;
    }

    let q = dom.sanitize(req.query.q),
        page = dom.sanitize(req.query.page),
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

    client.search({
        from: page,
        size: total_on_page,
        index: config.elasticSearchBackIndex,
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