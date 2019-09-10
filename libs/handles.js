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

const config = require('../config/config'),
    logger = require('../libs/log4'),
    request = require('request'),
    HANDLE_HOST = config.handleHost,
    HANDLE_PREFIX = config.handlePrefix,
    HANDLE_USER = config.handleUsername,
    HANDLE_PASSWORD = config.handlePwd,
    HANDLE_TARGET = config.handleTarget,
    HANDLE_SERVER = config.handleServer;

/**
 * Creates handle
 * @param pid
 * @param callback
 */
exports.create_handle = function (pid, callback) {

    'use strict';

    if (pid === undefined) {

        logger.module().error('ERROR: Unable to create handle. (pid is undefined)');

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

    request(options, function (error, response, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create handle. ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 201) {

            logger.module().info('INFO: [/libs/handles lib (create_handle)] Handle for object: ' + pid + ' had been created.');

            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else if (response.statusCode === 409) {

            logger.module().error('ERROR: [/libs/handles lib (create_handle)] Handle already exists (conflict)');

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (create_handle)] Handle already exists (conflict)'
            });

        } else {

            logger.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create new handle ' + response.statusCode);

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

        logger.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. (pid is undefined)');

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

    request(options, function (error, response, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 204) {

            logger.module().info('INFO: [/libs/handles lib (update_handle)] Handle for object: ' + pid + ' had been updated.');

            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else {

            logger.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to update handle. ' + response.statusCode);

            callback({
                error: true,
                message: 'Error: [/libs/handles lib (update_handle)] Unable to update handle ' + response.statusCode
            });
        }
    });
};