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

const importModule = (function () {

    'use strict';

    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Renders the directory listing from the Archivematica sftp server
     * @param data
     */
    const renderImportObjects = function (data) {

        let collection = helperModule.getParameterByName('collection'),
            collectionObjects = [],
            uuids = [],
            html = '';

        if (collection !== null && data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>The collection folder "' + collection + '" is empty.</strong></div>';
            html += '</td>';
            html += '</tr>';

            domModule.hide('.import-instruction');
            domModule.html('#import-objects', html);
            domModule.html('#message', null);

            return false;
        }

        if (collection === null && data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>Import in progress.  Please try again after current import has completed.</strong></div>';
            html += '</td>';
            html += '</tr>';

            domModule.hide('.import-instruction');
            domModule.html('#import-objects', html);
            domModule.html('#message', null);

            return false;
        }

        for (let i = 0; i < data.list.length; i++) {

            if (data.list[i].name.charAt(0) !== '.') {

                html += '<tr>';

                // render folder or file
                if (data.list[i].type === 'd') {

                    if (collection !== null) {
                        collectionObjects.push(DOMPurify.sanitize(data.list[i].name));
                    }

                    // list collection folders only
                    if (collection === null && validator.isUUID(data.list[i].name) === true) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + DOMPurify.sanitize(data.list[i].name) + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + DOMPurify.sanitize(data.list[i].name) + '</a>';
                        html += '</td>';
                        uuids.push(DOMPurify.sanitize(data.list[i].name));
                    } else if (collection !== null) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + DOMPurify.sanitize(data.list[i].name);
                        html += '</td>';
                    }
                }

                html += '</tr>';
            }
        }

        if (collection !== null && collectionObjects.length > 0) {
            let button = '<a class="btn btn-success btn-xs import-btn" onclick="importModule.queueTransferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
            domModule.html('.import-button', button);
        }

        domModule.html('#import-objects', html);
        domModule.html('#message', null);
        domModule.html('.loading', null);
    };

    /**
     * Gets completed records after an ingest/import
     * @param data
     */
    const renderCompleteRecords = function (data) {

        let html = '',
            alignTd = 'style="text-align: center; vertical-align: middle"';

        for (let i = 0; i < data.length; i++) {

            if (data[i].mods === null) {
                continue;
            }

            let mods = JSON.parse(data[i].mods);
            let title = mods.title;
            let identifier = mods.identifiers[0].identifier;
            let display_record = JSON.parse(data[i].display_record);
            let token = userModule.getUserToken();

            // html += '<td width="25%" ' + alignTd + '><a href="/dashboard/objects/unpublished?pid=' + data[i].is_member_of_collection + '&unpublished">' + DOMPurify.sanitize(data[i].is_member_of_collection) + '</a></td>'; // data[i].collection_title

            if (data[i].sip_uuid !== null) {

                let compound = '';

                if (display_record.is_compound === 1) {
                    compound = '&nbsp;&nbsp;<i class="fa fa-cubes"></i>';
                }

                html += '<td ' + alignTd + '><a href="' + api + endpoints.repo_object_viewer + '?uuid=' + DOMPurify.sanitize(data[i].sip_uuid) + '&t=' + token + '" target="_blank">' + DOMPurify.sanitize(title) + compound + '</a></td>';
            }

            if (data[i].mods_id !== null) {
                html += '<td width="15%" ' + alignTd + '><a href="' + configModule.getASpace() + configModule.getUriPath() + DOMPurify.sanitize(data[i].mods_id) + '" target="_blank">' + identifier + '</a></i></td>';
            }

            html += '<td width="15%" ' + alignTd + '>' + DOMPurify.sanitize(moment(data[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a')) + '</td>';

            if (data[i].is_published === 0) {
                html += '<td id="publish-import-' + data[i].pid + '" width="5%" ' + alignTd + '><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data[i].sip_uuid) + '\', \'object\'); return false;" title="Publish record"><i class="fa fa-cloud-upload"></i><br><small>Unpublished</small></a></td>';
            } else if (data[i].is_published === 1) {
                html += '<td id="publish-import-' + data[i].pid + '" width="5%" ' + alignTd + ' title="Published"><i class="fa fa-cloud"></i><br><small>Published</small></td>';
            }

            html += '</tr>';
        }

        domModule.html('#complete-records', html);
        domModule.html('#message', null);
        domModule.html('.loading', null);
        $('#completed-imports-table').DataTable({
            'pageLength': 25,
            'order': [[ 2, 'desc' ]]
        });

        document.querySelector('#completed-imports-table-th-head').style.visibility = 'visible';
    };

    /** TODO: redirect - no api call
     * Starts the Archivematica transfer/ingest process
     * @param objects
     * @returns {boolean}
     */
    obj.queueTransferObjects = function (objects) {

        domModule.hide('.import-button');
        domModule.html('#message', '<p>Import process starting...</p>');

        setTimeout(function () {
            domModule.html('#message', null);
            window.location.replace('/dashboard/import/status?import=true');
        }, 5000);

    }

    /**
     * Gets directory listings from archivematica sftp server
     */
    obj.getImportObjects = function () {

        let folder = helperModule.getParameterByName('collection'),
            url = api + endpoints.import_list + '?collection=' + null;

        // gets child folders when parent folder (collection) is present
        if (folder !== null) {
            domModule.html('#back', '<p><a href="/dashboard/import" class="btn btn-default" id="back"><i class="fa fa-arrow-left"></i> Back</a></p>');
            url = api + endpoints.import_list + '?collection=' + folder;
        }

        let token = userModule.getUserToken(),
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
                    renderImportObjects(data);
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get import records.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Gets completed import records for current day
     */
    obj.getCompleteImportRecords = function () {

        let url = api + endpoints.import_complete,
            token = userModule.getUserToken(),
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

                    if (data.length === 0) {

                        domModule.empty('#completed-imports-table');
                        domModule.html('#responses', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No imports have been processed today.</div>');
                        domModule.html('.loading', null);

                    } else {
                        renderCompleteRecords(data);
                    }
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get complete records.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Gets transfer status
     */
    const get_transfer_status = function () {

        function transfer_status_http() {

            let url = api + endpoints.import_poll_transfer_status,
                token = userModule.getUserToken(),
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

                    response.json().then(function (response) {

                        let transferData = '';

                        domModule.html('#message', null);

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                transferData += '<tr>';
                                transferData += '<td>' + DOMPurify.sanitize(response[i].is_member_of_collection) + '</td>';
                                transferData += '<td>' + DOMPurify.sanitize(response[i].object) + '</td>';
                                transferData += '<td>' + DOMPurify.sanitize(response[i].microservice) + '</td>';
                                transferData += '<td>' + DOMPurify.sanitize(response[i].user) + '</td>';
                                transferData += '<td>' + DOMPurify.sanitize(response[i].message) + '</td>';
                                transferData += '</tr>';
                            }

                            domModule.html('#transfer-status', transferData);

                        } else {
                            domModule.html('#transfer-status', '<tr><td>No ingests in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.');
                }
            };

            httpModule.req(request, callback);
        }

        setInterval(function () {
            transfer_status_http();
        }, 4000);

        transfer_status_http();
    };

    /**
     * Gets count of remaining import objects
     */
    const get_ingest_status = function () {

        function ingest_status_http() {

            let url = api + endpoints.import_poll_ingest_status,
                token = userModule.getUserToken(),
                request = new Request(url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    },
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (response) {

                        if (response[0].count > 0) {
                            domModule.html('#import-record-count', 'Objects remaining in current batch: ' + DOMPurify.sanitize(response[0].count));
                        } else {
                            domModule.html('#import-record-count', null);
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). An error has occurred. Unable to update get ingest status.');
                }
            };

            httpModule.req(request, callback);
        }

        setInterval(function () {
            ingest_status_http();
        }, 4000);

        ingest_status_http();
    };

    /**
     * Gets import status
     */
    const get_import_status = function () {

        function import_status_http() {

            let url = api + endpoints.import_poll_import_status,
                token = userModule.getUserToken(),
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

                    response.json().then(function (response) {

                        let importData = '';
                        domModule.html('#message', null);

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                importData += '<tr>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].sip_uuid) + '</td>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].file) + '</td>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].message) + '</td>';
                                importData += '</tr>';
                            }

                            domModule.html('#import-status', importData);

                        } else {
                            domModule.html('#import-status', '<tr><td>No imports in progress</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>');
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.');
                }
            };

            httpModule.req(request, callback);
        }

        setInterval(function () {
            import_status_http();
        }, 4000);

        import_status_http();
    };

    /**
     * Gets import failures
     */
    const get_fail_status = function () {

        function fail_status_http() {

            let url = api + endpoints.import_poll_fail_queue,
                token = userModule.getUserToken(),
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

                    response.json().then(function (response) {

                        let failData = '';
                        domModule.html('#message', null);

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                failData += '<tr>';
                                failData += '<td>' + DOMPurify.sanitize(response[i].message) + '</td>';
                                failData += '<td>' + response[i].sip_uuid + '</td>';
                                failData += '<td>' + moment(DOMPurify.sanitize(response[i].created)).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a') + '</td>';
                                failData += '</tr>';
                            }

                            domModule.html('#import-failures', failData);

                        } else {
                            domModule.html('#import-failures', '<tr><td>No failures reported</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.');
                }
            };

            httpModule.req(request, callback);
        }

        setInterval(function () {
            fail_status_http();
        }, 10000);

        fail_status_http();
    };

    obj.init = function () {
        get_ingest_status();
        get_transfer_status();
        get_import_status();
        get_fail_status();
    };

    return obj;

}());

importModule.init();