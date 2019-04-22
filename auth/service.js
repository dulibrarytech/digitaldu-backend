'use strict';

const config = require('../config/config'),
    request = require('request'),
    logger = require('../libs/log4');

exports.authenticate = function (username, password, callback) {

    request.post({
            url: config.ldap, form: {
                username: username,
                password: password
            }
        },
        function (error, headers, response) {

            if (error) {

                logger.module().error('ERROR: request to LDAP failed ' + error);

                let errorObj = {
                    status: 500,
                    success: false,
                    message: 'An error has occurred.'
                };

                callback(errorObj);
                return false;
            }

            let responseObj = JSON.parse(response);
            callback(responseObj);
        });
};