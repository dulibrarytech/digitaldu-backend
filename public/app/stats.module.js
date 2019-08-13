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

    const renderError = function (message) {
        $('#message').html(message);
    };

    let api = configModule.getApi();

    const renderStats = function (data) {

        $('#published-collection-count').html(data.published_collection_count.toLocaleString('en'));
        $('#total-collection-count').html(data.total_collection_count.toLocaleString('en'));
        $('#published-object-count').html(data.published_object_count.toLocaleString('en'));
        $('#total-object-count').html(data.total_object_count.toLocaleString('en'));
        $('#total-image-count').html(data.total_image_count.toLocaleString('en'));
        $('#total-pdf-count').html(data.total_pdf_count.toLocaleString('en'));
        $('#total-audio-count').html(data.total_audio_count.toLocaleString('en'));
        $('#total-video-count').html(data.total_video_count.toLocaleString('en'));

        $('#loading-published-collection-count').html('');
        $('#loading-total-collection-count').html('');
        $('#loading-published-object-count').html('');
        $('#loading-total-object-count').html('');
        $('#loading-image-count').html('');
        $('#loading-pdf-count').html('');
        $('#loading-audio-count').html('');
        $('#loading-video-count').html('');
        $('a').tooltip();
    };

    obj.getStats = function () {

        $.ajax(api + '/api/admin/v1/stats')
            .done(function(data) {
                renderStats(data);
            })
            .fail(function(jqXHR, textStatus) {

                if (jqXHR.status !== 200) {
                    var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve repository statistics.</div>';
                    renderError(message);
                }
            });
    };

    obj.init = function () {
        obj.getStats();
    };

    return obj;

}());

statsModule.init();