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

    const api = configModule.getApi();
    let obj = {};

    /**
     * Renders error message
     * @param message
     */
    obj.renderError = function (message) {
        domModule.html('#message', '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + DOMPurify.sanitize(message) + '</div>');
        return false;
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

        return decodeURIComponent(DOMPurify.sanitize(results[2].replace(/\+/g, " ")));
    };

    /**
     * Gets current year
     */
    obj.getCurrentYear = function () {
        let cdate = new Date().getFullYear();
        domModule.html('#cdate', DOMPurify.sanitize(cdate));
    };

    /**
     * Resolves repo thumbnails
     * @param pid
     * @returns {string}
     */
    obj.getTn = function (tn, mime_type) {

        let tnObj = configModule.getTnUrls();
        let token = userModule.getUserToken();

        if (tn !== null && tn !== undefined && tn.indexOf('http') !== -1) {
            return tn;
        } else if (tn === null || tn === undefined) {
            return tnObj.default + '?t=' + token;
        } else {

            if (mime_type.indexOf('video') !== -1) {
                return tnObj.default_video + '?t=' + token;
            } else if (mime_type.indexOf('audio') !== -1) {
                return tnObj.default_audio + '?t=' + token;
            } else if (mime_type.indexOf('pdf') !== -1) {
                return tnObj.default_pdf + '?t=' + token;
            } else {
                return tnObj.duracloud + '?tn=' + tn + '&t=' + token;
            }
        }
    };

    /**
     * Checks availability of third-party systems (Archivesspace/Archivematica)
     */
    obj.ping = function () {

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/repo/ping/services',
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

                    let html = '';

                    for (let prop in data) {

                        if (data[prop] === 'down') {
                            domModule.hide('.import-link');
                            html += '<div class="alert alert-danger"><strong>' + prop + ' is currently not available.  Ingests are not possible at this time.</strong></div>';
                        }
                    }

                    domModule.html('#ping', html);
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '. Unable to ping services.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * creates pagination
     * @param pid
     * @param total_records
     * @returns {string}
     */
    obj.pagination = function (pid, total_records) {

        let path = '/dashboard/objects';

        if (pid === null) {
            pid = 'codu:root';
        }

        let current_page = helperModule.getParameterByName('page'),
            total_on_page = 10,
            max_pages = 10,
            total_pages = Math.ceil(total_records / total_on_page),
            html = '';

        // don't render pagination
        if (total_pages === 1) {
            return html;
        }

        // set default to page 1
        if (current_page === null || current_page < 1) {
            current_page = 1;
        } else if (current_page > total_pages) {
            current_page = total_pages;
        }

        html += '<ul class="pagination" style="width:100%; margin: auto">';

        current_page = parseInt(current_page);

        // create first link
        if (current_page > total_on_page) {
            html += '<li><a href="' + path + '?pid=' + pid + '&page=1&total_on_page=' + total_on_page + '">First</a></li>';
        }

        // create previous link
        if (current_page > 1) {
            let prev_current_page = current_page - 1;
            html += '<li><a href="' + path + '?pid=' + pid + '&page=' + prev_current_page + '&total_on_page=' + total_on_page + '">Prev</a></li>';
        }

        let start_page,
            end_page,
            last;

        if (total_pages <= max_pages) {

            // show all pages
            start_page = 1;
            end_page = total_pages;

        } else {

            let total_pages_before_current_page = Math.floor(max_pages / 2),
                total_pages_after_current_page = Math.ceil(max_pages / 2) - 1;

            if (current_page <= total_pages_before_current_page) {

                // page near start
                start_page = 1;
                end_page = max_pages;

            } else if (current_page + total_pages_after_current_page >= total_pages) {

                // page near end
                last = true;
                start_page = total_pages - max_pages + 1;
                end_page = total_pages;

            } else {
                // middle pages
                start_page = current_page - total_pages_before_current_page;
                end_page = current_page + total_pages_after_current_page;
            }

        }

        let start_index = (current_page - 1) * total_on_page,
            end_index = Math.min(start_index + total_on_page - 1, total_records - 1),
            pages = Array.from(Array((end_page + 1) - start_page).keys()).map(i => start_page + i);

        for (let i=0;i<pages.length;i++) {

            if (current_page === pages[i]) {
                html += '<li class="active disabled"><a href="' + path + '?pid=' + pid + '&page=' + pages[i] + '&total_on_page=' + total_on_page + '" disabled>' + pages[i] + '</a></li>';
            } else {
                html += '<li><a href="' + path + '?pid=' + pid + '&page=' + pages[i] + '&total_on_page=' + total_on_page + '">' + pages[i] + '</a></li>';
            }
        }

        // create next link
        if (current_page < total_pages) {
            current_page = (parseInt(current_page) + 1);
            html += '<li><a href="' + path + '?pid=' + pid + '&page=' + current_page + '&total_on_page=' + total_on_page + '">Next</a></li>';
        }

        // create last link
        if (total_pages > 10 && current_page !== total_pages) {
            html += '<li><a href="' + path + '?pid=' + pid + '&page=' + total_pages + '&total_on_page=' + total_on_page + '">Last</a></li>';
        }

        html += '</ul>';

        return DOMPurify.sanitize(html);
    };

    /**
     * checks file size before upload
     */
    obj.checkFileSize = function () {

        const file = document.querySelector('#file');

        if (file.files[0].size > 500000) { // ~500kb
            domModule.html('#message', '<div class="alert alert-warning"><strong>The file is too big. Thumbnails must be under 500kb.</strong></div>');
            document.querySelector('#upload-button').disabled = true;
        } else {
            domModule.html('#message', '');
            document.querySelector('#upload-button').disabled = false;
        }
    };

    obj.init = function () {
        npProgress();
    };

    return obj;

}());

helperModule.init();