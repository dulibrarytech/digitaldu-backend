var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    var api = configModule.getApi();

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var renderImportObjects = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td>' + data[i].object + '</td>';
            html += '<td>' + data[i].files + '</td>';
            html += '<td>';
            html += '<form name="' + data[i].object + '" action="/dashboard/import/batch" method="get">';
            html += '<input name="collection" type="hidden" value="' + data[i].object + '">';

            if (data[i].files !== 0) {
                html += '<a href="/dashboard/import/files?object=' + data[i].object + '" class="btn btn-primary btn-sm"><i class="fa fa-file"></i>&nbsp;View Files</a>&nbsp;';
            } else {
                html += '<button class="btn btn-primary btn-sm" disabled><i class="fa fa-file"></i>&nbsp;View Files</button>&nbsp;';
            }

            // TODO: check if collection is currently in import queue.  If it is, disable import button
            if (data[i].files !== 0) {
                html += '<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-upload"></i>&nbsp;Import</button>&nbsp;';
            } else {
                html += '<button class="btn btn-success btn-sm" disabled><i class="fa fa-upload"></i>&nbsp;Import</button>&nbsp;';
            }

            html += '<div class="col-xs-4">';

            if (data[i].files !== 0) {
                html += '<select name="mime_type" class="form-control" id="mime-type">';
            } else {
                html += '<select name="mime_type" class="form-control" id="mime-type" disabled>';
            }

            html += '<option value="">select mime-type</option>';
            html += '<option value="application/pdf">application/pdf</option>';
            html += '<option value="image/tiff">image/tiff</option>';
            html += '<option value="image/png">image/png</option>';
            html += '<option value="image/jpeg">image/jpeg</option>';
            html += '<option value="video/mp4">video/mp4</option>';
            html += '</select>';

            html += '</div>';
            html += '</form>';
            html += '</td>';
            html += '</tr>';
        }

        $('#import-objects').html(html);
    };

    var renderImportObjectFiles = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

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

        var collection = getParameterByName('collection'),
            mimeType = getParameterByName('mime_type');

        if (collection === undefined || mimeType === undefined) {
            // TODO: inject error message into DOM
            alert('NOPE!');
            return false;
        }

        $.ajax({
            url: api + '/api/admin/v1/import',
            type: 'post',
            data: {collection: collection, mime_type: mimeType}
        }).done(function(data) {
            console.log(data);

            // TODO: socket.io queue (long-term)
            // TODO: poll queue (short-term)

            checkQueue(data);
        }).fail(function() {
                renderError();
        });
    };

    obj.getImportObjects = function () {

        $.ajax(api + '/api/admin/v1/import')
            .done(function(data) {
                console.log(data);
                renderImportObjects(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getImportObjectFiles = function () {

        // TODO: sanitize
        var object = getParameterByName('object');

        $.ajax(api + '/api/admin/v1/import/files?object=' + object)
            .done(function(data) {
                // console.log(data);
                renderImportObjectFiles(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());