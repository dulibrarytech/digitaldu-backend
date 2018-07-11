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
            html += '<a href="#" class="btn btn-success btn-sm"><i class="fa fa-upload"></i>&nbsp;Import</a>&nbsp;';

            if (data[i].files !== 0) {
                html += '<a href="/dashboard/import/files?object=' + data[i].object + '" class="btn btn-primary btn-sm"><i class="fa fa-file"></i>&nbsp;View Files</a>&nbsp;';
            }

            // html += '<a href="#" class="btn btn-danger btn-sm"><i class="fa fa-times"></i>&nbsp;Delete</a>';
            html += '</td>';
            html += '</tr>';
        }

        $('#import-objects').html(html);
    };

    var renderImportObjectFiles = function (data) {

        console.log(data);

        var html = '';

        /*
        for (var i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td>' + data[i].object + '</td>';
            html += '<td>' + data[i].files + '</td>';
            html += '<td>';
            html += '<a href="#" class="btn btn-success btn-sm"><i class="fa fa-upload"></i>&nbsp;Import</a>&nbsp;';

            if (data[i].files !== 0) {
                html += '<a href="/dashboard/import/files?object=' + data[i].object + '" class="btn btn-primary btn-sm"><i class="fa fa-file"></i>&nbsp;View Files</a>&nbsp;';
            }

            // html += '<a href="#" class="btn btn-danger btn-sm"><i class="fa fa-times"></i>&nbsp;Delete</a>';
            html += '</td>';
            html += '</tr>';
        }
        */

        $('#import-object-files').html(html);
    };

    obj.getImportObjects = function () {

        $.ajax(api + '/api/admin/v1/import')
            .done(function(data) {
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