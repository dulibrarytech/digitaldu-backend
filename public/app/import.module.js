var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    var api = configModule.getApi();

    /*
        Renders the directory listing from the archivematica sftp server
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
                    // html += '<a class="btn btn-success btn-xs" onclick="importModule.transferObjects(\'' + data.list[i].name + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
                    // html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';

                    if (collection !== null) {
                        html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name;
                    } else {
                        html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?collection=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';
                    }

                    html += '</td>';
                }

                /*
                else if (collection !== null && data.list[i].type === '-') {
                    html += '<td>';
                    html += '<a type="button" class="btn btn-default btn-xs" disabled><i class="fa fa-ban"></i>&nbsp;&nbsp;Import</a>';
                    html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-file"></i>&nbsp;&nbsp;' + data.list[i].name;
                    html += '</td>'
                }
                */

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

    /* TODO: rename function name to "importObjects"
        Begins the Archivematica transfer/ingest process
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
            data: {collection: collection, objects: objects}
        }).done(function (data) {

            // TODO: check payload
            console.log(data);

            $('#message').html('<div class="alert alert-success">Import process starting...</div>');

            setTimeout(function () {
                $('#message').html('');
                window.location.replace('/dashboard/import/status');
            }, 1000);

        }).fail(function () {
            renderError();
        });
    };

    /* gets directory listings from archivematica sftp server */
    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        var folder = helperModule.getParameterByName('collection'),
            url = api + '/api/admin/v1/import/list?collection=' + null,
            foldersArr = [];

        // TODO: render collection folder contents differently
        if (folder !== null) {

            $('#back').html('<p><a href="/dashboard/import" class="btn btn-default" id="back"><i class="fa fa-arrow-left"></i> Back</a></p>');

            var folders = window.sessionStorage.getItem('folders');

            if (folders !== null) {

                $('#back').html('<p><a href="#" class="btn btn-default"><i class="fa fa-arrow-left"></i> Back</a></p>');

                foldersArr = JSON.parse(folders);

                var result = foldersArr.find(function (value) {

                    if (value === folder) {
                        return true;
                    } else {
                        return false;
                    }
                });

                // construct new path
                if (result === undefined) {

                    foldersArr.push(folder);
                    window.sessionStorage.setItem('folders', JSON.stringify(foldersArr));

                    if (foldersArr.length > 1) {
                        url = api + '/api/admin/v1/import/list?collection=' + foldersArr.toString();
                    }

                }

            } else {

                window.sessionStorage.removeItem('folders');
                foldersArr.push(folder);
                url = api + '/api/admin/v1/import/list?collection=' + folder;
                window.sessionStorage.setItem('folders', JSON.stringify(foldersArr));
            }

        } else {
            window.sessionStorage.removeItem('folders');
        }

        $.ajax(url)
            .done(function (data) {
                renderImportObjects(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    /*
    obj.getImportObjectFiles = function () {

        // TODO: sanitize
        var object = helperModule.getParameterByName('object');

        $.ajax(api + '/api/admin/v1/import/files?object=' + object)
            .done(function (data) {
                // console.log(data);
                renderImportObjectFiles(data);
            })
            .fail(function () {
                renderError();
            });
    };
    */

    /*
     var renderImportObjectFiles = function (data) {

     var html = '';

     for (var i = 0; i < data.length; i++) {

     html += '<tr>';

     if (data[i].xmlFile !== undefined) {
     html += '<td>' + data[i].xmlFile + '</td>';
     }

     if (data[i].objectFile !== undefined) {
     html += '<td>' + data[i].objectFile + '</td>';
     }

     html += '<td>' + data[i].fileSize + '</td>';
     html += '<td>' + data[i].mimeType + '</td>';
     html += '</tr>';
     }

     $('#import-object-files').html(html);
     $('.loading').html('');
     };
     */

    /*
     var checkQueue = function (data) {
     var import_id = data.import_id;
     var timer = setInterval(function () {
     console.log('checking...');
     console.log(import_id);

     // TODO: call function to update DOM

     }, 5000);
     };
     */

    /*
     var renderUnapprovedTransfers = function (data) {

     console.log(data);

     var html = '';

     for (var i = 0; i < data.length; i++) {

     html += '<tr>';

     if (data[i].xmlFile !== undefined) {
     html += '<td>' + data[i].xmlFile + '</td>';
     }

     if (data[i].objectFile !== undefined) {
     html += '<td>' + data[i].objectFile + '</td>';
     }

     html += '<td>' + data[i].fileSize + '</td>';
     html += '<td>' + data[i].mimeType + '</td>';
     html += '</tr>';
     }

     $('#import-object-files').html(html);
     $('.loading').html('');
     };
     */

    /*
     obj.getUnapprovedTransfers = function () {

     $.ajax(api + '/api/admin/v1/import/unapproved_transfers')
     .done(function (data) {
     renderUnapprovedTransfers(data);
     })
     .fail(function () {
     renderError();
     });
     };
     */

    return obj;

}());