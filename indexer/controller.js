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

const MODEL = require('../indexer/model');
const SERVICE = require('../indexer/service');

/**
 * Indexes a record
 * @param req
 * @param res
 * @return {boolean}
 */
exports.index_record = (req, res) => {

    let uuid = req.body.uuid;
    let publish = req.body.publish;

    if (req.body.uuid === undefined || req.body.uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.index_record(uuid, publish, (data) => {
        res.status(data.status).send(data);
    });
};

/**
 * Indexes all active repository records
 * @param req
 * @param res
 */
exports.index_records = (req, res) => {

    if (req.body === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    let index = req.body.index;

    if (index === undefined) {
        index = 'backend';
    }

    MODEL.index_records(index, (data) => {
        res.status(data.status).send(data);
    });
};

/** TODO
 * Moves published records from admin to public index
 * @param req
 * @param res
 */
exports.publish = function (req, res) {
    MODEL.publish(req, function (data) {
        res.status(data.status).send(data);
    });
};

/**
 * Deletes record from public index
 * @param req
 * @param res
 */
exports.supress = function (req, res) {

    if (req.query.uuid === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    let uuid = req.query.uuid;

    MODEL.suppress(uuid, (data) => {
        res.status(data.status).send(data);
    });
};

/**
 * Deletes record from admin index
 * @param req
 * @param res
 */
exports.delete = function (req, res) {

    if (req.query.uuid === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    let uuid = req.query.uuid;

    MODEL.delete(uuid, (data) => {
        res.status(data.status).send(data);
    });
};

exports.create_index = function (req, res) {

    if (req.body.index_name === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    let index_name = req.body.index_name;

    SERVICE.create_index(index_name, function (data) {
        res.status(data.status).send(data);
    });
};

exports.delete_index = function (req, res) {

    if (req.query.index_name === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    let index_name = req.query.index_name;

    SERVICE.delete_index(index_name, function (data) {
        res.status(data.status).send(data);
    });
};
