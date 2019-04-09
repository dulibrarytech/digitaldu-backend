const http = (function () {

    'use strict';

    let obj = {};

    obj.req = function (request, callback) {
        fetch(request).then(callback).catch(function (error) {
            let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (Request/Response error has occurred. ' + error + '</div>';
            $('#message').html(message);
        });
    };

    return obj;

}());