var configModule = (function () {

    'use strict';

    var obj = {};

    obj.getApi = function () {

        var api = 'http://localhost:8080';

        if (document.domain !== 'localhost') {
            api = location.protocol + '//' + document.domain;
        }

        return api;
    };

    return obj;

}());