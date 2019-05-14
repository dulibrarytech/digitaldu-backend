'use strict';

const Dashboard = require('../dashboard/controller');

// TODO: apply api security.  i.e. API key / tokens (Admin)
module.exports = function (app) {

    app.route('/api/ping')
        .get(Dashboard.ping);

    /* These routes are used to load HTML pages */
    app.route('/dashboard/home')
        .get(Dashboard.get_dashboard_home);

    /* collections */
    app.route('/dashboard/root-collections')
        .get(Dashboard.get_dashboard_collections);

    app.route('/dashboard/collections/add')
        .get(Dashboard.get_dashboard_collection_add_form);

    /* objects */
    app.route('/dashboard/objects')
        .get(Dashboard.get_dashboard_objects);

    app.route('/dashboard/object')
        .get(Dashboard.get_dashboard_object_detail);

    /* edit object */
    app.route('/dashboard/object/edit')
        .get(Dashboard.edit_dashboard_object);

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

    /* users */
    app.route('/dashboard/users')
        .get(Dashboard.get_dashboard_users);

    app.route('/dashboard/users/edit')
        .get(Dashboard.get_dashboard_user_edit_form);

    app.route('/dashboard/users/add')
        .get(Dashboard.get_dashboard_user_add_form);

    app.route('/dashboard/error')
        .get(Dashboard.get_dashboard_error);

    // TODO:...
    app.route('/dashboard/search')
        .get(Dashboard.get_dashboard_search);

};