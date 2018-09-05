var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    var api = configModule.getApi();

    var renderImportObjects = function (data) {

        var html = '';

        for (var i = 0; i < data.list.length; i++) {

            if (data.list[i].name.charAt(0) !== '.') {

                html += '<tr>';

                // render folder or file
                if (data.list[i].type === 'd') {
                    html += '<td><a href="/dashboard/import?folder=' + data.list[i].name + '">' + data.list[i].name + '</a></td>';
                } else if (data.list[i].type === '-') {
                    html += '<td>' + data.list[i].name + '</td>';
                }

                if (data.list[i].type === 'd') {
                    html += '<td>Folder</td>';

                } else if (data.list[i].type === '-') {
                    html += '<td>File</td>';

                }

                html += '<td>';
                html += '<form name="' + data.list[i].name + '" action="/dashboard/import/batch" method="get">';
                html += '<input name="collection" type="hidden" value="' + data.list[i].name + '">';

                if (data.list[i].type === 'd') {
                    html += '<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-upload"></i>&nbsp;Import</button>&nbsp;';
                }

                html += '<div class="col-xs-4">';
                html += '</div>';
                html += '</form>';
                html += '</td>';
                html += '</tr>';
            }
        }

        $('#import-objects').html(html);
        $('#message').empty();
    };

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

    var checkQueue = function (data) {
        var import_id = data.import_id;
        var timer = setInterval(function () {
            console.log('checking...');
            console.log(import_id);

            // TODO: call function to update DOM

        }, 5000);
    };

    // TODO:...
    obj.importObjects = function () {

        var collection = helperModule.getParameterByName('collection'),
            mimeType = helperModule.getParameterByName('mime_type');

        if (collection === undefined || mimeType === undefined) {
            // TODO: inject error message into DOM
            alert('NOPE!');
            return false;
        }

        $.ajax({
            url: api + '/api/admin/v1/import',
            type: 'post',
            data: {collection: collection, mime_type: mimeType}
        }).done(function (data) {
            console.log(data);

            // TODO: socket.io queue (long-term)
            // TODO: poll queue (short-term)

            checkQueue(data);
        }).fail(function () {
            renderError();
        });
    };

    obj.getImportObjects = function () {

        $('#message').html('<p><strong>Loading...</strong></p>');

        var folder = helperModule.getParameterByName('folder'),
            url = api + '/api/admin/v1/import/list?folder=' + null,
            foldersArr = [];

        if (folder !== null) {

            var folders = window.sessionStorage.getItem('folders');

            if (folders !== null) {

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

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());