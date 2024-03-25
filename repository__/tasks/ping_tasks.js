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

const HTTP = require('axios');
const LOGGER = require('../../libs/log4');

/**
 * Contains tasks used to ping third-party repository services (ArchivesSpace, Archivematica, Handle Service etc...)
 * @type {Ping_tasks}
 */
const Ping_tasks = class {

    constructor(ARCHIVEMATICA_LIB, DURACLOUD_LIB, HANDLES_LIB, ARCHIVESSPACE_LIB) {
        this.ARCHIVEMATICA_LIB = ARCHIVEMATICA_LIB;
        this.DURACLOUD_LIB = DURACLOUD_LIB;
        this.HANDLES_LIB = HANDLES_LIB;
        this.ARCHIVESSPACE_lib = ARCHIVESSPACE_LIB;
    }

    /**
     * Pings Archivematica
     * @return Promise
     */
    ping_archivematica = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    let response = await this.ARCHIVEMATICA_LIB.ping_api();
                    console.log(response);
                    resolve(response)
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivematica)] unable to ping archivematica ' + error.message);
                    console.log(error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        });
    }

    /**
     * Pings Archivematica Storage Service
     * @return Promise
     */
    ping_archivematica_storage = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    let response = await this.ARCHIVEMATICA_LIB.ping_storage_api();
                    console.log(response);
                    resolve(response);
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivematica_storage)] unable to ping archivematica storage service');
                    console.log(error);
                    reject(false);
                }

            })();

            /*
            ARCHIVEMATICA.ping_storage_api(function (response) {

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivematica_storage)] unable to ping archivematica storage service');
                    reject(new Error('Unable to ping archivematica storage service'));
                }

                resolve(response.status);
            });

             */
        });

        return promise.then((response) => {
            return response;
        });
    }

    /**
     * Pings ArchivesSpace
     * @return Promise
     */
    ping_archivesspace = () => {

        let promise = new Promise((resolve, reject) => {

            /*
            ARCHIVESSPACE.ping(function (response) {
                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivesspace)] unable to ping archivesspace');
                    reject(new Error('Unable to ping archivesspace'));
                }

                resolve(response.status);
            });

             */
        });

        return promise.then((response) => {
            return response;
        });

    }

    /**
     * Pings DuraCloud storage service
     * @return Promise
     */
    ping_duracloud = () => {

        let promise = new Promise((resolve, reject) => {
            DURACLOUD.ping(function (response) {
                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_duracloud)] unable to ping duracloud');
                    reject(new Error('Unable to ping duracloud'));
                }

                resolve(response.status);
            });
        });

        return promise.then((response) => {
            return response;
        });
    }

    /**
     * Pings handle server
     * @return Promise
     */
    ping_handle_server = () => {

        return (async () => {

            let handle_server_status = 'down';

            try {

                // TODO: use handle lib
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
     * Pings image convert service
     * @return Promise
     */
    ping_convert_service = () => {

        return (async () => {

            let ingest_convert_service_status = 'down';

            try {

                let endpoint = CONFIG.convertService;
                let response = await HTTP.get(endpoint, {
                    timeout: 25000
                });

               if (response.status === 200) {
                   ingest_convert_service_status = 'up';
                }

                return ingest_convert_service_status;

            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/tasks (ping_convert_service)] Unable to ping convert service. ' + error.message);
            }

        })();
    }

    /**
     * Pings transcript service
     * @return Promise
     */
    ping_transcript_service = () => {

        return (async () => {

            let ingest_transcript_service_status = 'down';

            try {

                let endpoint = CONFIG.transcriptService;
                let response = await HTTP.get(endpoint, {
                    timeout: 25000
                });

               if (response.status === 200) {
                   ingest_transcript_service_status = 'up';
               }

                return ingest_transcript_service_status;

            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/tasks (ping_transcript_service)] Unable to ping transcript service. ' + error.message);
            }

        })();
    }
};

module.exports = Ping_tasks;
