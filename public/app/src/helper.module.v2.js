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

const helperModule = (function () {

    'use strict';

    const api = configModule.get_api();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Renders error message
     * @param message
     */
    obj.render_error = function (message) {
        // TODO: deprecate domModule
        domModule.html('#message', '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + DOMPurify.sanitize(message) + '</div>');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    };

    /**
     * Renders progress bar and spinner when pages load
     */
    const np_progress = function () {

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
     * Sets user logout url
     */
    const logout = function () {
        setTimeout(() => {
            const user = JSON.parse(window.sessionStorage.getItem('repo_user'));
            document.querySelector('#logout').setAttribute('href', '/repo/logout?uid=' + user.uid);
        }, 250);
    };

    /**
     * Gets url parameter
     * @param name
     * @param url
     * @returns {*}
     */
    obj.get_parameter_by_name = function (name, url) {

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

    /** TODO: Deprecate
     * Gets current year
     */
    obj.getCurrentYear = function () {
        let cdate = new Date().getFullYear();
        domModule.html('#cdate', DOMPurify.sanitize(cdate));
    };

    /** TODO: see get thumbnail urls in config module
     * Resolves repo thumbnails
     * @param tn
     * @param mime_type
     */
    obj.get_thumbnail = function (tn, mime_type) {

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

    /** TODO: move to ingest service
     * Checks availability of third-party systems (Archivesspace/Archivematica)
     */
    obj.ping = function () {

        let token = userModule.getUserToken();
        let url = api + endpoints.repo_ping_services,
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
                            domModule.html('.x_content', null);
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

            } else if (response.status === 403) {
                authModule.refresh_token();
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

        let path = window.location.pathname,
            q = helperModule.getParameterByName('q')

        if (pid === null && q === null) {
            pid = 'codu:root';
        }

        let current_page = helperModule.getParameterByName('page'),
            total_on_page = 10,
            max_pages = 10,
            total_pages = Math.ceil(total_records / total_on_page),
            query_string,
            html = '';

        if (pid === null && q !== null) {
            query_string = '?q=' + q;
        } else {
            query_string = '?pid=' + pid;
        }

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

            html += '<li>';
            html += '<a href="' + path + query_string + '&page=1&total_on_page=' + total_on_page + '">First</a>';
            html += '</li>';
        }

        // create previous link
        if (current_page > 1) {

            let prev_current_page = current_page - 1;

            html += '<li>';
            html += '<a href="' + path + query_string + '&page=' + prev_current_page + '&total_on_page=' + total_on_page + '">Prev</a>';
            html += '</li>';
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

                html += '<li class="active disabled">';
                html += '<a href="' + path + query_string + '&page=' + pages[i] + '&total_on_page=' + total_on_page + '" disabled>' + pages[i] + '</a>';
                html += '</li>';

            } else {

                html += '<li>';
                html += '<a href="' + path + query_string + '&page=' + pages[i] + '&total_on_page=' + total_on_page + '">' + pages[i] + '</a>';
                html += '</li>';
            }
        }

        // create next link
        if (current_page < total_pages) {

            current_page = (parseInt(current_page) + 1);

            html += '<li>';
            html += '<a href="' + path + query_string + '&page=' + current_page + '&total_on_page=' + total_on_page + '">Next</a>';
            html += '</li>';
        }

        // create last link
        if (total_pages > 10 && current_page !== total_pages) {

            html += '<li>';
            html += '<a href="' + path + query_string + '&page=' + total_pages + '&total_on_page=' + total_on_page + '">Last</a>';
            html += '</li>';
        }

        html += '</ul>';

        return DOMPurify.sanitize(html);
    };

    /**
     * checks file size before upload
     */
    obj.check_file_size = function () {

        const file = document.querySelector('#file');

        if (file.files[0].size > 500000) { // ~500kb
            domModule.html('#message', '<div class="alert alert-warning"><strong>The file is too big. Thumbnails must be under 500kb.</strong></div>');
            document.querySelector('#upload-button').disabled = true;
        } else {
            domModule.html('#message', '');
            document.querySelector('#upload-button').disabled = false;
        }
    };

    /**
     * Makes content visible only after it is fully rendered on page
     * @param selector
     * @param timeout
     */
    obj.on_load_visibility = function (selector, timeout) {

        document.addEventListener("DOMContentLoaded", function() {

            setTimeout(() => {

                if (document.querySelector(selector) !== null) {
                    document.querySelector(selector).style.visibility = 'visible';
                }

            }, timeout);
        });
    };

    obj.format_package_size = function (bytes, decimals = 2) {

        if (bytes === 0) {
            return '0 Bytes';
        }

        const K = 1024;
        const DM = decimals < 0 ? 0 : decimals;
        const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const I = Math.floor(Math.log(bytes) / Math.log(K));

        return parseFloat((bytes / Math.pow(K, I)).toFixed(DM)) + ' ' + SIZES[I];
    }

    obj.init = function () {
        np_progress();
        logout();
    };

    return obj;

}());

helperModule.init();