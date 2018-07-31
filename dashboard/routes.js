'use strict';

var Dashboard = require('../dashboard/controller');

// TODO: apply api security.  i.e. API key (for discovery layer) tokens (Admin)
module.exports = function (app) {

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

    /* import objects */
    app.route('/dashboard/import')
        .get(Dashboard.get_dashboard_import);

    /* import object files */
    app.route('/dashboard/import/files')
        .get(Dashboard.get_dashboard_import_files);

    /* triggers import queue process */
    app.route('/dashboard/import/batch')
        .get(Dashboard.get_dashboard_import_batch);

    /* users */
    app.route('/dashboard/users')
        .get(Dashboard.get_dashboard_users);

    app.route('/dashboard/users/detail')
        .get(Dashboard.get_dashboard_user_detail);

    app.route('/dashboard/users/add')
        .get(Dashboard.get_dashboard_user_add_form);

    /* groups */
    app.route('/dashboard/groups')
        .get(Dashboard.get_dashboard_groups);

    app.route('/dashboard/groups/add')
        .get(Dashboard.get_dashboard_group_add_form);

    app.route('/dashboard/groups/users')
        .get(Dashboard.get_dashboard_group_users);

    app.route('/dashboard/groups/user/add')
        .get(Dashboard.get_dashboard_group_user_add_form);

    app.route('/dashboard/search')
        .get(Dashboard.get_dashboard_search);

};