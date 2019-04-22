'use strict';

const request = require('request'),
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
                let errorObj = {
                    status: 500,
                    success: false,
                    message: 'An error has occurred.'
                };

                callback(errorObj);
            }

            let responseObj = JSON.parse(response);
            callback(responseObj);
        });
};