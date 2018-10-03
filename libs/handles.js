var config = require('../config/config'),
    request = require('request');

exports.get_handle = function (callback) {

    'use strict';

    // TODO:...
    request.post({
        url: '' //config.apiUrl + '/api/admin/v1/repo/pid'
    }, function(error, httpResponse, body){

        if (error) {
            // TODO: log error and return callback
            console.log(error);
        }

        if (httpResponse.statusCode === 200) {

            var json = JSON.parse(body);
            callback(json.pid);

        } else {
            // TODO: log error and return callback
        }
    });
};