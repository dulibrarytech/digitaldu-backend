'use strict';

var Repo = require('../repository/controller'),
    token = require('../libs/tokens');

// TODO: apply api security.  i.e. API key
module.exports = function (app) {

    /* Gets objects */
    /*
    app.route('/api/v1/objects')
        .get(Repo.get_objects);
    */

    /* Gets single object (Collection or Object) */
    /*
    app.route('/api/v1/object')
        .get(Repo.get_object);
    */

    app.route('/api/admin/v1/repo/objects')
        .get(token.verify, Repo.get_admin_objects);

    app.route('/api/admin/v1/repo/object')
        .get(token.verify, Repo.get_admin_object)
        .post(token.verify, Repo.save_admin_collection_object)
        .put(token.verify, Repo.update_admin_collection_object);

    // TODO: add "admin" to route
    app.route('/api/v1/object/download')
        .get(Repo.get_object_download);

    /*
    app.route('/api/admin/v1/repo/pid')
        .post(Repo.get_next_pid);  // token.verify,
    */

    app.route('/api/admin/v1/repo/ping/services')
        .get(Repo.ping);
};