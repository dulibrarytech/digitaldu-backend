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

const QA_INIT = require('../qa/run_qa_init');
const CONTROLLER = require('../qa/controller');
const ENDPOINTS = require('../qa/endpoints');
const TOKEN = require('../libs/tokens');
const QA_CONTROLLER = new CONTROLLER();

module.exports = (app) => {

    app.route(ENDPOINTS().qa_service.qa_list_ready_folders.endpoint)
    .get(TOKEN.verify, QA_CONTROLLER.get_folder_list);

    app.route(ENDPOINTS().qa_service.qa_run_qa.endpoint)
    .get(TOKEN.verify, QA_INIT.run_qa);

    app.route(ENDPOINTS().qa_service.qa_status.endpoint)
    .get(TOKEN.verify, QA_CONTROLLER.qa_status);

    app.route(ENDPOINTS().qa_service.qa_move_to_ingested.endpoint)
    .get(TOKEN.verify, QA_CONTROLLER.move_to_ingested);
};