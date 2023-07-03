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
    const endpoints = '/api/v2/qa'; // endpointsModule.get_qa_endpoints();
    let obj = {};

    /**
     * Gets ready folders
     */
    obj.getReadyFolders = () => {

        (async () => {

            try {

                let url = api + endpoints + '/list-ready-folders';
                let token = authModule.getUserToken();
                let response = await httpQAModule.req({
                    method: 'GET',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });

                if (response !== undefined && response.status === 200) {
                    domModule.html('#message', null);
                    qaModule.renderReadyFolders(response.data);
                }
                /* // TODO: move to error block
                else if (response.status === 401) {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Permission denied.');
                }
                 */

            } catch(error) {
                console.log(error.message);
                authModule.sessionExpired();
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

                let url = api + endpoints + '/run-qa' + '?folder=' + folder;
                let token = authModule.getUserToken();
                let response = await httpQAModule.req({
                    method: 'GET',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });

                if (response.status === 200) {
                    poll_qa_queue(folder);
                }

            } catch (error) {
                console.log(error);
            }

        })();
    };

    /**
     * Polls queue to check QA status
     */
    const poll_qa_queue = (folder) => {

        let timer = setInterval(async () => {

            let url = api + endpoints + '/status';
            let token = authModule.getUserToken();
            let data;
            let response = await httpQAModule.req({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

            data = response.data;
            let is_complete = data.is_complete;
            display_qa_status(folder, data);

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
     * @param folder
     * @param data
    */
    const display_qa_status = (folder, data) => {
        console.log('display_qa_status: ', data);
        let uuid = data.uuid;
        let collection_folder = data.collection_folder;
        let collection_folder_results = JSON.parse(data.collection_folder_name_results);
        let package_names_results = JSON.parse(data.package_names_results);
        let file_results = JSON.parse(data.file_names_results);
        let uri_txt_results = JSON.parse(data.uri_txt_results);
        let metadata_check = data.metadata_check;
        let total_batch_size = JSON.parse(data.total_batch_size_results);
        let collection_results = data.collection_results;
        let moved_to_ingest = JSON.parse(data.moved_to_ingest_results);
        let moved_to_sftp = data.moved_to_sftp_results;
        let sftp_upload_status = JSON.parse(data.sftp_upload_status);
        let qa_errors = data.is_error;
        let qa_complete = data.is_complete;
        let status = '';

        if (qa_complete === 1 && qa_errors === 0) {

            status += '<h5><strong><i class="fa fa-check" style="color: darkgreen"></i> QA process complete.</strong></h5>';
            status += `<p><i class="fa fa-info" style="color: dodgerblue"></i> <strong><em>Preparing to ingest package(s)...<em></strong></p>`;
            domModule.html('#' + collection_folder, status);

            setTimeout(() => {
                window.location.replace('/dashboard/import/status');
            }, 4000);

            return false;

        } else if (qa_complete === 0 && qa_errors === 0) {
            status += '<h5><strong><i class="fa fa-info" style="color: dodgerblue"></i> <em>Running QA process on archival packages...</em></strong></h5>';
        }

        if (qa_errors === 1 && qa_complete === 1) {
            display_qa_errors(folder, data);
            return false;
        }

        status += `<p><strong>QA UUID: ${uuid}</strong></p>`;

        /** TODO:
         * {"data":{"message":"upload_complete","data":[["/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00003/M123.03.0084.0003.00003.tif","/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00003/uri.txt","/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00004/M123.03.0084.0003.00004.tif","/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00004/uri.txt","/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00005/M123.03.0084.0003.00005.tif","/home/denversftp/66266aca-3403-49b5-bae6-ac30dc3fe5eb/M123.03.0084.0003.00005/uri.txt"],6]}}
         */

        if (total_batch_size === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Calculating total batch size...</em></p>';
        } else {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Total Batch Size is ${total_batch_size.batch_size}${total_batch_size.size_type}</strong></p>`;
        }

        if (collection_folder_results !== null) {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Collection folder name passed.</strong></p>';
        }

        if (package_names_results !== null) {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Package names passed.</strong></p>';
        }

        if (uri_txt_results === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Checking package uri.txt files...</em></p>';
        } else {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Package uri.txt files passed.</strong></p>';
        }

        if (file_results === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Checking package files...</em></p>';
        } else if (file_results.file_count_results.errors.length === 0) {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>${file_results.file_count_results.result} package files checked.</strong></p>`;
        }

        if (metadata_check.length > 0 && metadata_check !== 'COMPLETE') {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>' + metadata_check + '</em></p>';
        } else if (metadata_check === 'COMPLETE') {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Metadata passed.</strong></p>';
        } else {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Metadata checks pending...</em></p>';
        }

        if (collection_results === 0) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Collection check pending...</em></p>';
        } else if (collection_results === 1) {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Collection checked.</strong></p>`;
        } else if (collection_results === 2) {
            status += `<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Collection created.</strong></p>`;
        }

        if (moved_to_ingest === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Move to ingest folder pending...</em></p>';
        } else if (moved_to_ingest.result === 'packages_moved_to_ingested_folder.') {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Packages moved to ingest folder.</strong></p>';
        }

        if (sftp_upload_status !== null && sftp_upload_status.data.message === 'upload_complete') {
            status += '<p><i class="fa fa-check" style="color: darkgreen"></i> <strong>Package(s) moved to Archivematica SFTP.</strong></p>';
        } else if (sftp_upload_status !== null && sftp_upload_status.data.message !== 'upload_complete') {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Uploading package(s) to Archivematica SFTP...</em></p>';

            let file_names = sftp_upload_status.data.file_names;

            status += '<p>' + sftp_upload_status.data.remote_file_count + ' out of ' + sftp_upload_status.data.local_file_count + ' files (' + sftp_upload_status.data.remote_package_size + ')</p>';
            status += '<ul>';

            let file_upload = file_names.pop();
            let tmp = file_upload.split('/');
            let file = tmp[tmp.length - 1];
            status += '<li>Uploading: ' + file + '</li>';
            status += '</ul>';

        } else if (sftp_upload_status === null) {
            status += '<p><i class="fa fa-info" style="color: dodgerblue"></i> <em>Move to Archivematica SFTP pending...</em></p>';
        }

        domModule.html('#ready', '<h2>' + collection_folder + '</h2>');
        domModule.html('#' + collection_folder, status);

        /*
        window.onbeforeunload = () => {
            return '';
        };

         */
    }

    /**
     * Displays QA errors
     * @param collection_folder
     * @param data
     */
    const display_qa_errors = (collection_folder, data) => {

        console.log(data);
        // TODO: render sftp errors
        // TODO: render move to ingest errors
        try {

            let collection_folder_results = JSON.parse(data.collection_folder_name_results);
            let package_names_results = JSON.parse(data.package_names_results);
            let file_results = JSON.parse(data.file_names_results);
            let metadata_check_results = JSON.parse(data.metadata_check_results);
            let total_batch_size = JSON.parse(data.total_batch_size_results);
            let collection_results = data.collection_results;
            let sftp_upload_status = JSON.parse(data.sftp_upload_status);

            let status = '<h5><strong><i class="fa fa-exclamation" style="color: red"></i> QA process halted. Errors found.</strong></h5>';

            if (data.collection_folder === 'error') {
                status += '<i class="fa fa-exclamation" style="color: red"></i> QA service was unable to set folder';
            }

            if (collection_folder_results.folder_name_results.errors.length > 0) {

                status += `<p><i class="fa fa-exclamation" style="color: red"></i> Collection folder name error(s)</p>`;
                status += '<ul>';

                for (let i = 0; i < collection_folder_results.folder_name_results.errors.length; i++) {
                    status += `<li>${collection_folder_results.folder_name_results.errors[i]}</li>`;
                }

                status += '</li></ul>';
            }

            if (total_batch_size !== null && total_batch_size.errors.length > 0) {
                status += `<ul><li>${total_batch_size.errors}</li></ul>`;
            }

            if (package_names_results !== null && package_names_results.package_name_results.errors > 0) {

                status += `<p><i class="fa fa-exclamation" style="color: red"></i> Package name error(s)</p>`;
                status += '<ul>';

                for (let i = 0; i < package_names_results.package_name_results.errors.length; i++) {
                    status += `<li>${package_names_results.package_name_results.errors[i]}</li>`;
                }

                status += '</li></ul>';
            }

            if (file_results !== null && file_results.file_count_results.errors.length > 0) {

                status += `<p><i class="fa fa-exclamation" style="color: red"></i> ${file_results.file_count_results.errors.length} file error(s) found out of ${file_results.file_count_results.result} files:</p>`;
                status += '<ul>';

                for (let i=0;i<file_results.file_count_results.errors.length;i++) {
                    status += `<li>${file_results.file_count_results.errors[i]}</li>`;
                }

                status += '</li></ul>';
            }

            if (metadata_check_results !== null && metadata_check_results.length > 0) {

                status += `<p><i class="fa fa-exclamation" style="color: red"></i> ${metadata_check_results.length} file error(s) found:</p>`;
                status += '<ul>';

                for (let i=0;i<metadata_check_results.length;i++) {
                    status += `<li>${metadata_check_results[i].uuid_error} - ${metadata_check_results[i].field_error}</li>`;
                }

                status += '</li></ul>';
            }

            if (collection_results === 3) {
                status += `<p><i class="fa fa-exclamation" style="color: red"></i> There is a collection error</p>`;
            }

            console.log('sftp_upload_status', sftp_upload_status);
            /* TODO: errors
            if (sftp_upload_status === false) {
                status += `<p><i class="fa fa-exclamation" style="color: red"></i> Upload to Archivematica SFTP failed</p>`;
            }

             */

            domModule.html('#' + collection_folder, status);

        } catch (error) {
            console.log('ERROR: ', error);
        }
    };

    obj.init = function () {
        qaModule.getReadyFolders();
    };

    return obj;

}());
