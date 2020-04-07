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

const REPO = require('../repository/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/repo/objects')
        .get(TOKEN.verify, REPO.get_admin_objects);

    app.route('/api/admin/v1/repo/object')
        .get(TOKEN.verify, REPO.get_display_record)
        .post(TOKEN.verify, REPO.create_collection_object);

    app.route('/api/admin/v1/repo/metadata')
        .put(TOKEN.verify, REPO.update_metadata_record);

    app.route('/api/admin/v1/repo/metadata/collection')
        .put(TOKEN.verify, REPO.update_collection_metadata_record);

    app.route('/api/admin/v1/repo/object/unpublished')
        .get(TOKEN.verify, REPO.get_unpublished_admin_objects);

    app.route('/api/admin/v1/repo/object/thumbnail')
        .get(TOKEN.verify, REPO.get_thumbnail)
        .post(TOKEN.verify, REPO.update_thumbnail);

    app.route('/api/admin/v1/repo/object/tn')
        .get(TOKEN.verify, REPO.get_tn);

    app.route('/api/admin/v1/repo/object/viewer')
        .get(TOKEN.verify, REPO.get_viewer);

    app.route('/api/admin/v1/repo/publish')
        .post(TOKEN.verify, REPO.publish_objects);

    app.route('/api/admin/v1/repo/unpublish')
        .post(TOKEN.verify, REPO.unpublish_objects);

    app.route('/api/admin/v1/repo/ping/services')
        .get(TOKEN.verify, REPO.ping);

    app.route('/api/admin/v1/repo/reset')
        .post(TOKEN.verify, REPO.reset_display_record);
};