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

const MODEL = require('../import/model');
const SERVICE = require('../import/service');

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

exports.update_single_metadata_record = function(req, res) {
    MODEL.update_single_metadata_record(req, function(data) {
        res.status(data.status).send(data);
    });
};

exports.batch_update_metadata = function(req, res) {
     MODEL.batch_update_metadata(req, function(data) {
        res.status(data.status).send(data.data);
    });
};