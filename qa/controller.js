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

const SERVICE = require('../qa/service'),
    MODEL = require('../qa/model');

exports.get_list_ready = function (req, res) {
    SERVICE.get_list_ready(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_ready_folder = function (req, res) {
    SERVICE.get_ready_folder(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.check_collection = function (req, res) {
    MODEL.check_collection(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.move_to_ingest = function (req, res) {
    SERVICE.move_to_ingest(req, function (data) {
        res.status(data.status).send(data.data);
    });
};