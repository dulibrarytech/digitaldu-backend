var configModule = (function () {

    'use strict';

    var obj = {};

    /**
     * Resolves repo api url
     * @returns {string}
     */
    obj.getApi = function () {

        var api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = location.protocol + '//' + document.domain + ':' + location.port;
        }

        return api;
    };

    /**
     * Resolves repo thumbnails
     * @param pid
     * @returns {string}
     */
    obj.getTn = function (pid) {
        return 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + pid + '/datastreams/TN/content';
    };

    return obj;

}());