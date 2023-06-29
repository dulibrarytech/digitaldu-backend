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

const CONTROLLER = require('../qa/controller');
const TOKEN = require('../libs/tokens');
const ENDPOINTS = require('../qa/endpoints');

module.exports = (app) => {

    app.route(ENDPOINTS().qa_service.qa_list_ready_folders.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_folder_list);

    app.route(ENDPOINTS().qa_service.qa_run_qa.endpoint)
        .get(TOKEN.verify, CONTROLLER.run_qa);

    app.route(ENDPOINTS().qa_service.qa_status.endpoint)
        .get(TOKEN.verify, CONTROLLER.qa_status);

    /*
    app.route(ENDPOINTS().qa_service.qa_move_to_ingest.endpoint)
        .get(TOKEN.verify, CONTROLLER.move_to_ingest);

     */

    app.route(ENDPOINTS().qa_service.qa_move_to_sftp.endpoint)
        .get(TOKEN.verify, CONTROLLER.move_to_sftp);

    app.route(ENDPOINTS().qa_service.qa_upload_status.endpoint)
        .get(TOKEN.verify, CONTROLLER.sftp_upload_status);
};
