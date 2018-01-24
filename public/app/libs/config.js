var configModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        // $('#communities').html('Error: Unable to retrieve communities');
    };

    obj.getApi = function () {

        var api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = 'http://' + document.domain;
        }

        return api;
    };

    return obj;

}());