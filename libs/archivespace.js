const config = require('../config/config'),
    request = require('request');

/**
 *
 * @param id
 * @param callback
 */
exports.get_mods = function (id, session, callback) {

    'use strict';

    var apiUrl = config.archivespaceHost + '/repositories/' + config.archivespaceRepositoryid + '/archival_objects/' + id + '/repository';

    request.get({
        url: apiUrl,
        headers: {
            'X-ArchivesSpace-Session': session
        },
        timeout: 60000
    }, function(error, httpResponse, body) {

        if (error) {

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                mods: body
            });

            return false;

        } else {

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};

/**
 *
 * @param callback
 */
exports.get_session_token = function (callback) {

    'use strict';

    var apiUrl = config.archivespaceHost + '/users/' + config.archivespaceUser + '/login?password=' + config.archivespacePassword + '&expiring=false';

    request.post({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60000
    }, function(error, httpResponse, body) {

        if (error) {

            // TODO: log

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            // TODO: check payload for api error code

            callback({
                error: false,
                data: body
            });

        } else {

            callback({
                error: true,
                error_message: body
            });
        }
    });
};