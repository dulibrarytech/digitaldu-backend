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

const CONFIG = require('../../config/config');
const ARCHIVEMATICA = require('../../libs/archivematica');
const ARCHIVESSPACE = require('../../libs/archivespace');
const DURACLOUD = require('../../libs/duracloud');
const HTTP = require('axios');
const LOGGER = require('../../libs/log4');

/**
 * Contains tasks used to ping third-party repository services (ArchivesSpace, Archivematica, Handle Service etc...)
 * @type {Ping_tasks}
 */
const Ping_tasks = class {

    constructor() {}

    /**
     *
     * @return {Promise<unknown>}
     */
    ping_archivematica = () => {

        let promise = new Promise((resolve, reject) => {
            ARCHIVEMATICA.ping_api(function (response) {

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivematica)] unable to ping archivematica');
                    reject(new Error('Unable to ping archivematica'));
                }

                resolve(response.status);
            });
        });

        return promise.then((response) => {
            return response;
        });
    }

    /**
     *
     * @return {Promise<unknown>}
     */
    ping_archivematica_storage = () => {

        let promise = new Promise((resolve, reject) => {
            ARCHIVEMATICA.ping_storage_api(function (response) {

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivematica_storage)] unable to ping archivematica storage service');
                    reject(new Error('Unable to ping archivematica storage service'));
                }

                resolve(response.status);
            });
        });

        return promise.then((response) => {
            return response;
        });
    }

    /**
     *
     * @return {Promise<unknown>}
     */
    ping_archivesspace = () => {

        let promise = new Promise((resolve, reject) => {
            ARCHIVESSPACE.ping(function (response) {
                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (ping_archivesspace)] unable to ping archivesspace');
                    reject(new Error('Unable to ping archivesspace'));
                }

                resolve(response.status);
            });
        });

        return promise.then((response) => {
            return response;
        });

    }

    /**
     *
     * @return {Promise<unknown>}
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
     *
     * @return {Promise<string|undefined>}
     */
    ping_handle_server = () => {

        return (async () => {

            let handle_server_status = 'down';

            try {

                let endpoint = CONFIG.handleHost.replace('handle-service-0.6', '');
                let response = await HTTP.get(endpoint, {
                    timeout: 25000
                });

                if (response.status === 200) {
                    handle_server_status = 'up';
                }

                return handle_server_status;

            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/service module (ping_handle_server)] Unable to ping handle server. ' + error.message);
            }

        })();
    }

    /**
     *
     * @return {Promise<string|undefined>}
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
                LOGGER.module().error('ERROR: [/repository/tasks (ping_convert_service)] Unable to ping convert service.');
            }

        })();
    }

    /**
     *
     * @return {Promise<string|undefined>}
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
                LOGGER.module().error('ERROR: [/repository/service module (ping_transcript_service)] Unable to ping transcript service. ' + error.message);
            }

        })();
    }
};

module.exports = Ping_tasks;
