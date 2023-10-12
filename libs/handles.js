/**

 Copyright 2023 University of Denver

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

const CONFIG = require('../config/config');
const LOGGER = require('../libs/log4');
const HTTP = require('axios');
const HANDLE_SERVICE = CONFIG.handleService;
const HANDLE_SERVER = CONFIG.handleServer;
const HANDLE_PREFIX = CONFIG.handlePrefix;
const HANDLE_API_KEY = CONFIG.handleApiKey;
const TIMEOUT = 45000;

/**
 * Creates handle
 * @param uuid
 * @param callback
 */
exports.create_handle = function (uuid, callback) {

    'use strict';

    if (uuid === undefined) {

        LOGGER.module().error('ERROR: Unable to create handle. (uuid is undefined)');

        callback({
            error: true,
            message: 'Unable to create handle. (uuid is undefined)'
        });

        return false;
    }

    (async () => {

        try {

            let handle_url = `${HANDLE_SERVICE}?uuid=${uuid}&api_key=${HANDLE_API_KEY}`;
            let response = await HTTP.post(handle_url, '', {
                timeout: TIMEOUT
            });

            if (response.status === 201) {

                LOGGER.module().info('INFO: [/libs/handles lib (create_handle)] Handle for object: ' + uuid + ' had been created.');

                let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + uuid;
                callback(handle);

            } else {

                LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create new handle ' + response.status);

                callback({
                    error: true,
                    message: 'Error: [/libs/handles lib (create_handle)] Unable to create new handle ' + response.status
                });
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create new handle ' + error);

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (create_handle)] Unable to create new handle ' + error
            });
        }

    })();
};

/**
 * Updates handle
 * @param uuid
 * @param callback
 */
exports.update_handle = function (uuid, callback) {

    'use strict';

    if (uuid === undefined) {

        LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. (uuid is undefined)');

        callback({
            error: true,
            message: 'ERROR: [/libs/handles lib (update_handle)] Unable to update handle. (uuid is undefined)'
        });

        return false;
    }

    (async () => {

        try {

            let handle_url = `${HANDLE_SERVICE}?uuid=${uuid}&api_key=${HANDLE_API_KEY}`;
            let response = await HTTP.put(handle_url, '', {
                timeout: TIMEOUT
            });

            if (response.status === 201) {

                LOGGER.module().info('INFO: [/libs/handles lib (update_handle)] Handle for object: ' + uuid + ' had been updated.');

                let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + uuid;
                callback(handle);

            } else {

                LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to update handle.');

                callback({
                    error: true,
                    message: 'Error: [/libs/handles lib (update_handle)] Unable to update handle.'
                });
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. ' + error);

            callback({
                error: true,
                message: error
            });
        }

    })();
};
