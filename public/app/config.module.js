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

const configModule = (function () {

    'use strict';

    let obj = {};

    /**
     * Resolves repo api url
     * @returns {string}
     */
    obj.getApi = function () {

        let api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = location.protocol + '//' + document.domain + ':' + location.port;
        }

        return api;
    };

    /**
     * Contains urls for default thumbnails
     * @returns {{duracloud: string, default: string, default_pdf: string, default_audio: string, default_video: string}}
     */
    obj.getTnUrls = function () {
        return {
            duracloud: '/api/admin/v1/repo/object/thumbnail',
            discovery: '/api/admin/v1/repo/object/tn',
            default: configModule.getApi() + '/images/media.jpg',
            default_pdf: configModule.getApi() + '/images/pdf-tn.png',
            default_audio: configModule.getApi() + '/images/audio-tn.png',
            default_video: configModule.getApi() + '/images/video-tn.png',
        };
    };

    /**
     * Returns root pid
     * @returns {string}
     */
    obj.getRootPid = function() {
        return 'codu:root';
    };

    /**
     * Returns archivesspace uri path
     * @returns {string}
     */
    obj.getUriPath = function() {
        return '/repositories/2/archival_objects/';
    };

    return obj;

}());