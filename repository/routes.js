'use strict';

var Repo = require('../repository/controller'),
    token = require('../libs/tokens');

// TODO: apply api security.  i.e. API key
module.exports = function (app) {

    app.route('/api/admin/v1/repo/objects')
        .get(token.verify, Repo.get_admin_objects);

    app.route('/api/admin/v1/repo/object')
        .get(token.verify, Repo.get_admin_object)
        .post(token.verify, Repo.save_admin_collection_object)
        .put(Repo.update_metadata_cron);  // token.verify,  api-key

    app.route('/api/admin/v1/repo/object/thumbnail')
        .post(token.verify, Repo.update_thumbnail);

    app.route('/api/admin/v1/repo/publish')
        .post(token.verify, Repo.publish_object);

    app.route('/api/admin/v1/repo/object/download')
        .get(Repo.get_object_download);

    app.route('/api/admin/v1/repo/ping/services')
        .get(Repo.ping);

    /*
     app.route('/api/admin/v1/repo/object/cron')
     .put(Repo.update_metadata_cron);
     */

    /*
     app.route('/api/admin/v1/repo/pid')
     .post(Repo.get_next_pid);  // token.verify,
     */
};