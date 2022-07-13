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

const CONFIG = require('../config/webservices_config')(),
    HTTP = require('../libs/http'),
    LOGGER = require('../libs/log4');

exports.authenticate = function (username, password, callback) {

    (async () => {

        let data = {
            username: username,
            password: password
        };

        let response = await HTTP.post({
            url: CONFIG.ldap_service,
            data: data
        });

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/auth/service module (authenticate)] request to LDAP failed.');

            let errorObj = {
                status: 500,
                success: false,
                message: 'An error has occurred.'
            };

            callback(errorObj);
            return false;
        }

        callback(response.data);

    })();
};