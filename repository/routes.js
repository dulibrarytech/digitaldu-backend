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
    // TODO: add "repo" to route path
    app.route('/api/admin/v1/objects')
        .get(Repo.get_admin_objects);

    app.route('/api/admin/v1/object')
        .get(Repo.get_admin_object)
        .post(Repo.save_admin_collection_object);

    app.route('/api/admin/v1/repo/pid')
        .post(Repo.get_next_pid);

    // request('http://' + obj.user + ':' + obj.password + '@' + obj.host + 'objects/' + data[0].pid + '/datastreams/' + data[0].datastream + '/content', function (error, response, ds) {

    app.route('/objects/:pid/datastreams/:ds/content')
        .get(Repo.get_repo_object);

    /*
    app.route('/api/search')
        .get(Repo.do_search);
    */
};