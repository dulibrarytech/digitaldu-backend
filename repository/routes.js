/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const Repo = require('../repository/controller'),
    token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/repo/objects')
        .get(token.verify, Repo.get_admin_objects);

    app.route('/api/admin/v1/repo/object')
        .get(token.verify, Repo.get_display_record)
        .post(token.verify, Repo.create_collection_object)
        .put(token.verify, Repo.update_metadata_cron);

    app.route('/api/admin/v1/repo/object/unpublished')
        .get(token.verify, Repo.get_unpublished_admin_objects);

    app.route('/api/admin/v1/repo/object/thumbnail')
        .get(token.verify, Repo.get_thumbnail)
        .post(token.verify, Repo.update_thumbnail);

    app.route('/api/admin/v1/repo/object/tn')
        .get(token.verify, Repo.get_tn);

    app.route('/api/admin/v1/repo/object/viewer')
        .get(token.verify, Repo.get_viewer);

    app.route('/api/admin/v1/repo/publish')
        .post(token.verify, Repo.publish_objects);

    app.route('/api/admin/v1/repo/unpublish')
        .post(token.verify, Repo.unpublish_objects);

    app.route('/api/admin/v1/repo/ping/services')
        .get(token.verify, Repo.ping);

    app.route('/api/admin/v1/repo/reset')
        .post(Repo.reset_display_record);
};