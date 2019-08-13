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