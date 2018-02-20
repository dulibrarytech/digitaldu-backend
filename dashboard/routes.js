'use strict';

var Dashboard = require('../dashboard/controller');

// TODO: apply api security.  i.e. API key (for discovery layer) tokens (Admin)
module.exports = function (app) {

    /* These routes are used to load HTML pages */
    app.route('/dashboard/home')
        .get(Dashboard.get_dashboard_home);

    /* communities */
    app.route('/dashboard/communities')
        .get(Dashboard.get_dashboard_communities);

    /* edit community */
    app.route('/dashboard/community/edit')
        .get(Dashboard.edit_dashboard_community);

    /* collections */
    app.route('/dashboard/collections')
        .get(Dashboard.get_dashboard_collections);

    /* edit collection */
    app.route('/dashboard/collection/edit')
        .get(Dashboard.edit_dashboard_collection);

    app.route('/dashboard/objects')
        .get(Dashboard.get_dashboard_objects);

    app.route('/dashboard/object')
        .get(Dashboard.get_dashboard_object_detail);

    /* users */
    app.route('/dashboard/users')
        .get(Dashboard.get_dashboard_users);

    app.route('/dashboard/search')
        .get(Dashboard.get_dashboard_search);
};