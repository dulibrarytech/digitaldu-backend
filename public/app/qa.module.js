/**

 Copyright 2023 University of Denver

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

const qaModule = (function() {

    'use strict';

    const api = configModule.getApi();
    const endpoints = endpointsModule.get_qa_endpoints();
    let obj = {};
    let total_batch_file_count;

    /**
     * Gets ready folders
     */
    obj.getReadyFolders = () => {

        (async () => {

            let url = api + endpoints.qa_service.qa_list_ready_folders.endpoint;
            let token = authModule.getUserToken();

            let response = await httpModule.req({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

            if (response.status === 200) {
                domModule.html('#message', null);
                qaModule.renderReadyFolders(response.data);
            } else if (response.status === 401) {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Permission denied.');
            }
            else if (response.status === 500) {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). QA Service is unavailable.');
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get ready folders.');
            }

        })();
    };

    /**
     * Renders ready folders
     * @param data
     * @returns {boolean}
     */
    obj.renderReadyFolders = (data) => {

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
            html += '<td style="text-align: center;vertical-align: middle; width: 15%"><a href="#" type="button" class="btn btn-sm btn-default run-qa" onclick="qaModule.runQAonReady(\'' + prop + '\'); return false;"><i class="fa fa-cogs"></i> <span>Start</span></a></td>';
            html += '</tr>';
        }

        domModule.html('#qa-folders', html);

        setTimeout(() => {
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
    obj.runQAonReady = (folder) => {

        domModule.hide('.run-qa');
        domModule.html('#' + folder, '<strong><em>Running QA process on archival packages...</em></strong>');

        (async () => {

            try {

                let url = api + endpoints.qa_service.qa_run_qa.endpoint + '?folder=' + folder;
                let token = authModule.getUserToken();
                let response = await httpModule.req({
                    method: 'GET',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });

                if (response.status === 200) {
                    poll_qa_queue();
                }

            } catch (error) {
                console.log(error);
                // LOGGER.module().error('ERROR: [/qa/service module (get_total_batch_size)] Unable to get total batch size - ' + error.message);
            }

        })();
    };

    /**
     * Polls queue to check QA status
     */
    const poll_qa_queue = () => {

        let timer = setInterval(async () => {

            let url = api + endpoints.qa_service.qa_status.endpoint;
            let token = authModule.getUserToken();
            let data;
            let response = await httpModule.req({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

            data = response.data;
            let is_complete = data.is_complete;
            display_qa_status(data);

            if (is_complete === 1) {
                clearInterval(timer);
                domModule.show('.run-qa');
                console.log('Polling stopped.');
                return false;
            }

        }, 5000);
    };

    /**
     * Displays QA status
     * @param data
    */
    const display_qa_status = (data) => {

        console.log('TEST: ', data);
        let uuid = data.uuid;
        let collection_folder = data.collection_folder;
        let collection_folder_results = JSON.parse(data.collection_folder_name_results);
        let package_names_results = JSON.parse(data.package_names_results);
        let file_results = JSON.parse(data.file_names_results);
        let uri_txt_results = JSON.parse(data.uri_txt_results);
        let metadata_check = data.metadata_check;
        let total_batch_size = JSON.parse(data.total_batch_size_results);
        let collection_results = data.collection_results;
        let qa_complete = data.is_complete;
        let status = '';

        if (qa_complete === 1) {
            status += '<p><strong>QA process complete.</strong></p>';
        } else {
            status += '<p><strong><em>Running QA process on archival packages...</em></strong></p>';
        }

        status += `<p><strong>QA UUID: ${uuid}</strong></p>`;

        if (total_batch_size == null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Calculating total batch size...</em></p>';
        } else if (total_batch_size.errors > 0) {
            console.log('display errors');
        } else {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Total Batch Size is ${total_batch_size.batch_size}${total_batch_size.size_type}</strong></p>`;
        }

        if (collection_folder_results.folder_name_results.errors !== undefined && collection_folder_results.folder_name_results.errors.length > 0) {
            console.log('display errors');
            console.log(collection_folder_results.folder_name_results.errors);
        } else {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Collection folder name passed.</strong></p>';
        }

        if (package_names_results.package_name_results.errors !== undefined && package_names_results.package_name_results.errors.length > 0) {
            console.log('display errors');
            console.log(package_names_results.package_name_results.errors);
        } else {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Package names passed.</strong></p>';
        }

        if (uri_txt_results === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Checking package uri.txt files...</em></p>';
        } else if (uri_txt_results.get_uri_results.errors > 0) {
            console.log('display errors');
        } else {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Package uri.txt files passed.</strong></p>';
        }

        if (metadata_check.length > 0 && metadata_check !== 'COMPLETE') {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>' + metadata_check + '</em></p>';
        } else if (metadata_check.errors > 0) {
            console.log('display errors');
        } else if (metadata_check === 'COMPLETE') {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Metadata passed.</strong></p>';
        } else {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Metadata checks pending...</em></p>';
        }

        if (file_results === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Checking package files...</em></p>';
        } else if (file_results.file_count_results.errors.length > 0) {

            status += `<p><i class="fa fa-exclamation" style="color: red"></i> ${file_results.file_count_results.errors.length} file errors found out of ${file_results.file_count_results.result} files:</p>`;
            status += '<ul>';

            for (let i=0;i<file_results.file_count_results.errors.length;i++) {
                console.log(file_results.file_count_results.errors[i]);
                status += `<li>${file_results.file_count_results.errors[i]}</li>`;
            }

            status += '</li></ul>';

        } else if (file_results.file_count_results.errors.length === 0) {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>${file_results.file_count_results.result} package files checked.</strong></p>`;
        }

        if (collection_results === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Checking collection...</em></p>';
        } else if (collection_results === 0) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Creating collection...</em></p>';
        } else if (collection_results === 1) {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Collection checked.</strong></p>`;
        }

        domModule.html('#ready', '<h2>' + collection_folder + '</h2>');
        domModule.html('#' + collection_folder, status);

        window.onbeforeunload = () => {
            return '';
        };
    }

    /**
     * Checks if collection exists
     * @param uri
     * @param folder

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
     */

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
                    setTimeout(function () {
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
                                }, 4000);

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

/** DEPRECATE
 * Renders QA results
 * @param data
 * @param folder
 * @returns {boolean}

 const renderQAresults = function (data, folder) {

        let total_batch_size = data.total_batch_size.result;
        let error_obj = display_qa_errors(data);
        total_batch_file_count = data.file_count_results.result;

        domModule.html('#' + folder, '<strong>QA Complete...</strong>');

        // display QA errors if found
        if (error_obj.errors.length > 0) {
            setTimeout(function () {
                domModule.html('#' + folder, error_obj.error_messages);
                domModule.show('.run-qa');
            }, 4000);

            return false;
        }

        setTimeout(function () {

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
 */