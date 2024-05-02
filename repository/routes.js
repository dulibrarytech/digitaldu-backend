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

const CONFIG = require('../config/app_config')();
const CONTROLLER = require('../repository/controller');
const TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.get(`${CONFIG.app_path}/robots.txt`, function (req, res) {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
    });

    app.route(`${CONFIG.app_path}`)
    .post(TOKEN.verify, CONTROLLER.default);

    app.route(`${CONFIG.app_path}/api/v2/repo/records`)
    .get(TOKEN.verify, CONTROLLER.get_records);

    app.route(`${CONFIG.app_path}/api/v2/repo/publish`)
    .post(TOKEN.verify, CONTROLLER.publish);

    app.route(`${CONFIG.app_path}/api/v2/repo/suppress`)
    .post(TOKEN.verify, CONTROLLER.suppress);

    app.route(`${CONFIG.app_path}/api/v2/repo/records`)
    .get(TOKEN.verify, CONTROLLER.get_records);

    app.route(`${CONFIG.app_path}/api/v2/repo/ingests`)
    .get(TOKEN.verify, CONTROLLER.get_recent_ingests);

    app.route(`${CONFIG.app_path}/api/v2/repo/unpublished`)
    .get(TOKEN.verify, CONTROLLER.get_unpublished_records);

    app.route(`${CONFIG.app_path}/api/admin/v1/repo/object`)
    .get(TOKEN.verify, CONTROLLER.get_display_record)
    // .post(TOKEN.verify, CONTROLLER.create_collection_object) // TODO remove
    .delete(TOKEN.verify, CONTROLLER.delete_object);

    app.route(`${CONFIG.app_path}/api/v2/repo/object/thumbnail`)
    .post(TOKEN.verify, CONTROLLER.update_thumbnail);

    app.route(`${CONFIG.app_path}/api/v2/repo/object/tn-dc`)
    .get(TOKEN.verify, CONTROLLER.get_dc_thumbnail); // gets thumbnails from DuraCloud

    app.route(`${CONFIG.app_path}/api/v2/repo/object/tn-service`) // gets thumbnails from TN service
    .get(TOKEN.verify, CONTROLLER.get_tn);

    app.route(`${CONFIG.app_path}/api/admin/v1/repo/object/image`)
    .get(TOKEN.verify, CONTROLLER.get_image);

    app.route(`${CONFIG.app_path}/api/admin/v1/repo/object/viewer`)
    .get(TOKEN.verify, CONTROLLER.get_viewer);

    app.route(`${CONFIG.app_path}/api/admin/v1/repo/object/transcript`)
    .put(TOKEN.verify, CONTROLLER.save_transcript);

    app.route(`${CONFIG.app_path}/api/admin/v1/repo/ping/services`)
    .get(TOKEN.verify, CONTROLLER.ping);
};