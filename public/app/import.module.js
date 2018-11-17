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
            var button = '<a class="btn btn-success btn-xs" onclick="importModule.transferObjects(\'' + collectionObjects + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
            $('#import-button').html(button);
        }

        $('#import-objects').html(html);
        $('#message').empty();
    };

    /**
     * Starts the Archivematica transfer/ingest process
     * @param objects
     * @returns {boolean}
     */
    obj.transferObjects = function (objects) {

        var collection = helperModule.getParameterByName('collection');

        if (collection === null) {
            $('#message').html('<div class="alert alert-danger">Unable to start transfer. Collection PID not found.</div>');
            return false;
        }

        $.ajax({
            url: api + '/api/admin/v1/import/start_transfer',
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
            // TODO:
            renderError();
        });
    };

    /**
     * Gets directory listings from archivematica sftp server
     */
    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        var folder = helperModule.getParameterByName('collection'),
            url = api + '/api/admin/v1/import/list?collection=' + null;

        //
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

    obj.init = function () {
        userModule.renderUserName();
        importModule.getImportObjects();
    };

    return obj;

}());

importModule.init();