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

const QA = require('../qa/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/v1/qa/list-ready')
        .get(TOKEN.verify, QA.get_list_ready);

    app.route('/api/v1/qa/run-qa')
        .get(TOKEN.verify, QA.run_qa);

    app.route('/api/v1/qa/check-metadata')
        .get(TOKEN.verify, QA.check_metadata);

    app.route('/api/v1/qa/check-collection')
        .get(TOKEN.verify, QA.check_collection);

    app.route('/api/v1/qa/move-to-ingest')
        .get(TOKEN.verify, QA.move_to_ingest);

    app.route('/api/v1/qa/move-to-sftp')
        .get(TOKEN.verify, QA.move_to_sftp);

    app.route('/api/v1/qa/upload-status')
        .get(TOKEN.verify, QA.upload_status);
};