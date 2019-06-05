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
                    // if (collection === null && data.list[i].name.search('codu') !== -1) {
                    if (collection === null && data.list[i].name.length > 30) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';
                        html += '</td>';
                    } else if (collection !== null) {
                        html += '<td>';
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name;
                        html += '</td>';
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

    /** TODO: ...
     * Renders the directory listing from the Archivematica sftp server
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

            html += '<tr>';
            html += '<td ' + alignTd + '>' + data[i].sip_uuid + '</td>';

            // determine what is missing from the record
            if (data[i].is_member_of_collection === null) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].pid === null || data[i].pid.length === 0) {
                html += '<td ' + alignTd + '><i class="fa fa-exclamation"></i></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

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

            // TODO: format date
            html += '<td ' + alignTd + '>' + data[i].created + '</td>';
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

            incomplete.push(obj);
            obj = {};
            window.sessionStorage.setItem('incomplete_records', JSON.stringify(incomplete));
        }

        $('#incomplete-records').html(html);
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

        $.ajax({
            url: api + '/api/admin/v1/import/queue_objects',
            type: 'post',
            data: {collection: collection, objects: objects, user: userModule.getUserFullName()}
        }).done(function (data) {

            // TODO: check payload
            console.log(data);

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
     * Accepts status broadcasts
     */
    obj.getImportStatus = function () {

        if (helperModule.getParameterByName('import') === 'true') {
            $('#message').html('<p>One Moment Please...</p>');
        } else {
            $('#message').html('');
        }

        let socket = io();

        socket.on('ingest_status', function (data) {

            if (data.length > 0) {
                $('#import-record-count').html('Objects remaining in current batch: ' + data[0].count);
            } else {
                $('#import-record-count').html('');
            }
        });

        socket.on('fail_status', function (data) {

            let failData = '';

            $('#message').html('');

            if (data.length > 0) {

                for (let i = 0; i < data.length; i++) {

                    failData += '<tr>';
                    failData += '<td>' + data[i].message + '</td>';
                    failData += '<td>' + data[i].is_member_of_collection + '</td>';
                    failData += '<td>' + data[i].sip_uuid + '</td>';
                    failData += '<td>' + data[i].transfer_uuid + '</td>';
                    failData += '<td>' + data[i].created + '</td>';
                    failData += '</tr>';
                }

                $('#import-failures').html(failData);

            } else {
                $('#import-failures').html('');
                $('#import-failures').html('<tr><td>No failures reported</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');

            }
        });

        socket.on('transfer_status', function (data) {

            let transferData = '';

            $('#message').html('');

            if (data.length > 0) {

                for (let i = 0; i < data.length; i++) {

                    transferData += '<tr>';
                    transferData += '<td>' + data[i].is_member_of_collection + '</td>';
                    transferData += '<td>' + data[i].object + '</td>';
                    transferData += '<td>' + data[i].microservice + '</td>';
                    transferData += '<td>' + data[i].user + '</td>';
                    transferData += '<td>' + data[i].message + '</td>';
                    transferData += '<td>' + data[i].created + '</td>';
                    transferData += '</tr>';
                }

                $('#transfer-status').html(transferData);

            } else {

                $('#transfer-status').html('<tr><td>No ingests in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');

            }
        });

        socket.on('import_status', function (data) {

            let importData = '';

            $('#message').html('');

            if (data.length > 0) {

                for (let i = 0; i < data.length; i++) {

                    importData += '<tr>';
                    importData += '<td>' + data[i].sip_uuid + '</td>';
                    importData += '<td>' + data[i].file + '</td>';
                    importData += '<td>' + data[i].message + '</td>';
                    importData += '<td>' + data[i].created + '</td>';
                    importData += '</tr>';
                }

                $('#import-status').html(importData);

            } else {

                $('#import-status').html('<tr><td>No imports in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>');

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

                    $('#message').html('');

                    if (data.length === 0) {
                        let message = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No incomplete records found.</div>';
                        $('table').empty();
                        $('#message').html(message);
                    } else {
                        // $('#incomplete-records').show();
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

    obj.import = function () {

        let incompleteRecords = JSON.parse(window.sessionStorage.getItem('incomplete_records'));

        let timer = setInterval(function () {

            if (incompleteRecords.length === 0) {
                clearInterval(timer);
                return false;
            } else {

                let record = incompleteRecords.pop();

                let message = '<p><strong>Importing (' + record.sip_uuid + ')...</strong></p>';
                $('#message').html(message);

                if (record.pid === null || record.pid.length === 0) {
                    importModule.importPid(record.sip_uuid);
                }

                if (record.is_member_of_collection === null && record.pid !== null) {
                    importModule.importCollection(record.sip_uuid, record.pid);
                }

                if (record.handle === null && record.pid !== null) {
                    importModule.importHandle(record.sip_uuid, record.pid);
                }

                if (record.mods === null || record.mods.length === 0) {
                    importModule.importMods(record.sip_uuid, record.mods_id);
                }

                if (record.thumbnail === null || record.thumbnail.length === 0) {
                    importModule.importThumbnail(record.sip_uuid);
                }

                if (record.mime_type === null || record.mime_type.length === 0) {
                    importModule.importMimeType(record.sip_uuid);
                }

                if (record.file_name === null) {
                    importModule.importMaster(record.sip_uuid);
                }
            }

        }, 1000);

        return false;
    };

    obj.importPid = function (sip_uuid) {
        // console.log('import pid: ', sip_uuid);
    };

    obj.importHandle = function (sip_uuid, pid) {
        // console.log('import handle: ', sip_uuid);
        // console.log('import handle: ', pid);
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
                responses.innerHTML = '<p><strong>Thumbnail added to repository record</strong></p>';
                importModule.getIncompleteImportRecords();


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

    // TODO: ...
    obj.importCollection = function (sip_uuid, pid) {
        // console.log('import collection: ', sip_uuid);
        // console.log('import collection: ', pid);
    };

    obj.importMaster = function (sip_uuid) {
        // console.log('import master: ', sip_uuid);
    };

    obj.importMimeType = function (sip_uuid) {
        // console.log('import mime type: ', sip_uuid);
    };

    obj.init = function () {
        userModule.renderUserName();
        helperModule.ping();
    };

    return obj;

}());

importModule.init();