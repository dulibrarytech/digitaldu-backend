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

const Indexer = require('../indexer/model'),
    Service = require('../indexer/service');

exports.index_record = function (req, res) {
    Indexer.get_index_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_records = function (req, res) {
    Indexer.index_records(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_data = function (req, res) {
    Indexer.index_data(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.create_repo_index = function (req, res) {
    Service.create_repo_index(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.reset_display_record = function (req, res) {
    Indexer.reset_display_record(req, function (data) {
        res.status(data.status).send(data);
    })
};