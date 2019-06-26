const objectsModule = (function () {

    'use strict';

    let obj = {};

    let renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    let api = configModule.getApi();

    // TODO: DEPRECATE
    obj.editObject = function () {

        let pid = helperModule.getParameterByName('pid');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/object?pid=' + pid)
            .done(function (data) {
                renderObjectEditForm(data);
            })
            .fail(function () {
                renderError();
            });
    };

    /**
     *
     */
    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize

        collectionsModule.getCollectionName(pid);
        userModule.setHeaderUserToken();

        if (pid === null) {
            pid = 'codu:root';
        }

        $.ajax(api + '/api/admin/v1/repo/objects?pid=' + pid)
            .done(function (data) {
                helperModule.renderDisplayRecords(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.downloadObject = function () {
        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize
        window.location.replace(api + '/api/v1/object/download?pid=' + pid);
        return false;
    };

    obj.init = function () {
        objectsModule.getObjects();
        helperModule.ping();
    };

    return obj;

}());