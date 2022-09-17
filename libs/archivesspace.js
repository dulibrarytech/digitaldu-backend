/**

 Copyright 2022 University of Denver

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

const HTTP = require('axios'),
    TIMEOUT = 60000 * 5,
    LOGGER = require('../libs/log4');

/**
 * Object contains methods to access ArchivesSpace
 * @param ARCHIVESSPACE_HOST
 * @param ARCHIVESSPACE_USER
 * @param ARCHIVESSPACE_PASSWORD
 * @param ARCHIVESSPACE_REPOSITORY_ID
 * @type {ArchivesSpace_lib}
 */
const ArchivesSpace_lib = class {

    constructor(ARCHIVESSPACE_CONFIG) {
        this.ARCHIVESSPACE_HOST = ARCHIVESSPACE_CONFIG.archivesspace_host;
        this.ARCHIVESSPACE_USER = ARCHIVESSPACE_CONFIG.archivesspace_user;
        this.ARCHIVESSPACE_PASSWORD = ARCHIVESSPACE_CONFIG.archivesspace_password;
        this.ARCHIVESSPACE_REPOSITORY_ID = ARCHIVESSPACE_CONFIG.archivesspace_repository_id;
    }

    /**
     * Pings Archivesspace to check availability
     */
    ping = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let response = await HTTP.get(this.ARCHIVESSPACE_HOST, {
                        timeout: 25000,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            error: false,
                            status: 'up',
                            message: 'Archivespace service is available'
                        });
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/archivesspace lib (ping)] request to archivesspace failed');
                    reject(error);
                }
            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets session token from ArchivesSpace
     * @return token <string>
     */
    get_session_token = () => {

        let promise = new Promise((resolve, reject) => {

            let api_url = this.ARCHIVESSPACE_HOST;
            api_url += '/users/';
            api_url += this.ARCHIVESSPACE_USER;
            api_url += '/login?password=';
            api_url += this.ARCHIVESSPACE_PASSWORD;
            api_url += '&expiring=false';

            (async () => {

                try {

                    let response = await HTTP.post(api_url, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data.session);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/archivesspace (get_session_tokens)] Unable to get session token ' + error.message);
                    reject(error);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets JSON representation of metadata resource record from archivesspace
     * @param uri
     * @param token
     */
    get_resource_record = (uri, token) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                let api_url = this.ARCHIVESSPACE_HOST + uri;

                try {

                    let response = await HTTP.get(api_url, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-ArchivesSpace-Session': token
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            error: false,
                            metadata: response
                        });

                        return false;
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_metadata)] Unable to get archivesspace resource: (http status code ' + error.response.status + ') ' + error.message);
                    reject(error);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets JSON representation of metadata archival object record from archivesspace
     * @param uri
     * @param token
     */
    get_record = (uri, token) => { // get_archival_object_record

        let promise = new Promise((resolve, reject) => {

            let api_endpoint = this.ARCHIVESSPACE_HOST + uri + '/repository';

            (async() => {

                try {

                    let response = await HTTP.get(api_endpoint, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-ArchivesSpace-Session': token
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            metadata: response.data
                        });

                        return false;
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/archivesspace lib (get_metadata)] Unable to get archivesspace resource: (http status code ' + error.response.status + ') ' + error.message);
                    reject(error);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Terminates current session
     * @param session
     */
    destroy_session_token = (session) => {

        let promise = new Promise((resolve, reject) => {

            let api_url = this.ARCHIVESSPACE_HOST + '/logout';

            (async () => {

                try {

                    let response = await HTTP({
                        method: 'post',
                        url: api_url,
                        timeout: TIMEOUT,
                        headers: {
                            'X-ArchivesSpace-Session': session,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            data: response.data
                        });

                        return false;
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/archivesspace (destroy_session_token)] Unable to terminate session ' + error.message);
                    reject(error);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = ArchivesSpace_lib;
