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

const configModule = (function () {

    'use strict';

    let obj = {};

    obj.get_app_path = function () {
        return '/repo';
    };

    /**
     * Resolves repo api url
     */
    obj.get_api = function () {
        return location.protocol + '//' + document.domain + ':' + location.port;
    };

    /** TODO: move to helper?
     * Contains urls for default thumbnails
     */
    obj.get_thumbnail_urls = function () {
        return {
            // TODO: get from api.module
            duracloud: configModule.get_app_path() + '/api/v2/repo/object/tn-dc',
            discovery: configModule.get_app_path() + '/api/v2/repo/object/tn-service',
            default: configModule.getApi() + '/images/media.jpg',
            default_pdf: configModule.getApi() + '/images/pdf-tn.png',
            default_audio: configModule.getApi() + '/images/audio-tn.png',
            default_video: configModule.getApi() + '/images/video-tn.png'
        };
    };

    /**
     * Returns root pid
     * @returns {string}
     */
    obj.get_root_pid = function() {
        return 'codu:root';
    };

    /**
     * Returns ArchivesSpace public url
     */
    obj.get_aspace = function() {
        return 'https://duarchives.coalliance.org';
    };

    return obj;

}());