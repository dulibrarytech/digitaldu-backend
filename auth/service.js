/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const CONFIG = require('../config/config'),
    REQUEST = require('request'),
    VALIDATOR = require('validator'),
    LOGGER = require('../libs/log4');

exports.authenticate = function (username, password, callback) {

    if (VALIDATOR .isNumeric(username) === false || VALIDATOR.isEmpty(password) === true) {

        let errorObj = {
            status: 400,
            success: false,
            message: 'Bad request.'
        };

        callback(errorObj);
        return false;
    }

    REQUEST.post({
            url: CONFIG.ldap, form: {
                username: username,
                password: password
            }
        },
        function (error, headers, response) {

            if (error) {

                LOGGER.module().error('ERROR: [/auth/service module (authenticate)] request to LDAP failed ' + error);

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