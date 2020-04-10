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

const MODEL = require('../indexer/model'),
    SERVICE = require('../indexer/service');

exports.index_record = function (req, res) {
    MODEL.get_index_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.unindex_record = function (req, res) {
    MODEL.unindex_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.unindex_admin_record = function (req, res) {
    MODEL.unindex_admin_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_records = function (req, res) {
    MODEL.index_records(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.update_fragment = function (req, res) {
    MODEL.update_fragment(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.reindex = function (req, res) {
    MODEL.reindex(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_data = function (req, res) {
    MODEL.index_data(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.create_repo_index = function (req, res) {
    SERVICE.create_repo_index(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.delete_repo_index = function (req, res) {
    SERVICE.delete_repo_index(req, function (data) {
        res.status(data.status).send(data);
    });
};