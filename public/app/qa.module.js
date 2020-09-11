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
    let local_file_count;

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
    obj.runQAonReady = function (folder) {

        let html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; Running QA... <em>This may take a while depending on the size of the collection</em>.</strong></div>';
        domModule.html('#qa-on-ready', html);
        domModule.hide('#qa-folders-tbl');

        let url = api + '/api/v1/qa/run-qa?folder=' + folder;
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
    };

    /**
     * Renders QA results
     * @param data
     * @returns {boolean}
     */
    const renderQAresults = function (data, folder) {

        let file_errors = '';
        let uri_errors = '';
        let package_size;
        let errors = [];

        if (data.file_results.length === 0 && data.errors.length > 0) {

            domModule.html('#message', '<div class="alert alert-danger"><strong>' + data.message + '</strong></a></div>');
            domModule.html('#qa-on-ready', null);

            let html = '<ul>';

            for (let i=0;i<data.errors.length;i++) {
                html += '<li>' + data.errors[i] + '</li>';
            }

            html += '</ul>';
            html+= '<p><br><a href="/dashboard/qa" type="button"><i class="fa fa-arrow-left"></i> Return to folder list</a></p>';
            domModule.html('#ready', html);
            return false;
        }

        if (data.total_size !== undefined) {
            package_size = data.total_size;
        }

        if (data.file_results.length === 0 || data.file_results.local_file_count === undefined) {
            domModule.html('#message', '<div class="alert alert-danger"><strong>QA failed. Unable to get package file counts.</strong></a></div>');
            domModule.html('#qa-on-ready', null);
            return false;
        } else {
            local_file_count = data.file_results.local_file_count;
        }

        if (data.file_results.errors.length === 0) {

            file_errors += '<p><strong><i class="fa fa-check-circle"></i> No missing objects in packages.</strong></p>';

        } else {

            domModule.html('#qa-on-ready', null);
            file_errors += '<p><strong>The following packages have problems with object files:</strong></p>';

            for (let i = 0; i < data.file_results.errors.length; i++) {

                if (data.file_results.errors[i].error !== undefined && data.file_results.errors[i].file !== undefined) {
                    file_errors += '<article class="media event">';
                    file_errors += '<div class="media-body">';
                    file_errors += '<p><i class="fa fa-exclamation-circle"></i> ' + data.file_results.errors[i].file + ' - Error: ' + data.file_results.errors[i].error + '</p>';
                    file_errors += '<p></p>';
                    file_errors += '</div>';
                    file_errors += '</article>';
                } else {
                    file_errors += '<article class="media event">';
                    file_errors += '<div class="media-body">';
                    file_errors += '<p><i class="fa fa-exclamation-circle"></i> ' + data.file_results.errors[i] + '</p>';
                    file_errors += '</div>';
                    file_errors += '</article>';
                }
            }

            errors.push('-1');
        }

        if (data.uri_errors.length === 0) {

            uri_errors += '<p><strong><i class="fa fa-check-circle"></i> No missing uri.txt files in packages.</strong></p>';

        } else {

            domModule.html('#qa-on-ready', null);
            uri_errors += '<p><strong>The following packages are missing uri.txt files:</strong></p>';

            for (let i = 0; i < data.uri_errors.length; i++) {
                uri_errors += '<article class="media event">';
                uri_errors += '<div class="media-body">';
                uri_errors += '<p><i class="fa fa-exclamation-circle"></i> ' + data.uri_errors[i] + '</p>';
                uri_errors += '</div>';
                uri_errors += '</article>';
            }

            errors.push('-1');
        }

        function format_package_size(bytes, decimals = 2) {

            if (bytes === 0) {
                return '0 Bytes';
            }

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        domModule.html('#ready', '<h2>' + folder + '</h2>');
        domModule.html('#qa-folders', null);
        domModule.html('#qa-results-missing-files-content', file_errors);
        domModule.html('#qa-results-missing-uris-content', uri_errors);
        domModule.html('#qa-package-size', 'Collection size: ' + format_package_size(package_size) + ' - ' + local_file_count + ' files.');
        domModule.show('#qa-results-missing-files-panel');
        domModule.show('#qa-results-missing-uris-panel');

        if (errors.length === 0) {

            window.onbeforeunload = function () {
                return '';
            };

            let parts = folder.split('-');
            let uri_part = parts.pop().replace('_', '/');

            checkCollection(uri_part, folder);
            domModule.show('#qa-status-panel');
        }
    };

    /**
     * Checks if collection exists
     * @param uri
     */
    const checkCollection = function (uri, folder) {

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

                    if (data.length === 0) {

                        domModule.html('#collection-title', 'Creating collection...');
                        let obj = {};
                        obj.uri = '/repositories/2/' + uri;
                        obj.is_member_of_collection = configModule.getRootPid();

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
                                    console.log(data);
                                    domModule.html('#collection-title', 'Collection created.');
                                    checkCollection(uri, folder);
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
                                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add collection.');
                            }
                        };

                        httpModule.req(request, callback);

                    } else {

                        domModule.html('#collection-title', data.title);
                        // domModule.val('#resource-uri', uri);
                        moveToIngest(data.pid, folder);
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
    const moveToIngest = function (pid, folder) {

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

                    // let message = '<div class="alert alert-success"><strong>' + data.message + '</strong><br>Package <strong><a href="/dashboard/import?collection=' + pid + '">' + pid + '</a></strong> is ready to be imported.</div>';
                    // domModule.html('#qa-on-ready', message);
                    domModule.html('#processing-message', '<strong>Packages moved to ingest folder.</strong>');
                    moveToSftp(pid, folder);
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

    /**
     * Moves packages to Archivematica SFTP server
     * @param pid
     * @param folder
     */
    const moveToSftp = function (pid, folder) {

        domModule.html('#processing-message', '<em>Uploading to Archivematica SFTP server...</em>');

        let token = userModule.getUserToken();
        let url = api + '/api/v1/qa/move-to-sftp?pid=' + pid + '&folder=' + folder,
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

                    let timer = setInterval(function() {
                        checkSftpUploadStatus(pid, function(results) {
                            clearInterval(timer);

                            setTimeout(function() {
                                window.onbeforeunload = null;
                                let message = '<div class="alert alert-success">Package <strong><a href="/dashboard/import?collection=' + pid + '">' + pid + '</a></strong> is ready to be imported.</div>';
                                domModule.html('#qa-on-ready', message);
                                domModule.html('#processing-message', '<strong>Complete.</strong>');
                            }, 60000);

                        });
                    }, 30000);
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

    /**
     * Checks status of sftp upload
     * @param pid
     */
    const checkSftpUploadStatus = function(pid, cb) {

        domModule.html('#processing-message', '<em>Checking SFTP Upload...</em>');

        let token = userModule.getUserToken();
        let url = api + '/api/v1/qa/upload-status?pid=' + pid + '&local_file_count=' + local_file_count,
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

                    if (data.message === 'upload_complete') {
                        cb('complete');
                    } else if (data.message === 'in_progress') {

                        let html = '<p><em>Uploading...</em></p><ul>';

                        for (let i = 0; i<data.data[0].length;i++) {
                            let file_upload = data.data[0][i]; // .splice(0, 1)
                            html += '<li>' + file_upload + '</li>';
                        }

                        html += '</ul>';

                        domModule.html('#processing-message', html);
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

        for (let i = 0; i < arr.length; i++) {
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