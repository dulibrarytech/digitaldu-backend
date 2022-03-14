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
    let total_batch_file_count;

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

        for (let prop in data.result) {

            html += '<tr>';
            // collection folder name
            html += '<td style="text-align: left;vertical-align: middle; width: 55%">';
            html += '<small>' + prop + '</small>';
            html += '</td>';
            // package count
            html += '<td style="text-align: left;vertical-align: middle; width: 8%">';
            html += '<small>' + data.result[prop] + '</small>';
            html += '</td>';
            // Status column
            html += '<td style="text-align: left;vertical-align: middle; width: 30%">';
            html += '<small id="collection-title-' + prop + '"></small>&nbsp;<small id="qa-package-size-' + prop + '"></small>&nbsp;<small id="' + prop + '"></small>';
            html += '<p id="upload-status-' + prop + '"></p>';
            html += '</td>';
            // Action button column
            html += '<td style="text-align: center;vertical-align: middle; width: 15%"><a href="#" type="button" class="btn btn-sm btn-default run-qa" onclick="qaModule.runQAonReady(\'' + prop + '\')"><i class="fa fa-cogs"></i> <span>Upload</span></a></td>';
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
        domModule.html('#' + folder, '<strong><em>Running QA process on archival packages...</em></strong>');

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

                        let uris = data.get_uri_results.result;

                        check_package_metadata(uris, folder, function(errors) {

                            if (errors.length > 0) {
                                data.metadata_results = {
                                    result: 'Metadata checked.',
                                    errors: errors
                                };
                            }

                            renderQAresults(data, folder);
                        });
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
     * Displays QA errors found in archival packages
     * @param data
     * @return error_object
     */
    function display_qa_errors(data) {

        let error_messages = '<p><strong>The following errors were encountered:</strong></p>';
        let errors = [];

        if (data.folder_name_results.errors.length > 0) {

            errors.push(-1);

            for (let i = 0; i < data.folder_name_results.errors.length; i++) {
                error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.folder_name_results.errors[i] + '</p>';
            }
        }

        // TODO: rethink array name... array contains issues with objects as well.
        if (data.file_count_results.errors.length > 0) {

            errors.push(-1);

            for (let i = 0; i < data.file_count_results.errors.length; i++) {
                error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.file_count_results.errors[i] + '</p>';
            }
        }

        if (data.package_name_results.errors.length > 0) {

            errors.push(-1);

            for (let i = 0; i < data.package_name_results.errors.length; i++) {
                error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.package_name_results.errors[i] + '</p>';
            }
        }

        if (data.total_batch_size.errors.length > 0) {
            errors.push(-1);
            error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> Unable to get total batch size.</p>';
        }

        if (data.uri_results.errors.length > 0) {

            errors.push(-1);

            for (let i = 0; i < data.uri_results.errors.length; i++) {
                error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.uri_results.errors[i] + '</p>';
            }
        }

        if (data.metadata_results !== undefined && data.metadata_results.errors.length > 0) {

            errors.push(-1);

            for (let i = 0; i < data.metadata_results.errors.length; i++) {
                error_messages += '<p><i class="fa fa-exclamation-circle" style="color: red"></i> ' + data.metadata_results.errors[i].error + ' for record ' + data.metadata_results.errors[i].uri + '</p>';
            }
        }

        return {
            errors: errors,
            error_messages: error_messages
        };
    }

    /**
     * Checks record metadata
     * @param uris
     * @param folder
     * @param cb
     */
    const check_package_metadata = function (uris, folder, cb) {

        let errors = [];

        let timer = setInterval(function() {

            if (uris.length === 0) {
                clearInterval(timer);
                domModule.html('#' + folder, '<strong><em>Running QA process on archival packages. <br>Metadata checks complete.</em></strong>');

                setTimeout(function() {
                    cb(errors);
                }, 4000);

                return false;
            }

            let uri = uris.pop();
            let token = userModule.getUserToken();

            domModule.html('#' + folder, '<strong><em>Running QA process on archival packages. <br>Checking metadata record... ' + uri + '</em></strong>');

            let url = api + endpoints.qa_check_metadata + '?uri=' + uri,
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

                        if (data.length > 0) {
                            errors.push(data[0]);
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
                    helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to check metadata.');
                }
            };

            httpModule.req(request, callback);

        }, 3000);
    };

    /**
     * Renders QA results
     * @param data
     * @param folder
     * @returns {boolean}
     */
    const renderQAresults = function (data, folder) {

        let total_batch_size = data.total_batch_size.result;
        let error_obj = display_qa_errors(data);
        total_batch_file_count = data.file_count_results.result;

        domModule.html('#' + folder, '<strong>QA Complete...</strong>');

        // display QA errors if found
        if (error_obj.errors.length > 0) {
            setTimeout(function() {
                domModule.html('#' + folder, error_obj.error_messages);
                domModule.show('.run-qa');
            }, 4000);

            return false;
        }

        setTimeout(function() {

            // render QA results
            domModule.html('#ready', '<h2>' + folder + '</h2>');
            domModule.html('#qa-package-size-' + folder, '(' + helperModule.format_package_size(total_batch_size) + ' - ' + total_batch_file_count + ' files.)<br>');

            window.onbeforeunload = function () {
                return '';
            };

            let parts = folder.split('-');
            let uri_part = parts.pop().replace('_', '/');
            checkCollection(uri_part, folder);

        }, 4000);
    };

    /**
     * Checks if collection exists
     * @param uri
     * @param folder
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

                    // collection doesn't exist, create it
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
                    setTimeout(function() {
                        domModule.html('#' + folder, '<strong>Packages moved to ingest folder.</strong>');
                        // move archival packages to Archivematica SFTP server
                        moveToSftp(pid, folder);
                    }, 4000);
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

                                setTimeout(function () {
                                    window.location.replace('/dashboard/import?collection=' + pid);
                                }, 7000);

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
     * @param folder
     * @param cb (callback function)
     */
    const checkSftpUploadStatus = function (pid, folder, cb) {

        let token = userModule.getUserToken();
        let url = api + endpoints.qa_upload_status + '?pid=' + pid + '&total_batch_file_count=' + total_batch_file_count,
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
                    console.log('check sftp status: ', data);
                    if (data.message === 'upload_complete') {
                        cb('complete');
                    } else if (data.message === 'in_progress') {

                        let file_upload = data.file_names.pop();
                        let tmp = file_upload.split('/');
                        let file = tmp[tmp.length - 1];
                        let html = '<p><strong><em>Uploading packages to Archivematica SFTP server...</em></strong></p>';
                        html += '<ul>';
                        html += '<p>' + data.remote_file_count + ' out of ' + total_batch_file_count + ' files (' + data.remote_package_size + ')</p>';
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

    obj.init = function () {
        qaModule.getReadyFolders();
    };

    return obj;
}());