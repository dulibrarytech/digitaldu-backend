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

const DASHBOARD = require('../dashboard/controller');

module.exports = function (app) {

    app.route('/dashboard/home')
        .get(DASHBOARD.get_dashboard_home);

    app.route('/dashboard/collections')
        .get(DASHBOARD.get_dashboard_collections);

    app.route('/dashboard/collections/add')
        .get(DASHBOARD.get_dashboard_collection_add_form);

    app.route('/dashboard/objects')
        .get(DASHBOARD.get_dashboard_objects);

    app.route('/dashboard/objects/unpublished')
        .get(DASHBOARD.get_dashboard_unpublished_objects);

    app.route('/dashboard/object')
        .get(DASHBOARD.get_dashboard_object_detail);

    app.route('/dashboard/object/thumbnail')
        .get(DASHBOARD.update_dashboard_thumbnail);

    app.route('/dashboard/object/thumbnail/upload')
        .get(DASHBOARD.get_dashboard_upload);

    app.route('/dashboard/import')
        .get(DASHBOARD.get_dashboard_import);

    app.route('/dashboard/import/files')
        .get(DASHBOARD.get_dashboard_import_files);

    app.route('/dashboard/import/status')
        .get(DASHBOARD.get_dashboard_import_status);

    app.route('/dashboard/import/incomplete')
        .get(DASHBOARD.get_dashboard_import_incomplete);

    app.route('/dashboard/import/complete')
        .get(DASHBOARD.get_dashboard_import_complete);

    app.route('/dashboard/users')
        .get(DASHBOARD.get_dashboard_users);

    app.route('/dashboard/users/edit')
        .get(DASHBOARD.get_dashboard_user_edit_form);

    app.route('/dashboard/users/add')
        .get(DASHBOARD.get_dashboard_user_add_form);

    app.route('/dashboard/search')
        .get(DASHBOARD.get_dashboard_search);

    app.route('/dashboard/error')
        .get(DASHBOARD.get_dashboard_error);

};