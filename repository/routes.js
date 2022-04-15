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

const CONTROLLER = require('../repository/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/v2/repo/ping')  // OLD - /api/admin/v1/repo/ping/services
        .get(TOKEN.verify, CONTROLLER.ping);

    app.route('/api/v2/repo/records') // OLD - /api/admin/v1/repo/object
        .get(TOKEN.verify, CONTROLLER.get_record)
        .post(TOKEN.verify, CONTROLLER.create_collection_record)
        .delete(TOKEN.verify, CONTROLLER.delete_record);

    app.route('/api/v2/repo/publish') // OLD - /api/admin/v1/repo/publish
        .post(TOKEN.verify, CONTROLLER.publish_record);

    app.route('/api/v2/repo/suppress') // OLD - /api/admin/v1/repo/unpublish
        .post(TOKEN.verify, CONTROLLER.suppress_record)
        .get(TOKEN.verify, CONTROLLER.get_suppressed_records); // OLD - /api/admin/v1/repo/object/unpublished

    app.route('/api/v2/repo/rebuild/display_record') // OLD - /api/admin/v1/repo/metadata/reset
        .post(TOKEN.verify, CONTROLLER.rebuild_display_record);

    //////////////////////
    // gets thumbnails from duracloud
    app.route('/api/v2/repo/thumbnail')  // OLD - /api/admin/v1/repo/object/thumbnail
        .get(TOKEN.verify, CONTROLLER.get_thumbnail)
        .put(TOKEN.verify, CONTROLLER.update_thumbnail_url);

    // gets thumbnails from TN service
    app.route('/api/admin/v1/repo/object/tn')
        .get(TOKEN.verify, CONTROLLER.get_tn);

    app.route('/api/admin/v1/repo/object/image')
        .get(TOKEN.verify, CONTROLLER.get_image);

    app.route('/api/admin/v1/repo/object/viewer')
        .get(TOKEN.verify, CONTROLLER.get_viewer);
    //////////////////

    /*
    app.route('/api/admin/v1/repo/object/transcript')
        .put(TOKEN.verify, CONTROLLER.save_transcript);
     */
};