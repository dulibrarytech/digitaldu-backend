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

        if (data.list.length === 0) {
            html += '<tr>';
            html += '<td>';
            html += '<div class="alert alert-info"><i class="fa fa-exclamation-triangle"></i> <strong>Import in progress.  Please try again after current import has completed.</strong></div>';
            html += '</td>';
            html += '</tr>';
            $('.import-instruction').hide();
            $('#import-objects').html(html);
            $('#message').empty();
            return false;
        }

        // TODO: check for codu namespace in collection name
        // TODO: return error message if codu namespace not found in collection name
        for (let i = 0; i < data.list.length; i++) {

            if (data.list[i].name.charAt(0) !== '.') {

                html += '<tr>';

                // render folder or file
                if (data.list[i].type === 'd') {

                    if (collection !== null) {
                        collectionObjects.push(data.list[i].name);
                    }

                    html += '<td>';

                    if (collection !== null) {
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name;
                    } else {
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';
                    }

                    html += '</td>';
                }

                html += '</tr>';
            }
        }

        if (collection !== null && collectionObjects.length > 0) {
            let button = '<a class="btn btn-success btn-xs import-btn" onclick="importModule.queueTransferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
            $('.import-button').html(button);
        }

        $('#import-objects').html(html);
        $('#message').empty();
    };

    /** TODO: ...
     * Renders the directory listing from the Archivematica sftp server
     * @param data
     */
    const renderIncompleteRecords = function (data) {

        let html = '';

        // TODO: provide ability to fix incomplete record.
        // TODO: add styles to css
        let alignTd = 'style="text-align: center; vertical-align: middle"';

        for (let i = 0; i < data.length; i++) {

            html += '<tr>';
            html += '<td ' + alignTd + '>' + data[i].sip_uuid + '</td>';

            // determine what is missing from the record
            // TODO: how allow user to add missing parts of a record
            if (data[i].is_member_of_collection === null) {
                html += '<td style="text-align: center; vertical-align: middle"><a class="btn btn-xs btn-danger" href="#" onclick="importModule.addToCollection(' + data[i].id + '); return false;" title="Missing Collection PID"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].pid === null) {
                html += '<td ' + alignTd + '><a class="btn btn-xs btn-danger" href="#" onclick="objectsModule.addPid(' + data[i].id + '); return false;" title="Missing PID"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].handle === null) {
                html += '<td ' + alignTd + '><a class="btn btn-xs btn-danger" href="#" onclick="userModule.addHandle(' + data[i].id + '); return false;" title="Missing Handle"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].mods_id === null || data[i].mods === null) {
                html += '<td ' + alignTd + '><a href="#" onclick="objectsModule.addMods(' + data[i].id + '); return false;" title="Missing Mods"><i class="fa fa-exclamation"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].thumbnail === null) {
                html += '<td ' + alignTd + '><a class="btn btn-xs btn-danger" href="#" onclick="objectsModule.addThumbnail(' + data[i].id + '); return false;" title="Missing Thumbnail"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].file_name === null) {
                html += '<td ' + alignTd + '><a class="btn btn-xs btn-danger" href="#" onclick="objectsModule.addMaster(' + data[i].id + '); return false;" title="Missing Master Object"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            if (data[i].mime_type === null) {
                html += '<td ' + alignTd + '><a class="btn btn-xs btn-danger" href="#" onclick="objectsModule.addMimeType(' + data[i].id + '); return false;" title="Missing Mime Type"><i class="fa fa-exclamation-circle"></i></a></td>';
            } else {
                html += '<td ' + alignTd + '><i class="fa fa-check"></i></td>';
            }

            // TODO: format date
            html += '<td ' + alignTd + '>' + data[i].created + '</td>';
            html += '</tr>';
        }

        $('#incomplete-records').html(html);
        $('#message').empty();
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
            }, 6000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {
                var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to start transfer/import process.</div>';
                renderError(message);
            }

        });
    };

    /**
     * Gets directory listings from archivematica sftp server
     */
    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        var folder = helperModule.getParameterByName('collection'),
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
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve object data from Archivematica SFTP server.</div>';
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

        var socket = io();

        socket.on('transfer_status', function (data) {

            var transferData = '';

            $('#message').html('');

            if (data.length > 0) {

                for (let i=0;i<data.length;i++) {

                   transferData += '<tr>';
                   transferData += '<td>' + data[i].is_member_of_collection + '</td>';
                   transferData += '<td>' + data[i].object + '</td>';
                   transferData += '<td>' + data[i].transfer_uuid + '</td>';
                   transferData += '<td>' + data[i].microservice + '</td>';
                   transferData += '<td>' + data[i].user + '</td>';
                   transferData += '<td>' + data[i].message + '</td>';
                   transferData += '<td>' + data[i].created + '</td>';
                   transferData += '</tr>';

                }

                $('#transfer-status').html(transferData);

            } else {

                $('#transfer-status').html('<tr><td>No ingests in progress</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');

            }
        });

        socket.on('import_status', function (data) {

            let importData = '';

            $('#message').html('');

            if (data.length > 0) {

                for (let i=0;i<data.length;i++) {

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

        let url = api + '/api/admin/v1/import/incomplete';

        $.ajax(url)
            .done(function (data) {
                renderIncompleteRecords(data);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve object data from Archivematica SFTP server.</div>';
                    renderError(message);
                }

            });
    };

    obj.init = function () {
        userModule.renderUserName();
        importModule.getImportObjects();
    };

    return obj;

}());

importModule.init();