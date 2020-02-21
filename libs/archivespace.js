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
    REQUEST = require('request'),
    LOGGER = require('../libs/log4');

/**
 * Pings Archivesspace to check availability
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost;

    REQUEST.get({
        url: apiUrl,
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed ' + error);

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

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed ' + error);

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
 * @param session
 * @param callback
 */
exports.get_mods = function (id, session, callback) {

    'use strict';

    // TODO: refactor to make use of full uri by default for both resources and archival_objects
    let apiUrl = CONFIG.archivespaceHost + '/repositories/' + CONFIG.archivespaceRepositoryid + '/archival_objects/' + id + '/repository';

    // check if id is a collection uri
    let uri = id.split('/');

    if (uri.length > 1) {
        apiUrl = CONFIG.archivespaceHost + id;
    }

    REQUEST.get({
        url: apiUrl,
        headers: {
            'X-ArchivesSpace-Session': session
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed ' + error);

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

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed ' + httpResponse.statusCode + '/' + error);

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
 * @param session
 * @param callback
 */
exports.get_record_updates = function (session, callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost + '/update-feed';

    REQUEST.get({
        url: apiUrl,
        headers: {
            'X-ArchivesSpace-Session': session
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_record_updates)] request to archivesspace failed ' + error);

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

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_record_updates)] unable to fetch record updates ' + error);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};

/**
 * Gets session token from archivesspace
 * @param callback
 */
exports.get_session_token = function (callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost + '/users/' + CONFIG.archivespaceUser + '/login?password=' + CONFIG.archivespacePassword + '&expiring=false';

    REQUEST.post({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_session_token)] unable get archivesspace session token ' + error);

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

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_session_token)] unable get archivesspace session token ' + httpResponse.statusCode + '/' + error);

            callback({
                error: true,
                error_message: body
            });
        }
    });
};

/**
 * Terminates current session
 * @param callback
 */
exports.destroy_session_token = function (session, callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost + '/logout';

    REQUEST.post({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json',
            'X-ArchivesSpace-Session': session
        },
        timeout: 45000
    }, function(error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_session_token)] unable get archivesspace session token ' + error);

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

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_session_token)] unable get archivesspace session token ' + httpResponse.statusCode + '/' + error);

            callback({
                error: true,
                error_message: body
            });
        }
    });
};