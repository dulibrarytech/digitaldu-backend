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

const HTTP = require('axios');
const LOGGER = require('../libs/log4');

/**
 * Creates and updates record handles
 * @type {Handles_lib}
 */
const Handles_lib = class {

    constructor(HANDLE_CONFIG) {
        this.HANDLE_CONFIG = HANDLE_CONFIG;
        this.auth = Buffer.from(this.HANDLE_CONFIG.handle_user + ':' + this.HANDLE_CONFIG.handle_password).toString('base64');
        this.config = {
            timeout: 45000,
            headers: {
                'Authorization': 'Basic ' + this.auth
            }
        }
    }

    /**
     *
     * @returns {Promise<string|undefined>}
     */
    ping = () => {

        return (async () => {

            let handle_server_status = 'down';

            try {

                let endpoint = HANDLE_CONFIG.handle_host.replace('handle-service-0.6', '');
                let response = await HTTP.get(endpoint, {
                    timeout: 25000
                });

                if (response.status === 200) {
                    handle_server_status = 'up';
                }

                return handle_server_status;

            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/tasks (ping_handle_server)] Unable to ping handle server. ' + error.message);
            }

        })();
    }

    /**
     * Creates handle
     * @param uuid
     * @returns {Promise<unknown>}
     */
    create_handle = (uuid) => {

        let promise = new Promise((resolve, reject) => {

         (async () => {

                try {

                    let handle_url = this.HANDLE_CONFIG.handle_host;
                    handle_url += '/';
                    handle_url += this.HANDLE_CONFIG.handle_prefix;
                    handle_url += '/' + encodeURIComponent(uuid);
                    handle_url += '?target=';
                    handle_url += this.HANDLE_CONFIG.handle_target;
                    handle_url += encodeURIComponent(uuid);

                    let response = await HTTP.post(handle_url, '', {
                        timeout: 45000,
                        headers: {
                            'Authorization': 'Basic ' + this.auth
                        }
                    });

                    if (response.status === 201) {
                        LOGGER.module().info('INFO: [/libs/handles lib (create_handle)] Handle for object: ' + uuid + ' had been created.');
                        resolve(this.HANDLE_CONFIG.handle_server + this.HANDLE_CONFIG.handle_prefix + '/' + uuid);
                    } else if (response.status === 409) {
                        LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Handle already exists (conflict) ' + uuid);
                        reject({
                            message: 'Error: [/libs/handles lib (create_handle)] Handle already exists (conflict)'
                        });
                    }

                    return false;

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/handles lib (create_handle)] Unable to create new handle ' + error);
                    reject({
                        message: 'Error: [/libs/handles lib (create_handle)] Unable to create new handle ' + error
                    });
                }

           })();
        });

        return promise.then((handle) => {
            return handle;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Updates handle
     * @param prev_uuid
     * @param new_uuid
     */
    update_handle = (prev_uuid, new_uuid) => {
        // /10176/test-du-repo-update-2022?target=https://specialcollections.du.edu/object/test-du-repo-2022
        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let handle_url = this.HANDLE_CONFIG.handle_host;
                        handle_url += '/';
                        handle_url += this.HANDLE_CONFIG.handle_prefix;
                        handle_url += '/';
                        handle_url += encodeURIComponent(prev_uuid);
                        handle_url += '?target=';
                        handle_url += this.HANDLE_CONFIG.handle_target;
                        handle_url += encodeURIComponent(new_uuid);

                    let response = await HTTP.put(handle_url, '', this.config);

                    if (response.status === 204) {
                        LOGGER.module().info('INFO: [/libs/handles lib (update_handle)] Handle for object: ' + prev_uuid + ' had been updated with ' + new_uuid);
                        resolve(this.HANDLE_CONFIG.handle_server + this.HANDLE_CONFIG.handle_prefix + '/' + new_uuid);
                    } else {
                        LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to update handle.');
                        reject({
                            message: 'Error: [/libs/handles lib (update_handle)] Unable to update handle.'
                        });
                    }

                    return false;

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. ' + error);
                    reject({
                        message: error
                    });
                }

            })();
        });

        return promise.then((handle) => {
            return handle;
        }).catch((error) => {
            return error;
        });
    };

    /** TODO
     * Deletes handle
     */
    delete_handle = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let handle_url = this.HANDLE_CONFIG.handle_host;
                    handle_url += '/';
                    handle_url += this.HANDLE_CONFIG.handle_prefix;
                    handle_url += '/' + encodeURIComponent(uuid);
                    handle_url += '?target=';
                    handle_url += this.HANDLE_CONFIG.handle_target;
                    handle_url += encodeURIComponent(uuid);

                    // TODO: headers in axios delete
                    let response = await HTTP.delete(handle_url, this.config);

                    if (response.status === 204) {
                        LOGGER.module().info('INFO: [/libs/handles lib (delete_handle)] Handle for object: ' + uuid + ' had been deleted.');
                        resolve(this.HANDLE_CONFIG.handle_server + this.HANDLE_CONFIG.handle_prefix + '/' + uuid);
                    } else {
                        LOGGER.module().error('ERROR: [/libs/handles lib (delete_handle)] Unable to update handle.');
                        reject({
                            message: 'Error: [/libs/handles lib (delete_handle)] Unable to delete handle.'
                        });
                    }

                    return false;

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/handles lib (update_handle)] Unable to create handle. ' + error);
                    reject({
                        message: error
                    });
                }

            })();
        });

        return promise.then((handle) => {
            return handle;
        }).catch((error) => {
            return error;
        });
    };
}

// TODO: add delete method
// DELETE http://hdl.coalliance.org:8080/handle-service-0.6/10176/test-du-repo-2022?target=https://specialcollections.du.edu/object/test-du-repo-2022
module.exports = Handles_lib;
