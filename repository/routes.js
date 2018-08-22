'use strict';

var Repo = require('../repository/controller'),
    token = require('../libs/tokens');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    //--- Used by discovery layer ---//
    /* Gets objects */
    app.route('/api/v1/objects')
        .get(Repo.get_objects);

    /* Gets single object (Collection or Object) */
    app.route('/api/v1/object')
        .get(Repo.get_object);

    //--- Used by repo admin dashboard ---//
    app.route('/api/admin/v1/repo/objects')
        .get(token.verify, Repo.get_admin_objects);

    // TODO: add "repo" to route path
    app.route('/api/admin/v1/object')
        .get(token.verify, Repo.get_admin_object)
        .post(token.verify, Repo.save_admin_collection_object);

    app.route('/api/admin/v1/repo/pid')
        .post(token.verify, Repo.get_next_pid);

    // temp
    app.route('/objects/:pid/datastreams/:ds/content')
        .get(Repo.get_repo_object);
};