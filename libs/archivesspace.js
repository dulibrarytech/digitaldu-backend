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

'use strict';

const HTTP = require('axios');
const TIMEOUT = 60000 * 5;
const LOGGER = require('../libs/log4');

/**
 * Object contains methods to access ArchivesSpace
 * @param ARCHIVESSPACE_HOST
 * @param ARCHIVESSPACE_USER
 * @param ARCHIVESSPACE_PASSWORD
 * @param ARCHIVESSPACE_REPOSITORY_ID
 * @type {Archivesspace}
 */
const Archivesspace = class {

    constructor(ARCHIVESSPACE_CONFIG) {
        this.ARCHIVESSPACE_HOST = ARCHIVESSPACE_CONFIG.archivesspace_host;
        this.ARCHIVESSPACE_USER = ARCHIVESSPACE_CONFIG.archivesspace_user;
        this.ARCHIVESSPACE_PASSWORD = ARCHIVESSPACE_CONFIG.archivesspace_password;
        // this.ARCHIVESSPACE_REPOSITORY_ID = ARCHIVESSPACE_CONFIG.archivesspace_repository_id;
    }

    /**
     * Pings Archivesspace to check availability
     */
    async ping() {

        try {

            let response = await HTTP.get(this.ARCHIVESSPACE_HOST, {
                timeout: 25000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                return {
                    error: false,
                    status: 'up',
                    message: 'ArchivesSpace service is available'
                };
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed ' + error.message);
            return false;
        }
    }

    /**
     * Gets session token from ArchivesSpace
     * @return token <string>
     */
    async get_session_token() {

        try {

            let api_url = this.ARCHIVESSPACE_HOST;
            api_url += '/users/';
            api_url += this.ARCHIVESSPACE_USER;
            api_url += '/login?password=';
            api_url += this.ARCHIVESSPACE_PASSWORD;
            api_url += '&expiring=false';

            let response = await HTTP.post(api_url, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return response.data.session;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivesspace (get_session_tokens)] Unable to get session token ' + error.message);
            return false;
        }
    }

    /**
     * Gets JSON representation of metadata archival object and resource record(s) from Archivesspace
     * @param uri
     * @param token
     */
    async get_record(uri, token) {

        try {

            let api_endpoint = this.ARCHIVESSPACE_HOST + uri + '/repository';
            let response = await HTTP.get(api_endpoint, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'X-ArchivesSpace-Session': token
                }
            });

            if (response.status === 200) {

                return {
                    metadata: response.data
                };
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_record)] Unable to get archivesspace resource: ' + error.message);
            return false;
        }
    }

    /**
     * Terminates current session
     * @param token
     */
    async destroy_session_token(token) {

        try {

            let api_url = this.ARCHIVESSPACE_HOST + '/logout';
            let response = await HTTP({
                method: 'post',
                url: api_url,
                timeout: TIMEOUT,
                headers: {
                    'X-ArchivesSpace-Session': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                return {
                    data: response.data
                };
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivesspace (destroy_session_token)] Unable to terminate session ' + error.message);
            return false;
        }
    }
}

module.exports = Archivesspace;
