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
    request = require('request'),
    logger = require('../libs/log4');


/**
 *
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    let apiUrl = config.archivespaceHost;

    request.get({
        url: apiUrl,
        timeout: 5000
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

    // check if id is a collection uri
    let uri = id.split('/');

    if (uri.length > 1) {
        apiUrl = config.archivespaceHost + id;
    }

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
 * Gets record updates that have occurred in archivesspace
 */
exports.get_record_updates = function (session, callback) {

    'use strict';

    let apiUrl = config.archivespaceHost + '/update-feed';

    request.get({
        url: apiUrl,
        headers: {
            'X-ArchivesSpace-Session': session
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: request to archivesspace failed ' + error);

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                updates: body
            });

            return false;

        } else {

            logger.module().error('ERROR: unable to fetch record updates ' + error);

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

    let apiUrl = config.archivespaceHost + '/users/' + config.archivespaceUser + '/login?password=' + config.archivespacePassword + '&expiring=false';

    request.post({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: unable get archivesspace session token ' + error);

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

            logger.module().error('ERROR: unable get archivesspace session token ' + error);

            callback({
                error: true,
                error_message: body
            });
        }
    });
};