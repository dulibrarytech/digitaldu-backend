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

exports.update_metadata = function (req, res) {

    if (req.params.uuid === undefined) {
        res.status(400).send({
            message: 'Bad Request.'
        });

        return false;
    }

    const uuid = req.params.uuid;

    MODEL.update_metadata(uuid, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_collection = function(req, res) {

    if (req.params.collection_uuid === undefined) {
        res.status(400).send({
            message: 'Bad Request.'
        });

        return false;
    }

    const uuid = req.params.collection_uuid;

    MODEL.update_collection(uuid, function(data) {
        res.status(data.status).send(data.data);
    });
};
