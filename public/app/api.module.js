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

const apiModule = (function () {

    'use strict';

    let obj = {};

    /**
     * Contains api endpoints
     */
    obj.endpoints = function () {
        return {
            authenticate: '/api/authenticate',
            users: '/api/admin/v1/users',
            repo_object: '/api/admin/v1/repo/object',
            repo_objects: '/api/admin/v1/repo/objects',
            repo_object_thumbnail: '/api/admin/v1/repo/object/thumbnail', // gets thumbnails from duracloud
            repo_object_tn: '/api/admin/v1/repo/object/tn', // gets thumbnails from local TN service
            repo_object_image: '/api/admin/v1/repo/object/image', // gets images from image server
            repo_ping_services: '/api/admin/v1/repo/ping/services',
            repo_object_viewer: '/api/admin/v1/repo/object/viewer',  // renders viewer non-images
            repo_publish: '/api/admin/v1/repo/publish',
            repo_unpublish: '/api/admin/v1/repo/unpublish',
            repo_object_unpublished: '/api/admin/v1/repo/object/unpublished',
            repo_transcript: '/api/admin/v1/repo/object/transcript',
            search: '/api/admin/v1/search',
            import_metadata_collection: '/api/admin/v1/import/metadata/collection',
            import_metadata_object: '/api/admin/v1/import/metadata/single',  // /api/admin/v1/import/metadata/object
            import_queue_objects: '/api/admin/v1/import/queue_objects',
            import_list: '/api/admin/v1/import/list',
            import_complete: '/api/admin/v1/import/complete',
            import_poll_transfer_status: '/api/admin/v1/import/poll/transfer_status',
            import_poll_ingest_status: '/api/admin/v1/import/poll/ingest_status',
            import_poll_import_status: '/api/admin/v1/import/poll/import_status',
            import_poll_fail_queue: '/api/admin/v1/import/poll/fail_queue',
            qa_list: '/api/v1/qa/list-ready',
            qa_run: '/api/v1/qa/run-qa',
            qa_check_metadata: '/api/v1/qa/check-metadata',
            qa_check_collection: '/api/v1/qa/check-collection',
            qa_move_to_ingest: '/api/v1/qa/move-to-ingest',
            qa_move_to_sftp: '/api/v1/qa/move-to-sftp',
            qa_upload_status: '/api/v1/qa/upload-status',
            stats: '/api/admin/v1/stats'
        };
    };

    return obj;

}());