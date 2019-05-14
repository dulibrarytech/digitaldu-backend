const config = require('../config/config'),
    request = require('request'),
    logger = require('../libs/log4');


/**
 *
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    // TODO:...
    let apiUrl = config.archivespaceHost;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: request to archivespace failed ' + error);

            callback({
                error: true,
                status: 'down',
                message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                status: 'up',
                message: 'Archivespace service is available'
            });

            return false;

        } else {

            logger.module().error('ERROR: request to archivespace failed ' + error);

            callback({
                error: true,
                status: 'down',
                message: error
            });

            return false;
        }
    });

};


/**
 * Gets JSON representation of mods record from archivespace
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
 * Gets session token from archivespace
 * @param callback
 */
exports.get_session_token = function (callback) {

    'use strict';

    let apiUrl = config.archivespaceHost + '/users/' + config.archivespaceUser + '/login?password=' + config.archivespacePassword + '&expiring=true';

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