/**

 Copyright 2022 University of Denver

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

const CONTROLLER = require('../indexer/controller'),
    ENDPOINTS = require('../indexer/endpoints'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route(ENDPOINTS().indexer.indexer_index_records.endpoint)
        .post(TOKEN.verify, CONTROLLER.index_record)
        .put(TOKEN.verify, CONTROLLER.index_records)
        .delete(TOKEN.verify, CONTROLLER.delete);
    // TODO: update route
    app.route(ENDPOINTS().indexer.indexer_manage_index)
        .post(TOKEN.verify, CONTROLLER.create_index)
        .delete(TOKEN.verify, CONTROLLER.delete_index);

    app.route(ENDPOINTS().indexer.indexer_publish)
        .post(TOKEN.verify, CONTROLLER.publish);

    app.route(ENDPOINTS().indexer.indexer_suppress)
        .delete(TOKEN.verify, CONTROLLER.supress);
};