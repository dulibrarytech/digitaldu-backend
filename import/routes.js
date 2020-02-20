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

const IMPORT = require('../import/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/import/list')
        .get(IMPORT.list);

    app.route('/api/admin/v1/import/queue_objects')
        .post(TOKEN.verify, IMPORT.queue_objects);

    app.route('/api/admin/v1/import/start_transfer')
        .post(TOKEN.verify, IMPORT.start_transfer);

    app.route('/api/admin/v1/import/approve_transfer')
        .post(TOKEN.verify, IMPORT.approve_transfer);

    app.route('/api/admin/v1/import/transfer_status')
        .get(TOKEN.verify, IMPORT.get_transfer_status);

    app.route('/api/admin/v1/import/ingest_status')
        .get(TOKEN.verify, IMPORT.get_ingest_status);

    app.route('/api/admin/v1/import/import_dip')
        .get(TOKEN.verify, IMPORT.import_dip);

    app.route('/api/admin/v1/import/create_repo_record')
        .get(TOKEN.verify, IMPORT.create_repo_record);

    app.route('/api/admin/v1/import/status')
        .get(TOKEN.verify, IMPORT.get_import_status);

    app.route('/api/admin/v1/import/incomplete')
        .get(TOKEN.verify, IMPORT.get_import_incomplete);

    app.route('/api/admin/v1/import/complete')
        .get(TOKEN.verify, IMPORT.get_import_complete);

    app.route('/api/admin/v1/import/mods')
        .post(TOKEN.verify, IMPORT.import_mods);

    app.route('/api/admin/v1/import/mods_id')
        .post(TOKEN.verify, IMPORT.import_mods_id);

    app.route('/api/admin/v1/import/thumbnail')
        .post(TOKEN.verify, IMPORT.import_thumbnail);

    app.route('/api/admin/v1/import/master')
        .post(TOKEN.verify, IMPORT.import_master);

    app.route('/api/admin/v1/import/checksum')
        .post(TOKEN.verify, IMPORT.import_checksum);

    app.route('/api/admin/v1/import/poll/transfer_status')
        .get(TOKEN.verify, IMPORT.poll_transfer_status);

    app.route('/api/admin/v1/import/poll/ingest_status')
        .get(TOKEN.verify, IMPORT.poll_ingest_status);

    app.route('/api/admin/v1/import/poll/import_status')
        .get(TOKEN.verify, IMPORT.poll_import_status);

    app.route('/api/admin/v1/import/poll/fail_queue')
        .get(TOKEN.verify, IMPORT.poll_fail_queue);
};