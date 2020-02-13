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

    const api = configModule.getApi();
    let obj = {};

    /**
     * Renders repository stats on home page
     * @param data
     */
    const renderStats = function (data) {

        domModule.html('#published-collection-count', DOMPurify.sanitize(data.published_collection_count.toLocaleString('en')));
        domModule.html('#total-collection-count', DOMPurify.sanitize(data.total_collection_count.toLocaleString('en')));
        domModule.html('#published-object-count', DOMPurify.sanitize(data.published_object_count.toLocaleString('en')));
        domModule.html('#total-object-count', DOMPurify.sanitize(data.total_object_count.toLocaleString('en')));
        domModule.html('#total-image-count', DOMPurify.sanitize(data.total_image_count.toLocaleString('en')));
        domModule.html('#total-pdf-count', DOMPurify.sanitize(data.total_pdf_count.toLocaleString('en')));
        domModule.html('#total-audio-count', DOMPurify.sanitize(data.total_audio_count.toLocaleString('en')));
        domModule.html('#total-video-count', DOMPurify.sanitize(data.total_video_count.toLocaleString('en')));

        // clear loading... messages
        domModule.html('#loading-published-collection-count', null);
        domModule.html('#loading-total-collection-count', null);
        domModule.html('#loading-published-object-count', null);
        domModule.html('#loading-total-object-count', null);
        domModule.html('#loading-image-count', null);
        domModule.html('#loading-pdf-count', null);
        domModule.html('#loading-audio-count', null);
        domModule.html('#loading-video-count', null);
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

                    if (data.length === 0) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>');
                    } else {
                        renderStats(data);
                    }
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve repository statistics.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {
        obj.getStats();
    };

    return obj;

}());

statsModule.init();