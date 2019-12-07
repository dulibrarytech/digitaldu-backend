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

const Import = require('../import/controller'),
    token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/import/list')
        .get(Import.list);

    app.route('/api/admin/v1/import/queue_objects')
        .post(token.verify, Import.queue_objects);

    app.route('/api/admin/v1/import/start_transfer')
        .post(Import.start_transfer);

    app.route('/api/admin/v1/import/approve_transfer')
        .post(Import.approve_transfer);

    app.route('/api/admin/v1/import/transfer_status')
        .get(Import.get_transfer_status);

    app.route('/api/admin/v1/import/ingest_status')
        .get(Import.get_ingest_status);

    app.route('/api/admin/v1/import/import_dip')
        .get(Import.import_dip);

    app.route('/api/admin/v1/import/create_repo_record')
        .get(Import.create_repo_record);

    app.route('/api/admin/v1/import/status')
        .get(Import.get_import_status);

    app.route('/api/admin/v1/import/incomplete')
        .get(Import.get_import_incomplete);

    app.route('/api/admin/v1/import/complete')
        .get(Import.get_import_complete);

    app.route('/api/admin/v1/import/mods')
        .post(Import.import_mods);

    app.route('/api/admin/v1/import/mods_id')
        .post(Import.import_mods_id);

    app.route('/api/admin/v1/import/thumbnail')
        .post(Import.import_thumbnail);

    app.route('/api/admin/v1/import/master')
        .post(Import.import_master);

    app.route('/api/admin/v1/import/checksum')
        .post(Import.import_checksum);

    app.route('/api/admin/v1/import/poll/transfer_status')
        .get(token.verify, Import.poll_transfer_status);

    app.route('/api/admin/v1/import/poll/ingest_status')
        .get(token.verify, Import.poll_ingest_status);

    app.route('/api/admin/v1/import/poll/import_status')
        .get(token.verify, Import.poll_import_status);

    app.route('/api/admin/v1/import/poll/fail_queue')
        .get(token.verify, Import.poll_fail_queue);

};