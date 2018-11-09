var configModule = (function () {

    'use strict';

    var obj = {};

    obj.getApi = function () {

        var api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = location.protocol + '//' + document.domain + ':' + location.port;
        }

        return api;
    };

    return obj;

}());