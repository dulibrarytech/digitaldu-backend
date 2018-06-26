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

    /* edit collection */
    app.route('/dashboard/collection/edit')
        .get(Dashboard.edit_dashboard_collection);


    app.route('/dashboard/object')
        .get(Dashboard.get_dashboard_object_detail);

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