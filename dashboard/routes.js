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

const Dashboard = require('../dashboard/controller');

module.exports = function (app) {

    /* These routes are used to load HTML pages */
    app.route('/dashboard/home')
        .get(Dashboard.get_dashboard_home);

    /* collections */
    app.route('/dashboard/collections')
        .get(Dashboard.get_dashboard_collections);

    app.route('/dashboard/collections/add')
        .get(Dashboard.get_dashboard_collection_add_form);

    /* objects */
    app.route('/dashboard/objects')
        .get(Dashboard.get_dashboard_objects);

    app.route('/dashboard/objects/unpublished')
        .get(Dashboard.get_dashboard_unpublished_objects);

    app.route('/dashboard/object')
        .get(Dashboard.get_dashboard_object_detail);

    /* update thumbnail */
    app.route('/dashboard/object/thumbnail')
        .get(Dashboard.update_dashboard_thumbnail);

    /* download objects */
    app.route('/dashboard/object/download')
        .get(Dashboard.get_dashboard_download);

    /* import objects */
    app.route('/dashboard/import')
        .get(Dashboard.get_dashboard_import);

    /* import object files */
    app.route('/dashboard/import/files')
        .get(Dashboard.get_dashboard_import_files);

    /* renders transfer status page */
    app.route('/dashboard/import/status')
        .get(Dashboard.get_dashboard_import_status);

    app.route('/dashboard/import/incomplete')
        .get(Dashboard.get_dashboard_import_incomplete);

    app.route('/dashboard/import/complete')
        .get(Dashboard.get_dashboard_import_complete);

    /* users */
    app.route('/dashboard/users')
        .get(Dashboard.get_dashboard_users);

    app.route('/dashboard/users/edit')
        .get(Dashboard.get_dashboard_user_edit_form);

    app.route('/dashboard/users/add')
        .get(Dashboard.get_dashboard_user_add_form);

    app.route('/dashboard/error')
        .get(Dashboard.get_dashboard_error);

    app.route('/dashboard/search')
        .get(Dashboard.get_dashboard_search);

};