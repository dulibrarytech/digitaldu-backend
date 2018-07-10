'use strict';

var Dashboard = require('../dashboard/controller');

// TODO: apply api security.  i.e. API key (for discovery layer) tokens (Admin)
module.exports = function (app) {

    /* These routes are used to load HTML pages */
    app.route('/dashboard/home')
        .get(Dashboard.get_dashboard_home);

    /* root collections */
    app.route('/dashboard/root-collections')
        .get(Dashboard.get_dashboard_collections);

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

    /* users */
    app.route('/dashboard/users')
        .get(Dashboard.get_dashboard_users);

    app.route('/dashboard/search')
        .get(Dashboard.get_dashboard_search);

    /* edit metadata
    app.route('/dashboard/metadata/edit')
        .get(Dashboard.get_dashboard_metadata);

     */
};