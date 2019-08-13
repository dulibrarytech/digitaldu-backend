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

var Import = require('../import/queue'),
    Model = require('../import/model');

exports.list = function (req, res) {
    Import.list(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.queue_objects = function (req, res) {
    Import.queue_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.start_transfer = function (req, res) {
    Import.start_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.approve_transfer = function (req, res) {
    Import.approve_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_transfer_status = function (req, res) {
    Import.get_transfer_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_status = function (req, res) {
    Import.get_import_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_ingest_status = function (req, res) {
    Import.get_ingest_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_dip = function (req, res) {
    Import.import_dip(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_repo_record = function (req, res) {
    Import.create_repo_record(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_incomplete = function (req, res) {
    Model.get_import_incomplete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_complete = function (req, res) {
    Model.get_import_complete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods = function (req, res) {
    Model.import_mods(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods_id = function (req, res) {
    Model.import_mods_id(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_thumbnail = function (req, res) {
    Model.import_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};