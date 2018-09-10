var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    var api = configModule.getApi();

    /*

     */
    var renderImportObjects = function (data) {

        var html = '';

        for (var i = 0; i < data.list.length; i++) {

            if (data.list[i].name.charAt(0) !== '.') {

                html += '<tr>';

                // render folder or file
                if (data.list[i].type === 'd') {
                    html += '<td>'; // /dashboard/import/status?folder=' + data.list[i].name + '
                    html += '<a class="btn btn-success btn-xs" onclick="importModule.transferObjects(\'' + data.list[i].name + '\')" href="#"><i class="fa fa-upload"></i>&nbsp;&nbsp;Import</a>';
                    html += '&nbsp;&nbsp;&nbsp;<a href="/dashboard/import?folder=' + data.list[i].name + '"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + data.list[i].name + '</a>';
                    html += '</td>';
                } else if (data.list[i].type === '-') {
                    html += '<td>';
                    html += '<a type="button" class="btn btn-default btn-xs" disabled><i class="fa fa-ban"></i>&nbsp;&nbsp;Import</a>';
                    html += '&nbsp;&nbsp;&nbsp;<i class="fa fa-file"></i>&nbsp;&nbsp;' + data.list[i].name;
                    html += '</td>'
                }

                html += '</tr>';
            }
        }

        $('#import-objects').html(html);
        $('#message').empty();
    };

    /*  */
    obj.transferObjects = function (folder) {

        $('#message').html('<div class="alert alert-success">Transfer started...</div>');
        $('#import-table').hide();

        $.ajax({
            url: api + '/api/admin/v1/import/start_transfer',
            type: 'post',
            data: {folder: folder}
        }).done(function (data) {

            var json = JSON.parse(data);
            console.log(json);
            console.log(json.uuid);

            if (json.error !== undefined && json.error === true) {
                $('#message').html('<div class="alert alert-danger">' + json.message + '</div>');
                return false;
            }

            // transfer approval message
            $('#message').html('<div class="alert alert-success">' + json.message + '...</div>');

            // check transfer status
            importModule.getTransferStatus(json.uuid);

        }).fail(function () {
            renderError();
        });
    };

    obj.getTransferStatus = function (uuid) {

        var transferTimer = setInterval(function () {

            $.ajax({
                url: api + '/api/admin/v1/import/transfer_status?uuid=' + uuid,
                type: 'get'
            }).done(function (data) {

                var json = JSON.parse(data);
                // console.log(json);

                if (json.error !== undefined && json.error === true) {
                    $('#message').html('<div class="alert alert-danger">' + json.message + '</div>');
                    $('#import-table').show();
                    return false;
                }

                if (json.status === 'PROCESSING') {
                    $('#message').html('<div class="alert alert-success">Processing Transfer...  --' + json.microservice + '</div>');
                    return false;
                }

                if (json.status === 'COMPLETE') {
                    clearInterval(transferTimer);
                    $('#message').html('<div class="alert alert-success">Transfer Complete.</div>');
                    console.log(json);
                    // check ingest status
                    importModule.getIngestStatus(json.sip_uuid);
                    return false;
                }

                if (json.status === 'FAILED') {
                    clearInterval(transferTimer);
                    $('#message').html('<div class="alert alert-success">Transfer Failed.</div>');
                    $('#import-table').show();
                    return false;
                }

                if (json.status === 'REJECTED') {
                    clearInterval(transferTimer);
                    $('#message').html('<div class="alert alert-success">Transfer Rejected.</div>');
                    $('#import-table').show();
                    return false;
                }

            }).fail(function () {
                renderError();
            });

        }, 1000);
    };

    obj.getIngestStatus = function (uuid) {

        var ingestTimer = setInterval(function () {

            $.ajax({
                url: api + '/api/admin/v1/import/ingest_status?uuid=' + uuid,
                type: 'get'
            }).done(function (data) {

                var json = JSON.parse(data);

                if (json.error !== undefined && json.error === true) {
                    $('#message').html('<div class="alert alert-danger">' + json.message + '</div>');
                    $('#import-table').show();
                    return false;
                }

                if (json.status === 'PROCESSING') {
                    $('#message').html('<div class="alert alert-success">Ingesting...  --' + json.microservice + '</div>');
                    return false;
                }

                if (json.status === 'COMPLETE') {
                    clearInterval(ingestTimer);
                    $('#message').html('<div class="alert alert-success">Ingest Complete.</div>');

                    console.log(json);

                    setTimeout(function () {
                        $('#message').html('');
                        $('#import-table').show();
                    }, 4000);

                    // TODO: trigger removal of folder from sftp server

                    return false;
                }

                if (json.status === 'FAILED') {
                    clearInterval(ingestTimer);
                    $('#message').html('<div class="alert alert-success">Ingest Failed.</div>');
                    $('#import-table').show();
                    return false;
                }

                if (json.status === 'REJECTED') {
                    clearInterval(ingestTimer);
                    $('#message').html('<div class="alert alert-success">Ingest Rejected.</div>');
                    $('#import-table').show();
                    return false;
                }

            }).fail(function () {
                renderError();
            });

        }, 1000);
    };

    var back = function () {

        $('#back').click(function () {

            var foldersArr = JSON.parse(window.sessionStorage.getItem('folders'));

            if (foldersArr !== null) {

                foldersArr.pop();
                // console.log(foldersArr);
                // console.log(foldersArr[foldersArr.length-1]);
                History.pushState({folder: ''}, '', '?folder=' + foldersArr[foldersArr.length-1]);

                // foldersArr.pop();

                // $('#back > a').prop('href', '/dashboard/import?folder=' + foldersArr[foldersArr.length-1]);

                if (foldersArr.length === 0) {
                    window.sessionStorage.removeItem('folders');
                } else {
                    // TODO: save back to sessionStorage
                    window.sessionStorage.setItem('folders', JSON.stringify(foldersArr));
                }

                importModule.getImportObjects();

            }

        });
    };

    /* gets folder / file listings from archivematica sftp server */
    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        var folder = helperModule.getParameterByName('folder'),
            url = api + '/api/admin/v1/import/list?folder=' + null,
            foldersArr = [];

        if (folder !== null) {

            // TODO: implement back buttons
            $('#back').html('<p><a href="#" class="btn btn-default" id="back"><i class="fa fa-arrow-left"></i> Back</a></p>');
            back();

            var folders = window.sessionStorage.getItem('folders');

            if (folders !== null) {

                $('#back').html('<p><a href="#" class="btn btn-default"><i class="fa fa-arrow-left"></i> Back</a></p>');
                back();

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
                        url = api + '/api/admin/v1/import/list?folder=' + foldersArr.toString();
                    }

                }

            } else {

                window.sessionStorage.removeItem('folders');
                foldersArr.push(folder);
                url = api + '/api/admin/v1/import/list?folder=' + folder;
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