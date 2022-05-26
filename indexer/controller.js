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
const CONFIG = require("../config/config");

exports.index_record = (req, res) => {

    let uuid = req.body.uuid;
    let publish = req.body.publish;
    let index_name;

    if (req.body.uuid === undefined || req.body.uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    if (publish === 'true') {
        index_name = CONFIG.elasticSearchFrontIndex;
    } else {
        index_name = CONFIG.elasticSearchBackIndex;
    }

    MODEL.index_record(uuid, index_name, (data) => {
        res.status(data.status).send(data);
    });
};

exports.index_records = (req, res) => {

    let index_name = req.body.index_name;

    MODEL.index_records(index_name, (data) => {
        res.status(data.status).send(data);
    });
};

exports.unindex_record = function (req, res) {

    let uuid = req.query.uuid;
    let index = req.query.index;

    MODEL.unindex_record(uuid, index, function (data) {
        res.status(data.status).send(data);
    });
};

exports.publish_records = function (req, res) {
    MODEL.publish_records(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.create_repo_index = function (req, res) {

    // TODO: create tasks object
    let index_name = req.body.index_name;

    SERVICE.create_repo_index(index_name, function (data) {
        res.status(data.status).send(data);
    });
};

exports.delete_repo_index = function (req, res) {

    // TODO: create task object
    let index_name = req.query.index_name;

    SERVICE.delete_repo_index(index_name, function (data) {
        res.status(data.status).send(data);
    });
};

/*
exports.update_fragment = function (req, res) {
    MODEL.update_fragment(req, function (data) {
        res.status(data.status).send(data);
    });
};

 */

/*
exports.republish_record = function (req, res) {
    MODEL.republish_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

 */

/*
exports.index_data = function (req, res) {
    MODEL.index_data(req, function (data) {
        res.status(data.status).send(data);
    });
};

 */