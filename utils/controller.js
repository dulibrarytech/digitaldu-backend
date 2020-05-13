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

const Utils = require('../utils/model');

exports.get_uuids = function (req, res) {
    Utils.get_uuids(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.reindex = function (req, res) {
    Utils.reindex(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.batch_update_metadata = function(req, res) {
    Utils.batch_update_metadata(req, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.batch_update_collection_metadata  = function(req, res) {
    Utils.batch_update_collection_metadata (req, function(data) {
        res.status(data.status).send(data.data);
    });
};

////////////////////////////////////////////////////////

exports.get_archivesspace_ids = function (req, res) {
    Utils.get_archivesspace_ids(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.fix_compound_objects = function (req, res) {
    Utils.fix_compound_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.fix_display_records = function (req, res) {
    Utils.fix_display_records(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.check_objects = function (req, res) {
    Utils.check_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.batch_delete_objects = function (req, res) {
    Utils.batch_delete_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.default = function (req, res) {
    res.status(403).send({
        info: 'University of Denver Libraries'
    });
};