'use strict';

var request = require('request'),
    config = require('../config/config');

exports.authenticate = function (username, password, callback) {

    request.post({
            url: config.ldap, form: {
                username: username,
                password: password
            }
        },
        function (error, headers, response) {

            if (error) {
                var errorObj = {
                    status: 500,
                    success: false,
                    message: 'An error has occurred.'
                };

                callback(errorObj);
            }

            var responseObj = JSON.parse(response);
            callback(responseObj);
        });
};