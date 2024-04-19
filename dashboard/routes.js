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

const CONFIG = require('../config/app_config')();
const DASHBOARD = require('../dashboard/controller');

module.exports = function (app) {

    app.route(`${CONFIG.app_path}/dashboard/home`)
        .get(DASHBOARD.get_dashboard_home);

    app.route(`${CONFIG.app_path}/dashboard/collections/add`)
        .get(DASHBOARD.get_dashboard_collection_add_form);

    app.route(`${CONFIG.app_path}/dashboard/objects`)
        .get(DASHBOARD.get_dashboard_objects);

    app.route(`${CONFIG.app_path}/dashboard/objects/unpublished`)
        .get(DASHBOARD.get_dashboard_unpublished_objects);

    app.route(`${CONFIG.app_path}/dashboard/objects/search`)
        .get(DASHBOARD.get_dashboard_search);

    app.route(`${CONFIG.app_path}/dashboard/object/thumbnail`)
        .get(DASHBOARD.update_dashboard_thumbnail);

    app.route(`${CONFIG.app_path}/dashboard/object/thumbnail/upload`)
        .get(DASHBOARD.get_dashboard_upload);

    app.route(`${CONFIG.app_path}/dashboard/object/delete`)
        .get(DASHBOARD.delete_dashboard_object);

    app.route(`${CONFIG.app_path}/dashboard/ingest`)
        .get(DASHBOARD.get_dashboard_import);

    app.route(`${CONFIG.app_path}/dashboard/ingest/status`)
        .get(DASHBOARD.get_dashboard_import_status);

    app.route(`${CONFIG.app_path}/dashboard/import/complete`)
        .get(DASHBOARD.get_dashboard_import_complete);

    app.route(`${CONFIG.app_path}/dashboard/users`)
        .get(DASHBOARD.get_dashboard_users);

    app.route(`${CONFIG.app_path}/dashboard/users/edit`)
        .get(DASHBOARD.get_dashboard_user_edit_form);

    app.route(`${CONFIG.app_path}/dashboard/users/add`)
        .get(DASHBOARD.get_dashboard_user_add_form);

    app.route(`${CONFIG.app_path}/dashboard/users/delete`)
        .get(DASHBOARD.get_dashboard_user_delete_form);

    app.route(`${CONFIG.app_path}/dashboard/qa`)
        .get(DASHBOARD.get_dashboard_qa);

    app.route(`${CONFIG.app_path}/dashboard/transcript`)
        .get(DASHBOARD.get_dashboard_transcript);

    app.route(`${CONFIG.app_path}/dashboard/viewer`)
        .get(DASHBOARD.get_dashboard_viewer);
};