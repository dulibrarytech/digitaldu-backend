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

const SERVICE = require('../search/service');

exports.get_search_results = function (req, res) {

    if (req.query.q === undefined) {

        res.status(400).send({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let search = {};
    let total_on_page = 10;

    if (req.query.total_on_page !== undefined) {
        total_on_page = req.query.total_on_page;
    }

    search.q = req.query.q;
    search.from = req.query.page;
    search.size = total_on_page;

    SERVICE.get_search_results(search, function (data) {
        res.status(data.status).send(data.data);
    });
};

/*
exports.get_search_results = function (req, res) {
    SERVICE.get_search_results(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

 */