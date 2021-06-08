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

const UTILS = require('../utils/model'),
    CACHE = require('../libs/cache');

exports.default = function (req, res) {
    res.status(403).send({
        info: 'University of Denver Libraries - Digital Object Repository'
    });
};

exports.reindex = function (req, res) {
    UTILS.reindex(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.clear_cache = function (req, res) {
    CACHE.clear_cache();
    res.status(200).send({
        message: 'Cache Cleared.'
    });
};

exports.batch_convert = function (req, res) {
    UTILS.batch_convert(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.batch_fix = function (req, res) {
    UTILS.batch_fix(req, function (data) {
        res.status(data.status).send(data.data);
    });
};