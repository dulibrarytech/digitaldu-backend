const http = (function () {

    'use strict';

    let obj = {};

    obj.req = function (request, callback) {
        fetch(request).then(callback).catch(function (error) {
            console.log(error);
        });
    };

    return obj;

}());