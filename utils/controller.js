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

const UTILS = require('../utils/model');
const CONVERT = require('../utils/convert');
const CACHE = require('../libs/cache');

exports.default = function (req, res) {
    res.status(403).send({
        info: 'University of Denver Libraries - Digital Object Repository'
    });
};

exports.restore_compound_parts = function (req, res) {

    if (req.params.uuid === undefined) {
        // TODO: bad request
        return false;
    }

    const uuid = req.params.uuid;

    UTILS.restore_compound_parts(uuid, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.convert = function (req, res) {
    CONVERT.convert(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.remove_cached_image = function (req, res) {
    CONVERT.remove_cached_image(req, function (data) {
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

exports.save_call_number = function (req, res) {
    UTILS.save_call_number(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.load_transcripts = function (req, res) {
    UTILS.load_transcripts(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.batch_fix = function (req, res) {
    UTILS.batch_fix(req, function (data) {
        res.status(data.status).send(data.data);
    });
};