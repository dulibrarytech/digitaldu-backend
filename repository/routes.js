'use strict';

var Repo = require('../repository/controller');

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
    app.route('/api/admin/v1/objects')
        .get(Repo.get_admin_objects);

    app.route('/api/admin/v1/object')
        .get(Repo.get_admin_object);

    app.route('/api/admin/v1/repo/pid')
        .post(Repo.get_next_pid);

    /*
    app.route('/api/search')
        .get(Repo.do_search);
    */
};