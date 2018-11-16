const config = require('../config/config'),
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
            console.log(error);
            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 201) {

            console.log('Handle for object: ' + pid + ' had been created.');
            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else if (response.statusCode === 409) {

            console.log('Error: Handle already exists (conflict)');
            callback({
                error: true,
                message: 'Error: Handle already exists (conflict)'
            });

        } else {
            console.log('Error: Unable to create new handle');
            callback({
                error: true,
                message: 'Error: Unable to create new handle'
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

        callback({
            error: true,
            message: 'Unable to update handle. (pid is undefined)'
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
            console.log(error);
            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (response.statusCode === 204) {

            console.log('Handle for object: ' + pid + ' had been updated.');
            let handle = HANDLE_SERVER + HANDLE_PREFIX + '/' + pid;
            callback(handle);

        } else {
            console.log('Error: Unable to update handle');
            callback({
                error: true,
                message: 'Error: Unable to update handle'
            });
        }
    });
};