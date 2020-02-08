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

const statsModule = (function () {

    'use strict';

    let obj = {};
    let api = configModule.getApi();

    /**
     * Renders repository stats on home page
     * @param data
     */
    const renderStats = function (data) {

        document.querySelector('#published-collection-count').innerHTML = DOMPurify.sanitize(data.published_collection_count.toLocaleString('en'));
        document.querySelector('#total-collection-count').innerHTML = DOMPurify.sanitize(data.total_collection_count.toLocaleString('en'));
        document.querySelector('#published-object-count').innerHTML = DOMPurify.sanitize(data.published_object_count.toLocaleString('en'));
        document.querySelector('#total-object-count').innerHTML = DOMPurify.sanitize(data.total_object_count.toLocaleString('en'));
        document.querySelector('#total-image-count').innerHTML = DOMPurify.sanitize(data.total_image_count.toLocaleString('en'));
        document.querySelector('#total-pdf-count').innerHTML = DOMPurify.sanitize(data.total_pdf_count.toLocaleString('en'));
        document.querySelector('#total-audio-count').innerHTML = DOMPurify.sanitize(data.total_audio_count.toLocaleString('en'));
        document.querySelector('#total-video-count').innerHTML = DOMPurify.sanitize(data.total_video_count.toLocaleString('en'));

        // clear loading... messages
        document.querySelector('#loading-published-collection-count').innerHTML = '';
        document.querySelector('#loading-total-collection-count').innerHTML = '';
        document.querySelector('#loading-published-object-count').innerHTML = '';
        document.querySelector('#loading-total-object-count').innerHTML = '';
        document.querySelector('#loading-image-count').innerHTML = '';
        document.querySelector('#loading-pdf-count').innerHTML = '';
        document.querySelector('#loading-audio-count').innerHTML = '';
        document.querySelector('#loading-video-count').innerHTML = '';
    };

    /**
     * Gets stats from repository
     */
    obj.getStats = function () {

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/stats',
            request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    document.querySelector('#message').innerHTML = '';

                    if (data.length === 0) {
                        let message = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>';
                        document.querySelector('#message').innerHTML = message;
                    } else {
                        renderStats(data);
                    }
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to retrieve repository statistics.</div>';
                helperModule.renderError(message);
            }

        };

        http.req(request, callback);
    };

    obj.init = function () {
        obj.getStats();
    };

    return obj;

}());

statsModule.init();