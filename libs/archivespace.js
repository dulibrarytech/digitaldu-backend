const config = require('../config/config'),
    request = require('request'),
    logger = require('../libs/log4');

/**
 *
 * @param id
 * @param callback
 */
exports.get_mods = function (id, session, callback) {

    'use strict';

    let apiUrl = config.archivespaceHost + '/repositories/' + config.archivespaceRepositoryid + '/archival_objects/' + id + '/repository';

    request.get({
        url: apiUrl,
        headers: {
            'X-ArchivesSpace-Session': session
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: request to archivespace failed ' + error);

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

            logger.module().error('ERROR: request to archivespace failed ' + error);

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

    let apiUrl = config.archivespaceHost + '/users/' + config.archivespaceUser + '/login?password=' + config.archivespacePassword + '&expiring=false';

    request.post({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: unable get archivespace session token ' + error);

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                data: body
            });

        } else {

            logger.module().error('ERROR: unable get archivespace session token ' + error);

            callback({
                error: true,
                error_message: body
            });
        }
    });
};