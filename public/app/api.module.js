/**

 Copyright 2024 University of Denver

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

const apiModule = (function () {

    'use strict';

    let obj = {};

    /**
     * Contains repository api endpoints
     */
    obj.endpoints = function () {
        const app = configModule.get_app_path();
        return {
            authenticate: app + '/api/authenticate',
            users: app + '/api/admin/v1/users',
            repo_object: app + '/api/admin/v1/repo/object',
            repo_objects: app + '/api/v2/repo/records',
            repo_object_thumbnail: app + '/api/v2/repo/object/thumbnail',
            repo_object_tn_dc: app + '/api/v2/repo/object/tn-dc',
            repo_object_tn: app + '/api/v2/repo/object/tn-service',
            repo_object_image: app + '/api/admin/v1/repo/object/image',
            repo_ping_services: app + '/api/admin/v1/repo/ping/services',
            repo_object_viewer: app + '/api/v2/repo/object/viewer',
            repo_publish: app + '/api/v2/repo/publish',
            repo_unpublish: app + '/api/v2/repo/suppress',
            repo_ingests: app + '/api/v2/repo/ingests',
            repo_object_unpublished: app + '/api/v2/repo/unpublished',
            repo_transcript: app + '/api/admin/v1/repo/object/transcript',
            repo_refresh_token: app + '/api/v2/repo/token',
            search: app + '/api/v2/search',
            import_metadata: app + '/api/v2/import/metadata',
            stats: app + '/api/v2/stats'
        };
    };

    return obj;

}());