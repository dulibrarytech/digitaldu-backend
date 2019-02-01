var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function (message) {
        $('#message').html(message);
    };

    var api = configModule.getApi();

    /**
     * Renders the directory listing from the Archivematica sftp server
     * @param data
     */
    var renderImportObjects = function (data) {

        var collection = helperModule.getParameterByName('collection'),
            collectionObjects = [],
            html = '';

        // TODO: check for codu namespace in collection name
        // TODO: return error message if codu namespace not found in collection name
        for (var i = 0; i < data.list.length; i++) {

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
            var button = '<a class="btn btn-success btn-xs" onclick="importModule.queueTransferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
            $('.import-button').html(button);
        }

        $('#import-objects').html(html);
        $('#message').empty();
    };

    /**
     * Starts the Archivematica transfer/ingest process
     * @param objects
     * @returns {boolean}
     */
    obj.queueTransferObjects = function (objects) {

        var collection = helperModule.getParameterByName('collection');

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

            $('#message').html('<p>Import process starting...</p>');

            setTimeout(function () {
                $('#message').html('');
                window.location.replace('/dashboard/import/status?import=true');
            }, 5000);

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
                    var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve object data from Archivematica SFTP server.</div>';
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

        $('#transfer-status').html('<tr><td>No Transfers</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
        $('#ingest-status').html('<tr><td>No Ingests</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>');
        $('#import-status').html('<tr><td>No Imports</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tr>');

        var socket = io();

        socket.on('transfer_status', function (data) {

            console.log(data);

            var transferData = '';

            if (data.length > 0) {
                $('#message').html('');
            }

            for (var i=0;i<data.length;i++) {

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

        });

        socket.on('ingest_status', function (data) {

            var ingestData = '';

            for (var i=0;i<data.length;i++) {

                ingestData += '<tr>';
                ingestData += '<td>' + data[i].is_member_of_collection + '</td>';
                ingestData += '<td>' + data[i].sip_uuid + '</td>';
                ingestData += '<td>' + data[i].microservice + '</td>';
                ingestData += '<td>' + data[i].user + '</td>';
                ingestData += '<td>' + data[i].message + '</td>';
                ingestData += '<td>' + data[i].created + '</td>';
                ingestData += '</tr>';
            }

            $('#ingest-status').html(ingestData);

        });

        socket.on('import_status', function (data) {

            var importData = '';

            for (var i=0;i<data.length;i++) {

                importData += '<tr>';
                importData += '<td>' + data[i].is_member_of_collection + '</td>';
                importData += '<td>' + data[i].pid + '</td>';
                importData += '<td>' + data[i].handle + '</td>';
                importData += '<td>' + data[i].sip_uuid + '</td>';
                importData += '<td>' + data[i].file + '</td>';
                importData += '<td>' + data[i].message + '</td>';
                importData += '<td>' + data[i].created + '</td>';
                importData += '</tr>';
            }

            $('#import-status').html(importData);

        });
    };

    obj.init = function () {
        userModule.renderUserName();
        importModule.getImportObjects();
    };

    return obj;

}());

importModule.init();