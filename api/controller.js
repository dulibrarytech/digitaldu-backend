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

const MODEL = require('../api/model');
const SERVICE = require("../api/service");

exports.default = function (req, res) {
    res.status(403).send({
        info: 'University of Denver Libraries - DigitalDU API'
    });
};

exports.get_endpoints = function (req, res) {
    let endpoints = {};
    endpoints.api_endpoints = require('../api/endpoints')();
    endpoints.stats_endpoints = require('../stats/endpoints')();
    endpoints.repository_endpoints = require('../repository/endpoints')();
    endpoints.users_endpoints = require('../users/endpoints')();
    res.status(200).send(endpoints);
};

exports.get_records = function (req, res) {
    MODEL.get_records(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_images = function (req, res) {
    SERVICE.get_images(req, function (data) {
        res.set('Content-Type', 'image/jpeg');
        res.end(data.data, 'binary');
    });
};

exports.get_uuids = function (req, res) {
    MODEL.get_uuids(req, function (data) {
        res.status(data.status).send(data.data);
    });
};