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

    let obj = {};
    let api = configModule.getApi();

    /**
     * Renders the directory listing from the Archivematica sftp server
     * @param data
     */
    const renderImportObjects = function (data) {

        let collection = helperModule.getParameterByName('collection'),
            collectionObjects = [],
            html = '';

        if (collection !== null && data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>The collection folder "' + collection + '" is empty.</strong></div>';
            html += '</td>';
            html += '</tr>';
            $('.import-instruction').hide();

            if (document.querySelector('#import-objects')) {
                document.querySelector('#import-objects').innerHTML = html;
            }

            if (document.querySelector('#message')) {
                document.querySelector('#message').innerHTML = '';
            }

            return false;
        }

        if (collection === null && data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>Import in progress.  Please try again after current import has completed.</strong></div>';
            html += '</td>';
            html += '</tr>';
            $('.import-instruction').hide();

            if (document.querySelector('#import-objects')) {
                document.querySelector('#import-objects').innerHTML = html;
            }

            if (document.querySelector('#message')) {
                document.querySelector('#message').innerHTML = '';
            }

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
                    if (collection === null && data.list[i].name.length > 30) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + DOMPurify.sanitize(data.list[i].name) + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + DOMPurify.sanitize(data.list[i].name) + '</a>';
                        html += '</td>';
                    } else if (collection !== null) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + DOMPurify.sanitize(data.list[i].name);
                        html += '</td>';
                    } else if (collection !== null && data.list[i].name.length < 30) {

                        if (document.querySelector('#import-objects')) {
                            document.querySelector('#import-objects').innerHTML = '';
                            document.querySelector('#import-objects').innerHTML = '<div class="alert alert-info"><strong>There are no collections available to import.</strong></div>';
                        }

                        return false;
                    }
                }

                html += '</tr>';
            }
        }

        if (collection !== null && collectionObjects.length > 0) {
            let button = '<a class="btn btn-success btn-xs import-btn" onclick="importModule.queueTransferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';

            if (document.querySelector('.import-button')) {
                document.querySelector('.import-button').innerHTML = button;
            }
        }

        if (document.querySelector('#import-objects')) {
            document.querySelector('#import-objects').innerHTML = html;
        }

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '';
        }
    };

    /**
     * Renders incomplete imported records
     * @param data
     */
    const renderIncompleteRecords = function (data) {

        window.sessionStorage.removeItem('incomplete_records');

        let html = '',
            alignTd = 'style="text-align: center; vertical-align: middle"',
            incomplete = [],
            obj = {},
            startImport;

        startImport = '<p><a class="btn btn-primary" href="#" onclick="importModule.import(); return false;" title="Import missing record components"><i class="fa fa-download"></i> Import Missing Record Components</a></p>';

        if (document.querySelector('#start-import')) {
            document.querySelector('#start-import').innerHTML = startImport;
        }

        for (let i = 0; i < data.length; i++) {

            if (data[i].object_type !== 'object') {
                continue;
            }

            html += '<tr>';
            html += '<td ' + alignTd + '>' + DOMPurify.sanitize(data[i].sip_uuid) + '</td>';

            // determine what is missing from the record
            if (data[i].handle === null || data[i].handle.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].mods_id === null || data[i].mods === null || data[i].mods_id.length === 0 || data[i].mods.length === 0) {

                if (data[i].mods_id.length === 0) {
                    data[i].mods_id = null;
                }

                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].thumbnail === null || data[i].thumbnail.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].file_name === null || data[i].file_name.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].mime_type === null || data[i].mime_type.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].checksum === null || data[i].checksum.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            html += '<td ' + alignTd + '>' + DOMPurify.sanitize(moment(data[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a')) + '</td>';
            html += '</tr>';

            obj.sip_uuid = DOMPurify.sanitize(data[i].sip_uuid);
            obj.pid = DOMPurify.sanitize(data[i].pid);
            obj.is_member_of_collection = DOMPurify.sanitize(data[i].is_member_of_collection);
            obj.handle = DOMPurify.sanitize(data[i].handle);
            obj.mods_id = DOMPurify.sanitize(data[i].mods_id);
            obj.mods = DOMPurify.sanitize(data[i].mods);
            obj.thumbnail = DOMPurify.sanitize(data[i].thumbnail);
            obj.mime_type = DOMPurify.sanitize(data[i].mime_type);
            obj.file_name = DOMPurify.sanitize(data[i].file_name);
            obj.checksum = DOMPurify.sanitize(data[i].checksum);

            incomplete.push(obj);
            obj = {};
            window.sessionStorage.setItem('incomplete_records', JSON.stringify(incomplete));
        }

        if (document.querySelector('#incomplete-records')) {
            document.querySelector('#incomplete-records').innerHTML = html;
        }

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '';
        }
    };

    /**
     * Gets completed records after an ingest/import
     * @param data
     */
    const renderCompleteRecords = function (data) {

        let html = '',
            // TODO: add styles to css
            alignTd = 'style="text-align: center; vertical-align: middle"',
            complete = [];

        for (let i = 0; i < data.length; i++) {

            html += '<tr>';

            let tn = helperModule.getTn(DOMPurify.sanitize(data[i].thumbnail), DOMPurify.sanitize(data[i].mime_type), DOMPurify.sanitize(data[i].pid));

            if (data[i].thumbnail !== null) {
                html += '<td ' + alignTd + '><img style="border: solid 1px;" src="' + tn + '" width="75" height="75"></td>';
            } else {
                html += '<td ' + alignTd + '><img style="border: solid 1px;" src="' + tn + '" width="75" height="75"></td>';
            }

            html += '<td ' + alignTd + '>' + DOMPurify.sanitize(data[i].is_member_of_collection) + '</td>';

            if (data[i].sip_uuid !== null) {
                html += '<td ' + alignTd + '>' + DOMPurify.sanitize(data[i].sip_uuid) + '</td>';
            }

            if (data[i].mods_id !== null) {
                html += '<td ' + alignTd + '>/repositories/2/archival_objects/' + DOMPurify.sanitize(data[i].mods_id) + '</i></td>';
            }

            if (data[i].mime_type !== null) {
                html += '<td ' + alignTd + '>' + DOMPurify.sanitize(data[i].mime_type) + '</td>';
            }

            // TODO: format date
            html += '<td ' + alignTd + '>' + DOMPurify.sanitize(data[i].created) + '</td>';
            html += '</tr>';
        }

        if (document.querySelector('#complete-records')) {
            document.querySelector('#complete-records').innerHTML = html;
        }

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '';
        }
    };

    /**
     * Starts the Archivematica transfer/ingest process
     * @param objects
     * @returns {boolean}
     */
    obj.queueTransferObjects = function (objects) {

        let collection = helperModule.getParameterByName('collection');

        if (collection === null) {

            if (document.querySelector('#message')) {
                document.querySelector('#message').innerHTML = '<div class="alert alert-danger">Unable to start transfer. Collection PID not found.</div>';
            }
            return false;
        }

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/import/queue_objects',
            type: 'post',
            data: {
                collection: collection,
                objects: objects,
                user: userModule.getUserFullName()
            }
        }).done(function (data) {

            $('.import-button').hide();

            if (document.querySelector('#message')) {
                document.querySelector('#message').innerHTML = '<p>Import process starting...</p>';
            }

            setTimeout(function () {

                if (document.querySelector('#message')) {
                    document.querySelector('#message').innerHTML = '';
                }
                window.location.replace('/dashboard/import/status?import=true');
            }, 4000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(jqXHR.status) + '. Unable to retrieve collections.';

                if (jqXHR.status === 401) {

                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/dashboard/error');
                    }, 2000);

                    return false;
                }

                helperModule.renderError(message);
            }
        });
    };

    /**
     * Gets directory listings from archivematica sftp server
     */
    obj.getImportObjects = function () {

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '<p><strong>Loading...</strong></p>';
        }

        let folder = helperModule.getParameterByName('collection'),
            url = api + '/api/admin/v1/import/list?collection=' + null;

        // gets child folders when parent folder (collection) is present
        if (folder !== null) {
            if (document.querySelector('#back')) {
                document.querySelector('#back').innerHTML = '<p><a href="/dashboard/import" class="btn btn-default" id="back"><i class="fa fa-arrow-left"></i> Back</a></p>';
            }

            url = api + '/api/admin/v1/import/list?collection=' + folder;
        }

        userModule.setHeaderUserToken();

        $.ajax(url)
            .done(function (data) {
                renderImportObjects(data);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {

                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(jqXHR.status) + '. Unable to retrieve collections.';

                    if (jqXHR.status === 401) {

                        helperModule.renderError(message);

                        setTimeout(function () {
                            window.location.replace('/dashboard/error');
                        }, 2000);

                        return false;
                    }

                    helperModule.renderError(message);
                }
            });
    };

    /**
     * Gets incomplete import records
     */
    obj.getIncompleteImportRecords = function () {

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '<p><strong>Loading...</strong></p>';
        }

        let url = api + '/api/admin/v1/import/incomplete',
            request = new Request(url, {
                method: 'GET',
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    if (data.length === 0) {
                        $('table').empty();

                        if (document.querySelector('#responses')) {
                            document.querySelector('#responses').innerHTML = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No incomplete records found.</div>';
                        }
                    } else {
                        renderIncompleteRecords(data);
                    }
                });

            } else {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to get incomplete records.';
                helperModule.renderError(message);
            }

        };

        http.req(request, callback);
    };

    obj.getCompleteImportRecords = function () {

        if (document.querySelector('#message')) {
            document.querySelector('#message').innerHTML = '<p><strong>Loading...</strong></p>';
        }

        let url = api + '/api/admin/v1/import/complete',
            request = new Request(url, {
                method: 'GET',
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    if (data.length === 0) {
                        $('table').empty();

                        if (document.querySelector('#responses')) {
                            document.querySelector('#responses').innerHTML = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>';
                        }

                    } else {
                        renderCompleteRecords(data);
                    }
                });

            } else {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to get complete records.';
                helperModule.renderError(message);
            }

        };

        http.req(request, callback);
    };


    obj.import = function () {

        let incompleteRecords = JSON.parse(window.sessionStorage.getItem('incomplete_records'));

        let timer = setInterval(function () {

            if (incompleteRecords.length === 0) {
                clearInterval(timer);
                // reaload
                importModule.getIncompleteImportRecords();
                return false;
            } else {

                let record = incompleteRecords.pop();

                let message = '<p><strong>Importing (' + DOMPurify.sanitize(record.sip_uuid) + ')...</strong></p>';

                if (document.querySelector('#message')) {
                    document.querySelector('#message').innerHTML = message;
                }

                /*
                 if (record.handle === null && record.pid !== null) {
                 importModule.importHandle(record.sip_uuid, record.pid);
                 }

                 if (record.mods === null || record.mods.length === 0) {
                 importModule.importMods(record.sip_uuid, record.mods_id);
                 }
                 */

                if (record.thumbnail === null || record.thumbnail.length === 0) {
                    importModule.importThumbnail(DOMPurify.sanitize(record.sip_uuid));
                }

                if (record.file_name === null) {
                    importModule.importMaster(DOMPurify.sanitize(record.sip_uuid));
                }

                /*
                 if (record.mime_type === null || record.mime_type.length === 0) {
                 importModule.importMimeType(record.sip_uuid);
                 }

                 if (record.checksum === null || record.checksum.length === 0) {
                 importModule.importChecksum(record.sip_uuid);
                 }
                 */
            }

        }, 10000);

        return false;
    };

    /**
     * Enable validation on add mods id form
     */
    obj.modsIdFormValidation = function () {

        $(document).ready(function () {
            $('#id-form').validate({
                submitHandler: function () {

                    let sip_uuid = DOMPurify.sanitize(document.querySelector('#sip-uuid').value.trim()),
                        mods_id = DOMPurify.sanitize(document.querySelector('#mods-id').value.trim());

                    importModule.importModsId(sip_uuid, mods_id);

                    setTimeout(function () {
                        importModule.importMods(sip_uuid, mods_id);
                    }, 4000);

                    if (document.querySelector('#mods-id-form')) {
                        document.querySelector('#mods-id-form').innerHTML = '';
                    }
                }
            });
        });
    };

    /**
     * saves missing mods id to repository record
     * @param sip_uuid
     * @param mods_id
     */
    obj.importModsId = function (sip_uuid, mods_id) {

        let url = api + '/api/admin/v1/import/mods_id',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({mods_id: mods_id, sip_uuid: sip_uuid}),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let responses = document.querySelector('#responses');
                responses.innerHTML = '<p><strong>Archivesapce ID added to repository record</strong></p>';

                setTimeout(function () {
                    responses.innerHTML = '';
                }, 5000);

            } else {
                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to import MODS.';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Renders form that allows users to enter archivespace id
     * @param sip_uuid
     * @returns {boolean}
     */
    obj.createModsIdForm = function (sip_uuid) {

        let html;
        html = '<div class="alert alert-danger">Please enter an Archivespace ID in order to retrieve MODS record</div>';
        html += '<form id="id-form">';
        html += '<input id="sip-uuid" name="sip_uuid" type="hidden" value="' + DOMPurify.sanitize(sip_uuid) + '">';
        html += '<div class="form-group row col-lg-3">';
        html += '<label for="mods-id">* Archivespace ID:</label>';
        html += '<input name="mods_id" type="text" class="form-control form-control-sm" id="mods-id" required><br>';
        html += '<p><button type="submit" class="btn btn-primary" id="add-mods"><i class="fa fa-download"></i>&nbsp;Import MODS</button></p>';
        html += '</div>';
        html += '</form>';

        if (document.querySelector('#mods-id-form')) {
            document.querySelector('#mods-id-form').innerHTML = html;
        }

        importModule.modsIdFormValidation();

        return false;
    };

    /**
     * Imports MODS metadata
     * @param mods_id
     * @param sip_uuid
     * @returns {boolean}
     */
    obj.importMods = function (sip_uuid, mods_id) {

        if (mods_id === null || mods_id === undefined || mods_id.length === 0) {
            importModule.createModsIdForm(sip_uuid);
            return false;
        }

        let url = api + '/api/admin/v1/import/mods',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({mods_id: mods_id, sip_uuid: sip_uuid}),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let responses = document.querySelector('#responses');
                responses.innerHTML = '<p><strong>(' + DOMPurify.sanitize(sip_uuid) + ') MODS added to repository record</strong></p>';
                importModule.getIncompleteImportRecords();

                setTimeout(function () {

                    if (document.querySelector('#responses')) {
                        document.querySelector('#responses').innerHTML = '';
                    }

                }, 5000);

            } else {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to import MODS for record (' + DOMPurify.sanitize(sip_uuid) + ').';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Imports missing handle
     * @param sip_uuid
     */
    obj.importHandle = function (sip_uuid) {
        // TODO
        // console.log('import handle: ', sip_uuid);
        // console.log('import handle: ', pid);
    };

    /**
     * Imports missing thumbnail
     * @param sip_uuid
     */
    obj.importThumbnail = function (sip_uuid) {

        if (sip_uuid === undefined) {
            // TODO: render message
            return false;
        }

        let url = api + '/api/admin/v1/import/thumbnail',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({sip_uuid: sip_uuid}),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let responses = document.querySelector('#responses');
                responses.innerHTML = '<p><strong>Thumbnail path added to repository record</strong></p>';

                setTimeout(function () {

                    if (document.querySelector('#responses')) {
                        document.querySelector('#responses').innerHTML = '';
                    }

                }, 5000);

            } else {
                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to import MODS.';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    obj.importMaster = function (sip_uuid) {

        if (sip_uuid === undefined) {
            // TODO: render message
            return false;
        }

        let url = api + '/api/admin/v1/import/master',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({sip_uuid: sip_uuid}),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let responses = document.querySelector('#responses');
                responses.innerHTML = '<p><strong>Master path added to repository record</strong></p>';

                setTimeout(function () {

                    if (document.querySelector('#responses')) {
                        document.querySelector('#responses').innerHTML = '';
                    }

                }, 5000);

            } else {
                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to import MODS.';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    obj.importMimeType = function (sip_uuid) {
        // TODO: console.log('import mime type: ', sip_uuid);
    };

    obj.importChecksum = function (sip_uuid) {

        if (sip_uuid === undefined) {
            // TODO: render message
            return false;
        }

        let url = api + '/api/admin/v1/import/checksum',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({sip_uuid: sip_uuid}),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let responses = document.querySelector('#responses');
                responses.innerHTML = '<p><strong>Checksum added to repository record</strong></p>';

                setTimeout(function () {

                    if (document.querySelector('#responses')) {
                        document.querySelector('#responses').innerHTML = '';
                    }

                }, 5000);

            } else {
                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to import MODS.';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Gets transfer status
     */
    const get_transfer_status = function () {

        function transfer_status_http() {

            let url = api + '/api/admin/v1/import/poll/transfer_status',
                request = new Request(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': userModule.getUserToken()
                    },
                    mode: 'cors'
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (response) {

                        let transferData = '';

                        if (document.querySelector('#message')) {
                            document.querySelector('#message').innerHTML = '';
                        }

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

                            if (document.querySelector('#transfer-status')) {
                                document.querySelector('#transfer-status').innerHTML = transferData;
                            }

                        } else {

                            if (document.querySelector('#transfer-status')) {
                                document.querySelector('#transfer-status').innerHTML = '<tr><td>No ingests in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
                            }
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                        helperModule.renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). An error has occurred. Unable to get transfer status.';
                    helperModule.renderError(message);
                }
            };

            http.req(request, callback);
        }

        setInterval(function () {
            transfer_status_http();
        }, 4000);

        transfer_status_http();
    };

    // gets count of remaining import objects
    const get_ingest_status = function () {

        function ingest_status_http() {

            let url = api + '/api/admin/v1/import/poll/ingest_status',
                request = new Request(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': userModule.getUserToken()
                    },
                    mode: 'cors'
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (response) {

                        if (response.length > 0) {

                            if (document.querySelector('#import-record-count')) {
                                document.querySelector('#import-record-count').innerHTML = 'Objects remaining in current batch: ' + DOMPurify.sanitize(response[0].count);
                            }

                        } else {

                            if (document.querySelector('#import-record-count')) {
                                document.querySelector('#import-record-count').innerHTML = '';
                            }
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                        helperModule.renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). An error has occurred. Unable to update get ingest status.';
                    helperModule.renderError(message);
                }
            };

            http.req(request, callback);
        }

        setInterval(function () {
            ingest_status_http();
        }, 4000);

        ingest_status_http();
    };

    const get_import_status = function () {

        function import_status_http() {

            let url = api + '/api/admin/v1/import/poll/import_status',
                request = new Request(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': userModule.getUserToken()
                    },
                    mode: 'cors'
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (response) {

                        let importData = '';

                        if (document.querySelector('#message')) {
                            document.querySelector('#message').innerHTML = '';
                        }

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                importData += '<tr>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].sip_uuid) + '</td>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].file) + '</td>';
                                importData += '<td>' + DOMPurify.sanitize(response[i].message) + '</td>';
                                importData += '</tr>';
                            }

                            if (document.querySelector('#import-status')) {
                                document.querySelector('#import-status').innerHTML = importData;
                            }

                        } else {

                            if (document.querySelector('#import-status')) {
                                document.querySelector('#import-status').innerHTML = '<tr><td>No imports in progress</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>';
                            }
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                        helperModule.renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). An error has occurred. Unable to get transfer status.';
                    helperModule.renderError(message);
                }
            };

            http.req(request, callback);
        }

        setInterval(function () {
            import_status_http();
        }, 4000);

        import_status_http();
    };

    const get_fail_status = function () {

        function fail_status_http() {

            let url = api + '/api/admin/v1/import/poll/fail_queue',
                request = new Request(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': userModule.getUserToken()
                    },
                    mode: 'cors'
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (response) {

                        let failData = '';

                        if (document.querySelector('#message')) {
                            document.querySelector('#message').innerHTML = '';
                        }

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                failData += '<tr>';
                                failData += '<td>' + DOMPurify.sanitize(response[i].message) + '</td>';
                                failData += '<td>' + response[i].sip_uuid + '</td>';
                                failData += '<td>' + moment(DOMPurify.sanitize(response[i].created)).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a') + '</td>';
                                failData += '</tr>';
                            }

                            if (document.querySelector('#import-failures')) {
                                document.querySelector('#import-failures').innerHTML = failData;
                            }

                        } else {

                            if (document.querySelector('#import-failures')) {
                                document.querySelector('#import-failures').innerHTML = '';
                                document.querySelector('#import-failures').innerHTML = '<tr><td>No failures reported</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
                            }
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                        helperModule.renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). An error has occurred. Unable to get transfer status.';
                    helperModule.renderError(message);
                }
            };

            http.req(request, callback);
        }

        setInterval(function () {
            fail_status_http();
        }, 10000);

        fail_status_http();
    };

    obj.init = function () {
        userModule.renderUserName();
        helperModule.ping();
        get_ingest_status();
        get_transfer_status();
        get_import_status();
        get_fail_status();
    };

    return obj;

}());

importModule.init();