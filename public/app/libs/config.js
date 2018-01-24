var configModule = (function () {

    'use strict';

    var obj = {};

    obj.getApi = function () {

        var api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = 'http://' + document.domain;
        }

        return api;
    };

    return obj;

}());