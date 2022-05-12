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
    ENDPOINTS = require('../repository/endpoints'),
    TOKEN = require('../libs/tokens');

module.exports = (app) => {

    app.route(ENDPOINTS().repository.repo_ping.endpoint)
        .get(TOKEN.verify, CONTROLLER.ping);

    app.route(ENDPOINTS().repository.repo_records.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_record)
        .post(TOKEN.verify, CONTROLLER.create_collection_record)
        .delete(TOKEN.verify, CONTROLLER.delete_record);

    app.route(ENDPOINTS().repository.repo_publish.endpoint)
        .post(TOKEN.verify, CONTROLLER.publish_record);

    app.route(ENDPOINTS().repository.repo_suppress.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_suppressed_records)
        .post(TOKEN.verify, CONTROLLER.suppress_record);

    app.route(ENDPOINTS().repository.repo_rebuild_display_record.endpoint)
        .post(TOKEN.verify, CONTROLLER.rebuild_display_record);

    app.route(ENDPOINTS().repository.repo_thumbnail_custom.endpoint)
        .put(TOKEN.verify, CONTROLLER.update_thumbnail_url);

    app.route(ENDPOINTS().repository.repo_thumbnail_duracloud.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_duracloud_thumbnail);

    app.route(ENDPOINTS().repository.repo_thumbnail_service.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_tn_service_image)

    app.route(ENDPOINTS().repository.repo_image_service.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_convert_service_image);

    app.route(ENDPOINTS().repository.repo_viewer.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_object_viewer);
};