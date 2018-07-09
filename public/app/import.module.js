var importModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    // TODO: move to lib...
    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var api = configModule.getApi();


    obj.getObjectDetail = function () {

        var pid = getParameterByName('pid');

        $.ajax(api + '/api/admin/v1/object?pid=' + pid)
            .done(function(data) {
                // renderObjectDetail(data);
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