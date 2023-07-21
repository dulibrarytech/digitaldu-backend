/**

 Copyright 2023 University of Denver

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

const CONTROLLER = require('../import/controller');
const TOKEN = require('../libs/tokens');
const QUEUE = new CONTROLLER();

module.exports = function (app) {

    // TODO: Deprecate
    /*
    app.route('/api/admin/v1/import/list')
        .get(IMPORT.list);
    */
    // TODO: import endpoints
    app.route('/api/admin/v1/import') // <-- start here
    .post(TOKEN.verify, QUEUE.import);

    /*
    // TODO:
    app.route('/api/admin/v1/import/queue_objects')
        .post(TOKEN.verify, IMPORT.queue_objects);
    */

    /*
    app.route('/api/admin/v1/import/start_transfer')
        .post(TOKEN.verify, IMPORT.start_transfer);

    app.route('/api/admin/v1/import/approve_transfer')
        .post(TOKEN.verify, IMPORT.approve_transfer);

    // initiates transfer status checks
    app.route('/api/admin/v1/import/transfer_status')
        .get(TOKEN.verify, IMPORT.get_transfer_status);

    // initiates ingest status checks
    app.route('/api/admin/v1/import/ingest_status')
        .get(TOKEN.verify, IMPORT.get_ingest_status);

    app.route('/api/admin/v1/import/import_dip')
        .get(TOKEN.verify, IMPORT.import_dip);

    app.route('/api/admin/v1/import/create_repo_record')
        .get(TOKEN.verify, IMPORT.create_repo_record);

    app.route('/api/admin/v1/import/complete')
        .get(TOKEN.verify, IMPORT.get_import_complete);

    // gets archivesspace session token
    app.route('/api/admin/v1/import/metadata/session')
        .get(TOKEN.verify, IMPORT.get_session_token);

    // destroys archivesspace session token
    app.route('/api/admin/v1/import/metadata/session/destroy')
        .post(TOKEN.verify, IMPORT.destroy_session_token);

    // updates single collection metadata record
    app.route('/api/admin/v1/import/metadata/collection')
        .put(TOKEN.verify, IMPORT.update_collection_metadata_record);

    // updates single object metadata record
    app.route('/api/admin/v1/import/metadata/object')
        .put(TOKEN.verify, IMPORT.update_object_metadata_record);

    // batch updates all metadata records (collections and objects)
    app.route('/api/admin/v1/import/metadata/batch')
        .post(TOKEN.verify, IMPORT.batch_update_metadata);

    // transfer/import status checks
    app.route('/api/admin/v1/import/poll/transfer_status')
        .get(TOKEN.verify, IMPORT.poll_transfer_status);

    app.route('/api/admin/v1/import/poll/ingest_status')
        .get(TOKEN.verify, IMPORT.poll_ingest_status);

    app.route('/api/admin/v1/import/poll/import_status')
        .get(TOKEN.verify, IMPORT.poll_import_status);

    app.route('/api/admin/v1/import/poll/fail_queue')
        .get(TOKEN.verify, IMPORT.poll_fail_queue);

     */
};