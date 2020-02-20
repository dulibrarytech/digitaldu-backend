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

const IMPORT = require('../import/queue'),
    MODEL = require('../import/model');

exports.list = function (req, res) {
    IMPORT.list(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.queue_objects = function (req, res) {
    IMPORT.queue_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.start_transfer = function (req, res) {
    IMPORT.start_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.approve_transfer = function (req, res) {
    IMPORT.approve_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_transfer_status = function (req, res) {
    IMPORT.get_transfer_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_status = function (req, res) {
    IMPORT.get_import_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_ingest_status = function (req, res) {
    IMPORT.get_ingest_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_dip = function (req, res) {
    IMPORT.import_dip(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_repo_record = function (req, res) {
    IMPORT.create_repo_record(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_incomplete = function (req, res) {
    MODEL.get_import_incomplete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_complete = function (req, res) {
    MODEL.get_import_complete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods = function (req, res) {
    MODEL.import_mods(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods_id = function (req, res) {
    MODEL.import_mods_id(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_thumbnail = function (req, res) {
    MODEL.import_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_master = function (req, res) {
    MODEL.import_master(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_checksum = function (req, res) {
    MODEL.import_checksum(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.poll_transfer_status = function (req, res) {
    IMPORT.poll_transfer_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.poll_ingest_status = function (req, res) {
    IMPORT.poll_ingest_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.poll_import_status = function (req, res) {
    IMPORT.poll_import_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.poll_fail_queue = function (req, res) {
    IMPORT.poll_fail_queue(req, function (data) {
        res.status(data.status).send(data.data);
    });
};