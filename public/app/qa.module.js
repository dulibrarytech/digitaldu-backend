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
    const endpoints = apiModule.endpoints();
    let obj = {};
    let local_file_count;

    /**
     * Gets ready folders
     */
    obj.getReadyFolders = function () {

        let url = api + endpoints.qa_list;
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
                    qaModule.renderReadyFolders(data);
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Permission denied.');
                });

            } else if (response.status === 500) {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). QA Service is unavailable.');
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get ready folders.');
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

        for (let prop in data) {

            html += '<tr>';
            // collection folder name
            html += '<td style="text-align: left;vertical-align: middle; width: 55%">';
            html += '<small>' + prop + '</small>';
            html += '</td>';
            // package count
            html += '<td style="text-align: left;vertical-align: middle; width: 8%">';
            html += '<small>' + data[prop] + '</small>';
            html += '</td>';
            // Status column
            html += '<td style="text-align: left;vertical-align: middle; width: 30%">';
            html += '<small id="collection-title-' + prop + '"></small>&nbsp;<small id="qa-package-size-' + prop + '"></small>&nbsp;<small id="' + prop + '"></small>';
            html += '<p id="upload-status-' + prop + '"></p>';
            html += '</td>';
            // Action button column
            html += '<td style="text-align: center;vertical-align: middle; width: 15%"><a href="#" type="button" class="btn btn-sm btn-default run-qa" onclick="qaModule.runQAonReady(\'' + prop + '\')"><i class="fa fa-cogs"></i> <span>Run QA/Upload</span></a></td>';
            html += '</tr>';
        }

        domModule.html('#qa-folders', html);

        setTimeout(function () {
            $('#qa-folders-tbl').DataTable({
                'order': [[0, 'asc']],
                'lengthMenu': [[10, 25, 50, -1], [10, 25, 50, 'All']]
            });
        }, 150);
    };

    /**
     * Runs QA on packages
     * @param folder
     * @returns {boolean}
     */
    obj.runQAonReady = function (folder) {

        domModule.hide('.run-qa');
        domModule.html('#' + folder, '<strong><em>Running QA and package upload process...</em></strong>');

        // send folder name in request
        let url = api + endpoints.qa_run + '?folder=' + folder;
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

        domModule.html('#' + folder, 'QA Complete.');

        let file_errors = '';
        let uri_errors = '';
        let file_error = false;
        let uri_error = false;
        let package_size;
        let errors = [];

        // Renders when package is empty
        if (data.file_results.length === 0 && data.errors.length > 0) {
            domModule.html('#' + folder, '<i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.message);
            domModule.show('.run-qa');
            return false;
        }

        if (data.total_size !== undefined) {
            package_size = data.total_size;
        }

        if (data.file_results.length === 0 || data.file_results.local_file_count === undefined) {
            domModule.html('#' + folder, '<i class="fa fa-exclamation-circle" style="color: red"></i> <strong>QA failed. Unable to get package file counts.</strong>');
            domModule.show('.run-qa');
            return false;
        } else {
            local_file_count = data.file_results.local_file_count;
        }

        if (data.file_results.errors.length !== 0) {

            domModule.show('.run-qa');
            file_error = true;
            file_errors += '<p><strong>The following packages have problems with object files:</strong></p>';

            for (let i = 0; i < data.file_results.errors.length; i++) {

                if (data.file_results.errors[i].error !== undefined && data.file_results.errors[i].file !== undefined) {
                    file_errors += '<article class="media event">';
                    file_errors += '<div class="media-body">';
                    file_errors += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.file_results.errors[i].file + ' - Error: ' + data.file_results.errors[i].error + '</p>';
                    file_errors += '<p></p>';
                    file_errors += '</div>';
                    file_errors += '</article>';
                } else {
                    file_errors += '<article class="media event">';
                    file_errors += '<div class="media-body">';
                    file_errors += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.file_results.errors[i] + '</p>';
                    file_errors += '</div>';
                    file_errors += '</article>';
                }
            }

            errors.push('-1');
        }

        if (data.uri_errors.length !== 0) {

            domModule.show('.run-qa');
            uri_error = true;
            uri_errors += '<strong>The following packages are missing uri.txt files:</strong><br>';

            for (let i = 0; i < data.uri_errors.length; i++) {
                uri_errors += '<article class="media event">';
                uri_errors += '<div class="media-body">';
                uri_errors += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.uri_errors[i] + '</p>';
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

        if (file_error === true || uri_error === true) {
            domModule.html('#' + folder, '&nbsp;<strong><i class="fa fa-exclamation-circle" style="color: red"></i>&nbsp;Errors Found.</strong>&nbsp;' + file_errors + '<br>' + uri_errors + '<br>');
        }

        domModule.html('#qa-package-size-' + folder, '(' + format_package_size(package_size) + ' - ' + local_file_count + ' files.)<br>');

        if (errors.length === 0) {

            window.onbeforeunload = function () {
                return '';
            };

            let parts = folder.split('-');
            let uri_part = parts.pop().replace('_', '/');

            checkCollection(uri_part, folder);
        }
    };

    /**
     * Checks if collection exists
     * @param uri
     */
    const checkCollection = function (uri, folder) {

        domModule.html('#' + folder, '<strong><em>Checking collection...</em></strong>');

        let token = userModule.getUserToken();
        let url = api + endpoints.qa_check_collection + '?uri=/repositories/2/' + uri,
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

                        domModule.html('#collection-title-' + folder, 'Creating collection...');

                        let obj = {};
                        obj.uri = '/repositories/2/' + uri;
                        obj.is_member_of_collection = configModule.getRootPid();

                        let token = userModule.getUserToken();
                        let url = api + endpoints.repo_object,
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
                                    domModule.html('#collection-title-' + folder, 'Collection created.');
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
                        domModule.html('#ready', '<h2>' + data.title + '</h2>');
                        domModule.html('#collection-title-' + folder, data.title + '<br>');
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

        domModule.html('#' + folder, '<strong><em>Preparing packages for ingest...</em></strong>');

        let token = userModule.getUserToken();
        let url = api + endpoints.qa_move_to_ingest + '?pid=' + pid + '&folder=' + folder,
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
                    domModule.html('#' + folder, '<strong>Packages moved to ingest folder.</strong>');
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

        domModule.html('#' + folder, '<strong><em>Uploading packages to Archivematica SFTP server...</em></strong>');

        let token = userModule.getUserToken();
        let url = api + endpoints.qa_move_to_sftp + '?pid=' + pid + '&folder=' + folder,
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

                    let timer = setInterval(function () {

                        checkSftpUploadStatus(pid, folder, function (results) {

                            clearInterval(timer);

                            setTimeout(function () {
                                window.onbeforeunload = null;
                                let message = '<div class="alert alert-success">Package <strong><a href="/dashboard/import?collection=' + pid + '">' + pid + '</a></strong> is ready to be imported.</div>';
                                domModule.html('#qa-on-ready', message);
                                domModule.html('#collection-title-' + folder, null);
                                domModule.html('#package-size-' + folder, null);
                                domModule.html('#' + folder, '<strong>Complete.</strong>');
                                // TODO: call endpoint to move sftp data to 003 ingest folder
                                setTimeout(function () {
                                    window.location.replace('/dashboard/import?collection=' + pid);
                                }, 7000);

                            }, 60000);

                        });
                    }, 30000);  // 60000*2
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
    const checkSftpUploadStatus = function (pid, folder, cb) {

        let token = userModule.getUserToken();
        let url = api + endpoints.qa_upload_status + '?pid=' + pid + '&local_file_count=' + local_file_count,
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

                        let file_upload = data.file_names.pop();
                        let tmp = file_upload.split('/');
                        let file = tmp[tmp.length - 1];
                        let html = '<p><strong><em>Uploading packages to Archivematica SFTP server...</em></strong></p>';
                        html += '<ul>';
                        html += '<p>' + data.remote_file_count + ' out of ' + data.local_file_count + ' files (' + data.remote_package_size + ')</p>';
                        html += '<li>' + file + '</li>';
                        html += '</ul>';

                        domModule.html('#' + folder, html);
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
        let url = api + endpoints.repo_object,
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