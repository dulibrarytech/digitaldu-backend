/**

 Copyright 2023 University of Denver

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

const IMPORT_QUEUE = require('../import/queue');
const MODEL = require('../import/model');
const SERVICE = require('../import/service');
// const IMPORT = new MODEL();

/**
 * Import Controller
 * @type {Import_controller}
 */
const Import_controller = class {

    constructor() {}

    async import(req, res) {

        // TODO: extract payload from req here
        res.status(data.status).send(data.data);
        IMPORT.queue_objects(req, function (data) {
            res.status(data.status).send(data.data);
        });
    };

    // TODO: deprecate
    async queue_objects(req, res) {

        // TODO:
        res.status(data.status).send(data.data);
        IMPORT.queue_objects(req, function (data) {
            res.status(data.status).send(data.data);
        });
    };


}

module.exports = Import_controller;

// TODO: Deprecate
/*
exports.list = function (req, res) {
    IMPORT.list(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

 */

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

/*
exports.get_import_status = function (req, res) {
    IMPORT.get_import_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
*/

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

exports.get_import_complete = function (req, res) {
    MODEL.get_import_complete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_session_token = function(req, res) {
    SERVICE.get_session_token(req, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.destroy_session_token = function(req, res) {
    SERVICE.destroy_session_token(req, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_collection_metadata_record = function(req, res) {
    MODEL.update_collection_metadata_record(req, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_object_metadata_record = function(req, res) {
    MODEL.update_object_metadata_record(req, function(data) {
        res.status(data.status).send(data);
    });
};

exports.batch_update_metadata = function(req, res) {
     MODEL.batch_update_metadata(req, function(data) {
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

/*
exports.get_metadata_updates = function (req, res) {
    MODEL.get_metadata_updates(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
    */