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

const qaModule = (function () {

    'use strict';

    const api = configModule.getApi();
    let obj = {};

    /**
     * Gets ready folders
     */
    obj.getReadyFolders = function () {

        let url = api + '/api/v1/qa/list-ready';
        let token = userModule.getUserToken();
        let request = new Request(url, {
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

                    domModule.html('#message', null);

                    if (data.length === 0) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No folders found.</div>');
                    } else {
                        qaModule.renderReadyFolders(data);
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Permission denied.');
                    domModule.html('.loading', null);
                });

            } else if (response.status === 500) {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). QA Service is unavailable.');
                domModule.html('.loading', null);
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get ready folders.');
                domModule.html('.loading', null);
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Renders ready folders
     * @param data
     * @returns {boolean}
     */
    obj.renderReadyFolders = function (data) {

        let html = '';

        if (data.total === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No folders found.</strong></div>';
            domModule.html('#qa-folders', html);
            return false;
        }

        data = data.sort().reverse();

        for (let i = 0; i < data.length; i++) {

            html += '<tr>';
            html += '<td style="text-align: left;vertical-align: middle;">';
            html += data[i];
            html += '</td>';
            html += '<td style="text-align: center;vertical-align: middle;"><a href="#" type="button" class="btn btn-sm btn-default" onclick="qaModule.runQAonReady(\'' + data[i] + '\')"><i class="fa fa-cogs"></i> Run QA on packages</a></td>';
            html += '</tr>';
        }

        domModule.html('#qa-folders', html);
        domModule.html('.loading', null);
    };

    /**
     * Renders missing items
     * @param folder
     * @returns {boolean}
     */
    obj.runQAonReady = function(folder) {

        let html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; Running QA...</strong></div>';
        domModule.html('#qa-on-ready', html);
        domModule.hide('#qa-folders-tbl');

        let url = api + '/api/v1/qa/ready?folder=' + folder;
        let token = userModule.getUserToken();
        let request = new Request(url, {
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

                    domModule.html('#message', null);

                    if (data.length === 0) {
                        domModule.html('#qa-on-ready', null);
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No packages found in "' + folder + '".</div>');
                    } else {
                        renderQAresults(data, folder);
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Permission denied.');
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get ready folders.');
            }
        };

        httpModule.req(request, callback);

        return false;
    };

    /**
     * Renders QA results
     * @param data
     * @returns {boolean}
     */
    const renderQAresults = function(data, folder) {

        let missing_files = '';
        let missing_uris = '';
        let errors = [];

        if (data.missing_files === 'empty' && data.missing_uris === 'empty') {
            domModule.html('#ready', '<h2>' + folder + '</h2>');
            domModule.html('#qa-folders', null);
            domModule.html('#qa-on-ready', '<div class="alert alert-danger"><strong>There are no packages in "' + folder + '"</strong></a></div>');
            return false;
        }

        if (data.missing_files.length === 0) {

            missing_files += '<p><strong><i class="fa fa-check-circle"></i> No missing objects in packages.</strong></p>';

        } else {

            domModule.html('#qa-on-ready', null);
            missing_files += '<h4>The following packages are missing object files:</h4>';

            for (let i = 0;i < data.missing_files.length; i++) {
                missing_files += '<article class="media event">';
                missing_files += '<div class="media-body">';
                missing_files += '<p><i class="fa fa-exclamation-circle"></i> ' + data.missing_files[i] + '</p>';
                missing_files += '</div>';
                missing_files += '</article>';
            }

            errors.push('-1');
        }

        if (data.missing_uris.length === 0) {

            missing_uris += '<p><strong><i class="fa fa-check-circle"></i> No missing uri.txt files in packages.</strong></p>';

        } else {

            domModule.html('#qa-on-ready', null);
            missing_uris += '<h4>The following packages are missing uri.txt files:</h4>';

            for (let i = 0;i < data.missing_uris.length; i++) {
                missing_uris += '<article class="media event">';
                missing_uris += '<div class="media-body">';
                missing_uris += '<p><i class="fa fa-exclamation-circle"></i> ' + data.missing_uris[i] + '</p>';
                missing_uris += '</div>';
                missing_uris += '</article>';
            }

            errors.push('-1');
        }

        domModule.html('#ready', '<h2>' + folder + '</h2>');
        domModule.html('#qa-folders', null);
        domModule.html('#qa-results-missing-files-content', missing_files);
        domModule.html('#qa-results-missing-uris-content', missing_uris);
        domModule.show('#qa-results-missing-files-panel');
        domModule.show('#qa-results-missing-uris-panel');

        if (errors.length === 0) {

            window.onbeforeunload = function() {
                return "";
            };

            let parts = folder.split('-');
            let uri_part = parts.pop().replace('_', '/');
            // TODO: render collection form here
            // TODO: ask user if it's a top collection or a nested one
            // TODO: use uri part to create collection

            checkCollection(uri_part, folder);
            domModule.show('#qa-status-panel');
        }
    };

    /**
     * Checks if collection exists
     * @param uri
     */
    const checkCollection = function(uri, folder) {

        domModule.html('#processing-message', '<em>Checking collection...</em>');

        let token = userModule.getUserToken();
        let url = api + '/api/v1/qa/check-collection?uri=/repositories/2/' + uri,
            request = new Request(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    domModule.html('#collection-title', data.title);

                    if (data.length === 0) {

                        // TODO: create new collection
                        domModule.val('#resource-uri', uri);
                        domModule.html('#processing-message', null);
                        domModule.html('#qa-on-ready', null);

                    } else {

                        // domModule.html('#resource-uri-display', uri);
                        domModule.val('#resource-uri', uri);
                        moveToIngest(data.pid, folder);
                        // domModule.html('#message', '<div class="alert alert-success">Collection created ( <a href="' + configModule.getApi() + '/dashboard/objects/?pid=' + DOMPurify.sanitize(data[0].pid) + '">' + DOMPurify.sanitize(data[0].pid) + '</a> )');
                        // domModule.html('#processing-message', null);
                    }

                });

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to check collection.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Initiates QA to move ready folder to ingest folder
     * @param pid
     * @param folder
     */
    const moveToIngest = function(pid, folder) {

        domModule.html('#processing-message', '<em>Preparing packages for ingest...</em>');

        let token = userModule.getUserToken();
        let url = api + '/api/v1/qa/move-to-ingest?pid=' + pid + '&folder=' + folder,
            request = new Request(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {
                    window.onbeforeunload = null;
                    let message = '<div class="alert alert-success"><strong>' + data.message + '</strong><br>Package <strong><a href="/dashboard/import?collection=' + pid + '">' + pid + '</a></strong> is ready to be imported.</div>';
                    domModule.html('#qa-on-ready', message);
                    domModule.html('#processing-message', '<strong>Complete.</strong>');
                });

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  QA failed.');
            }
        };

        httpModule.req(request, callback);
    };

    /** TODO: Use collection module?
     * Adds collection
     */
    const addCollection = function () {

        let obj = {};

        for (let i=0;i<arr.length;i++) {
            let propsVal = decodeURIComponent(arr[i]).split('=');
            obj[propsVal[0]] = propsVal[1];
        }

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/repo/object',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                response.json().then(function (data) {
                    domModule.html('#message', '<div class="alert alert-success">Collection created ( <a href="' + configModule.getApi() + '/dashboard/objects/?pid=' + DOMPurify.sanitize(data[0].pid) + '">' + DOMPurify.sanitize(data[0].pid) + '</a> )');
                    domModule.hide('#collection-form');
                });

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else if (response.status === 200) {

                domModule.html('#message', '<div class="alert alert-warning">This collection object is already in the repository.</div>');
                domModule.show('#collection-form');

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 5000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add collection.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {
        qaModule.getReadyFolders();
    };

    return obj;
}());