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

const helperModule = (function () {

    'use strict';

    let obj = {},
        api = configModule.getApi();;

    const renderError = function (message) {
        $('#message').html(message);
    };

    /**
     * Renders progress bar and spinner when pages load
     */
    const npProgress = function () {

        if (typeof NProgress != 'undefined') {
            $(document).ready(function () {
                NProgress.start();
            });

            $(window).load(function () {
                NProgress.done();
            });
        }
    };

    /**
     * Gets url parameter
     * @param name
     * @param url
     * @returns {*}
     */
    obj.getParameterByName = function (name, url) {

        if (!url) {
            url = window.location.href;
        }

        name = name.replace(/[\[\]]/g, "\\$&");

        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) {
            return null;
        }

        if (!results[2]) {
            return '';
        }

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    obj.getCurrentYear = function () {
        let cdate = new Date().getFullYear();
        document.querySelector('#cdate').innerHTML = cdate;
    };

    /**
     * Resolves repo thumbnails
     * @param pid
     * @returns {string}
     */
    obj.getTn = function (tn, mime_type) {  // pid

        let tnObj = configModule.getTnUrls();

        if (tn !== null && tn !== undefined && tn.indexOf('http') !== -1) {
            return tn;
        } else if (tn === null || tn === undefined) {
            return tnObj.default;
        } else {

            if (mime_type.indexOf('video') !== -1) {
                return tnObj.default_video;
            } else if (mime_type.indexOf('audio') !== -1) {
                return tnObj.default_audio;
            } else if (mime_type.indexOf('pdf') !== -1) {
                return tnObj.default_pdf;
            } else {
                return tnObj.duracloud + '?tn=' + tn;
            }
        }
    };

    /**
     * Checks availability of third-party systems (Archivesspace/Archivematica)
     */
    obj.ping = function () {

        $.ajax({
            url: configModule.getApi() + '/api/admin/v1/repo/ping/services',
            type: 'GET'
        })
            .done(function (data) {

                let html = '';

                for (let prop in data) {

                    if (data[prop] === 'down') {
                        $('.import-link').hide();
                        html += '<div class="alert alert-danger"><strong>' + prop + ' is currently not available.  Ingests are not possible at this time.</strong></div>';
                    }
                }

                $('#ping').html(html);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to check third-party services.</div>';
                    renderError(message);

                    if (jqXHR.status === 401) {

                        setTimeout(function () {
                            window.location.replace('/dashboard/error');
                        }, 2000);

                        return false;
                    }
                }
            });
    };

    obj.init = function () {
        npProgress();
    };

    return obj;

}());

helperModule.init();