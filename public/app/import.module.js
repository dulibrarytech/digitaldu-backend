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

    let renderError = function (message) {
        $('#message').html(message);
    };

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
            $('#import-objects').html(html);
            $('#message').html('');
            return false;
        }

        if (collection === null && data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>Import in progress.  Please try again after current import has completed.</strong></div>';
            html += '</td>';
            html += '</tr>';
            $('.import-instruction').hide();
            $('#import-objects').html(html);
            $('#message').html('');
            return false;
        }

        for (let i = 0; i < data.list.length; i++) {

            if (data.list[i].name.charAt(0) !== '.') {

                html += '<tr>';

                // render folder or file
                if (data.list[i].type === 'd') {

                    if (collection !== null) {
                        collectionObjects.push(data.list[i].name);
                    }

                    // list collection folders only
                    if (collection === null && data.list[i].name.length > 30) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';
                        html += '</td>';
                    } else if (collection !== null) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name;
                        html += '</td>';
                    } else if (collection !== null && data.list[i].name.length < 30) {
                        $('#import-objects').html('');
                        $('#import-objects').html('<div class="alert alert-info"><strong>There are no collections available to import.</strong></div>');
                        return false;
                    }

                }

                html += '</tr>';
            }
        }

        if (collection !== null && collectionObjects.length > 0) {
            let button = '<a class="btn btn-success btn-xs import-btn" onclick="importModule.queueTransferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
            $('.import-button').html(button);
        }

        $('#import-objects').html(html);
        $('#message').html('');
    };

    /**
     * Renders incomplete imported records
     * @param data
     */
    const renderIncompleteRecords = function (data) {

        window.sessionStorage.removeItem('incomplete_records');

        let html = '',
            // TODO: add styles to css
            alignTd = 'style="text-align: center; vertical-align: middle"',
            incomplete = [],
            obj = {},
            startImport;

        startImport = '<p><a class="btn btn-primary" href="#" onclick="importModule.import(); return false;" title="Import missing record components"><i class="fa fa-download"></i> Import Missing Record Components</a></p>';
        $('#start-import').html(startImport);

        for (let i = 0; i < data.length; i++) {

            if (data[i].object_type !== 'object') {
                continue;
            }

            html += '<tr>';
            html += '<td ' + alignTd + '>' + data[i].sip_uuid + '</td>';

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

            html += '<td ' + alignTd + '>' + moment(data[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a') + '</td>';
            html += '</tr>';

            obj.sip_uuid = data[i].sip_uuid;
            obj.pid = data[i].pid;
            obj.is_member_of_collection = data[i].is_member_of_collection;
            obj.handle = data[i].handle;
            obj.mods_id = data[i].mods_id;
            obj.mods = data[i].mods;
            obj.thumbnail = data[i].thumbnail;
            obj.mime_type = data[i].mime_type;
            obj.file_name = data[i].file_name;
            obj.checksum = data[i].checksum;

            incomplete.push(obj);
            obj = {};
            window.sessionStorage.setItem('incomplete_records', JSON.stringify(incomplete));
        }

        $('#incomplete-records').html(html);
        $('#message').html('');
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

            let tn = helperModule.getTn(data[i].thumbnail, data[i].mime_type, data[i].pid);

            if (data[i].thumbnail !== null) {
                html += '<td ' + alignTd + '><img style="border: solid 1px;" src="' + tn + '" width="75" height="75"></td>';
            } else {
                html += '<td ' + alignTd + '><img style="border: solid 1px;" src="' + tn + '" width="75" height="75"></td>';
            }

            html += '<td ' + alignTd + '>' + data[i].is_member_of_collection + '</td>';

            if (data[i].sip_uuid !== null) {
                html += '<td ' + alignTd + '>' + data[i].sip_uuid + '</td>';
            }

            if (data[i].mods_id !== null) {
                html += '<td ' + alignTd + '>/repositories/2/archival_objects/' + data[i].mods_id + '</i></td>';
            }

            if (data[i].mime_type !== null) {
                html += '<td ' + alignTd + '>' + data[i].mime_type + '</td>';
            }

            // TODO: format date
            html += '<td ' + alignTd + '>' + data[i].created + '</td>';
            html += '</tr>';
        }

        $('#complete-records').html(html);
        $('#message').html('');
    };


    /**
     * Starts the Archivematica transfer/ingest process
     * @param objects
     * @returns {boolean}
     */
    obj.queueTransferObjects = function (objects) {

        let collection = helperModule.getParameterByName('collection');

        if (collection === null) {
            $('#message').html('<div class="alert alert-danger">Unable to start transfer. Collection PID not found.</div>');
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
            $('#message').html('<p>Import process starting...</p>');

            setTimeout(function () {
                $('#message').html('');
                window.location.replace('/dashboard/import/status?import=true');
            }, 4000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collections.</div>';

                if (jqXHR.status === 401) {

                    renderError(message);

                    setTimeout(function () {
                        window.location.replace('/dashboard/error');
                    }, 2000);

                    return false;
                }

                renderError(message);
            }
        });
    };

    /**
     * Gets directory listings from archivematica sftp server
     */
    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        let folder = helperModule.getParameterByName('collection'),
            url = api + '/api/admin/v1/import/list?collection=' + null;

        // gets child folders when parent folder (collection) is present
        if (folder !== null) {
            $('#back').html('<p><a href="/dashboard/import" class="btn btn-default" id="back"><i class="fa fa-arrow-left"></i> Back</a></p>');
            url = api + '/api/admin/v1/import/list?collection=' + folder;
        }

        userModule.setHeaderUserToken();

        $.ajax(url)
            .done(function (data) {
                renderImportObjects(data);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collections.</div>';

                    if (jqXHR.status === 401) {

                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/dashboard/error');
                        }, 2000);

                        return false;
                    }

                    renderError(message);
                }
            });
    };

    /**
     * Gets incomplete import records
     */
    obj.getIncompleteImportRecords = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

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
                        let message = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No incomplete records found.</div>';
                        $('#responses').html(message);
                    } else {
                        renderIncompleteRecords(data);
                    }
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to get incomplete records.</div>';
                renderError(message);
            }

        };

        http.req(request, callback);
    };

    obj.getCompleteImportRecords = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

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
                        let message = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No complete records found.</div>';
                        $('#responses').html(message);
                    } else {
                        renderCompleteRecords(data);
                    }
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to get complete records.</div>';
                renderError(message);
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

                let message = '<p><strong>Importing (' + record.sip_uuid + ')...</strong></p>';
                $('#message').html(message);

                /*
                if (record.handle === null && record.pid !== null) {
                    importModule.importHandle(record.sip_uuid, record.pid);
                }

                if (record.mods === null || record.mods.length === 0) {
                    importModule.importMods(record.sip_uuid, record.mods_id);
                }
                */

                if (record.thumbnail === null || record.thumbnail.length === 0) {
                    importModule.importThumbnail(record.sip_uuid);
                }

                if (record.file_name === null) {
                    importModule.importMaster(record.sip_uuid);
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

                    let sip_uuid = document.querySelector('#sip-uuid').value.trim(),
                        mods_id = document.querySelector('#mods-id').value.trim();

                    importModule.importModsId(sip_uuid, mods_id);

                    setTimeout(function () {
                        importModule.importMods(sip_uuid, mods_id);
                    }, 4000);

                    $('#mods-id-form').html('');
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

                let responses = document.getElementById('responses');
                responses.innerHTML = '<p><strong>Archivesapce ID added to repository record</strong></p>';

                setTimeout(function () {
                    responses.innerHTML = '';
                }, 5000);

            } else {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
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
        html += '<input id="sip-uuid" name="sip_uuid" type="hidden" value="' + sip_uuid + '">';
        html += '<div class="form-group row col-lg-3">';
        html += '<label for="mods-id">* Archivespace ID:</label>';
        html += '<input name="mods_id" type="text" class="form-control form-control-sm" id="mods-id" required><br>';
        html += '<p><button type="submit" class="btn btn-primary" id="add-mods"><i class="fa fa-download"></i>&nbsp;Import MODS</button></p>';
        html += '</div>';
        html += '</form>';

        $('#mods-id-form').html(html);
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

                let responses = document.getElementById('responses');
                responses.innerHTML = '<p><strong>(' + sip_uuid + ') MODS added to repository record</strong></p>';
                importModule.getIncompleteImportRecords();

                setTimeout(function () {
                    $('#responses').html('');
                }, 5000);


            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS for record (' + sip_uuid + ').</div>';
                renderError(message);
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

                let responses = document.getElementById('responses');
                responses.innerHTML = '<p><strong>Thumbnail path added to repository record</strong></p>';
                // importModule.getIncompleteImportRecords();

                setTimeout(function () {
                    $('#responses').html('');
                }, 5000);

            } else {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
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

                let responses = document.getElementById('responses');
                responses.innerHTML = '<p><strong>Master path added to repository record</strong></p>';
                // importModule.getIncompleteImportRecords();

                setTimeout(function () {
                    $('#responses').html('');
                }, 5000);

            } else {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
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

                let responses = document.getElementById('responses');
                responses.innerHTML = '<p><strong>Checksum added to repository record</strong></p>';

                setTimeout(function () {
                    $('#responses').html('');
                }, 5000);

            } else {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Gets transfer status
     */
    const get_transfer_status = function () {

        function transfer_status_http () {

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

                        $('#message').html('');

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                transferData += '<tr>';
                                transferData += '<td>' + response[i].is_member_of_collection + '</td>';
                                transferData += '<td>' + response[i].object + '</td>';
                                transferData += '<td>' + response[i].microservice + '</td>';
                                transferData += '<td>' + response[i].user + '</td>';
                                transferData += '<td>' + response[i].message + '</td>';
                                transferData += '</tr>';
                            }

                            $('#transfer-status').html(transferData);

                        } else {

                            $('#transfer-status').html('<tr><td>No ingests in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');

                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.</div>';
                    renderError(message);
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

        function ingest_status_http () {

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
                            $('#import-record-count').html('Objects remaining in current batch: ' + response[0].count);
                        } else {
                            $('#import-record-count').html('');
                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). An error has occurred. Unable to update get ingest status.</div>';
                    renderError(message);
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

        function import_status_http () {

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

                        $('#message').html('');

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                importData += '<tr>';
                                importData += '<td>' + response[i].sip_uuid + '</td>';
                                importData += '<td>' + response[i].file + '</td>';
                                importData += '<td>' + response[i].message + '</td>';
                                importData += '</tr>';
                            }

                            $('#import-status').html(importData);

                        } else {

                            $('#import-status').html('<tr><td>No imports in progress</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>');

                        }
                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.</div>';
                    renderError(message);
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

        function fail_status_http () {

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

                        $('#message').html('');

                        if (response.length > 0) {

                            for (let i = 0; i < response.length; i++) {

                                failData += '<tr>';
                                failData += '<td>' + response[i].message + '</td>';
                                failData += '<td>' + response[i].sip_uuid + '</td>';
                                // failData += '<td>' + response[i].created + '</td>';
                                failData += '<td>' + moment(response[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a') + '</td>';
                                failData += '</tr>';
                            }

                            $('#import-failures').html(failData);

                        } else {
                            $('#import-failures').html('');
                            $('#import-failures').html('<tr><td>No failures reported</td><td>&nbsp;</td><td>&nbsp;</td></tr>');

                        }


                    });

                } else if (response.status === 401) {

                    response.json().then(function (response) {

                        let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/login');
                        }, 4000);
                    });

                } else {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). An error has occurred. Unable to get transfer status.</div>';
                    renderError(message);
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