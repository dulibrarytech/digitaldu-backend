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
    HTTP = require('axios'),
    TIMEOUT = 60000*3,
    LOGGER = require('../libs/log4');

/**
 * Pings Archivesspace to check availability
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost;

    (async() => {

        try {

            let response = await HTTP.get(apiUrl, {
                timeout: 25000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.error === true) {

                LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed');

                callback({
                    error: true,
                    status: 'down',
                    message: response
                });

                return false;

            } else if (response.status === 200) {

                callback({
                    error: false,
                    status: 'up',
                    message: 'Archivespace service is available'
                });
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed');

            callback({
                error: true,
                status: 'down',
                message: error
            });

        }

        return false;

    })();
};

/**
 * Gets JSON representation of mods record from archivesspace
 * @param id
 * @param session
 * @param callback
 */
exports.get_mods = function (id, session, callback) {

    'use strict';

    if (id === undefined || session === undefined) {

        callback({
            error: true,
            error_message: 'ERROR: [/libs/archivesspace lib (get_mods)] id and session params missing'
        });

        return false;
    }

    // TODO: refactor to make use of full uri by default for both resources and archival_objects
    let apiUrl = CONFIG.archivespaceHost + '/repositories/' + CONFIG.archivespaceRepositoryid + '/archival_objects/' + id + '/repository';
    console.log(apiUrl);
    // check if id is a collection uri
    let uri = id.split('/');

    if (uri.length > 1) {
        apiUrl = CONFIG.archivespaceHost + id;
    }

    (async() => {

        try {

            let response = await HTTP.get(apiUrl, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'X-ArchivesSpace-Session': session
                }
            });

            if (response.status === 404) {

                LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed (http status - ' + response.status + ')');

                callback({
                    error: true,
                    error_message: 'ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed (http status - ' + response.status + ')'
                });

                return false;

            } else if (response.status === 200) {

                callback({
                    error: false,
                    mods: response
                });

                return false;

            } else {

                callback({
                    error: true,
                    mods: response
                });

                return false;
            }

        } catch (error) {

            if (error === null) {

                callback({
                    error: true,
                    error_message: 'ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed - error object is null ' + error
                });

                return false;
            }

            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_mods)] request to archivesspace failed - ' + error);
            return false;
        }

    })();
};

/**
 * Gets session token from archivesspace
 * @param callback
 */
exports.get_session_token = function (callback) {

    'use strict';

    let apiUrl = CONFIG.archivespaceHost + '/users/' + CONFIG.archivespaceUser + '/login?password=' + CONFIG.archivespacePassword + '&expiring=false';

    (async() => {

        try {

            let response = await HTTP.post(apiUrl, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.error === true) {

                LOGGER.module().error('ERROR: [/libs/archivesspace (get_session_tokens)] Unable to get session token');

                callback({
                    error: true,
                    error_message: 'Unable to get session token'
                });

                return false;

            } else if (response.status === 200) {

                callback({
                    error: false,
                    data: JSON.stringify(response.data)
                });

                return false;
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace (get_session_tokens)] Unable to get session token');

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

    })();
};

/**
 *  Terminates current session
 * @param session
 * @param callback
 */
exports.destroy_session_token = function (session, callback) {

    'use strict';

    if (session === undefined) {

        callback({
            error: true,
            error_message: 'Missing session'
        });

        return false;
    }

    let apiUrl = CONFIG.archivespaceHost + '/logout';

    (async() => {

        try {

            let response = await HTTP({
                method: 'post',
                url: apiUrl,
                timeout: TIMEOUT,
                headers: {
                    'X-ArchivesSpace-Session': session,
                    'Content-Type': 'application/json'
                }
            });

            if (response.error === true) {

                LOGGER.module().error('ERROR: [/libs/archivesspace (destroy_session_token)] Unable to terminate session');

                callback({
                    error: true,
                    error_message: 'Unable to terminate session'
                });

                return false;

            } else if (response.status === 200) {

                callback({
                    error: false,
                    data: response.data
                });

                return false;
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivesspace (destroy_session_token)] Unable to terminate session');

            callback({
                error: true,
                error_message: error
            });
        }

    })();
};