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

const CONFIG = require('../config/config'),
    LOGGER = require('../libs/log4'),
    REQUEST = require('request'),
    HANDLE_HOST = CONFIG.handleHost,
    HANDLE_PREFIX = CONFIG.handlePrefix,
    HANDLE_USER = CONFIG.handleUsername,
    HANDLE_PASSWORD = CONFIG.handlePwd,
    HANDLE_TARGET = CONFIG.handleTarget,
    HANDLE_SERVER = CONFIG.handleServer;

/**
 * Creates handle
 * @param pid
 * @param callback
 */
exports.create_handle = function (pid, callback) {

    'use strict';

    if (pid === undefined) {

        LOGGER.module().error('ERROR: Unable to create handle. (pid is undefined)');

        callback({
            error: true,
            message: 'Unable to create handle. (pid is undefined)'
        });

        return false;
    }

    let handleUrl = HANDLE_HOST + '/' + HANDLE_PREFIX + '/' + encodeURIComponent(pid) + '?target=' + HANDLE_TARGET + encodeURIComponent(pid),
        auth = new Buffer(HANDLE_USER + ':' + HANDLE_PASSWORD).toString('base64'),
        options = {
        url: handleUrl,
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + auth
        }
    };

    REQUEST(options, function (error, response, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create handle. ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 201) {

            LOGGER.module().info('INFO: [/libs/handles lib (create_handle)] Handle for object: ' + pid + ' had been created.');

            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else if (response.statusCode === 409) {

            LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Handle already exists (conflict)');

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (create_handle)] Handle already exists (conflict)'
            });

        } else {

            LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create new handle ' + response.statusCode);

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (create_handle)] Unable to create new handle ' + response.statusCode
            });
        }
    });
};

/**
 * Updates handle
 * @param pid
 * @param callback
 */
exports.update_handle = function (pid, callback) {

    'use strict';

    if (pid === undefined) {

        LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. (pid is undefined)');

        callback({
            error: true,
            message: 'ERROR: [/libs/handles lib (update_handle)] Unable to update handle. (pid is undefined)'
        });

        return false;
    }

    let handleUrl = HANDLE_HOST + '/' + HANDLE_PREFIX + '/' + encodeURIComponent(pid) + '?target=' + HANDLE_TARGET + encodeURIComponent(pid),
        auth = new Buffer(HANDLE_USER + ':' + HANDLE_PASSWORD).toString('base64'),
        options = {
        url: handleUrl,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + auth
        }
    };

    REQUEST(options, function (error, response, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 204) {

            LOGGER.module().info('INFO: [/libs/handles lib (update_handle)] Handle for object: ' + pid + ' had been updated.');

            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else {

            LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to update handle. ' + response.statusCode);

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (update_handle)] Unable to update handle ' + response.statusCode
            });
        }
    });
};