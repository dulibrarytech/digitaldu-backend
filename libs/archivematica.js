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

const CLIENT = require('ssh2-sftp-client'),
    HTTP = require('axios'),
    QS = require('querystring'),
    LOGGER = require('../libs/log4');
const CONFIG = require("../config/config");

/**
 * Object contains methods to access Archivematica
 * @param ARCHIVESSPACE (object)
 * @type {Archivematica_lib}
 */
const Archivematica_lib = class {

    constructor(ARCHIVEMATICA) {
        this.ARCHIVEMATICA = ARCHIVEMATICA;
    }

    /**
     * Pings archivematica api to check availability
     */
    ping_api = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = this.ARCHIVEMATICA.archivematica_api;
                    endpoint += 'administration/dips/atom/levels/?username=';
                    endpoint += this.ARCHIVEMATICA.archivematica_username;
                    endpoint += '&api_key=' + this.ARCHIVEMATICA.archivematica_api_key;

                    let response = await HTTP.get(endpoint, {
                        timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            status: 'up',
                            message: 'Archivematica service is available'
                        });

                    }

                } catch (error) {

                    LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping Archivematica. Request failed: ' + error);

                    reject({
                        status: 'down',
                        message: 'ERROR: [/libs/archivematica lib (ping_api)] Unable to ping Archivematica'
                    });
                }

                return false;

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Pings archivematica storage api
     */
    ping_storage_api = () => {

        let promise = new Promise((resolve, reject) => {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/file/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(endpoint, {
                        timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            status: 'up',
                            message: 'Archivematica storage api service is available'
                        });

                    }

                    return false;

                } catch (error) {

                    LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping archivematica storage api. Request failed: ' + error);

                    reject({
                        status: 'down',
                        message: 'ERROR: [/libs/archivematica lib (ping_storage_api)] Unable to ping archivematica storage api'
                    });
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
     * Gets DIP storage usage
     */
    get_dip_storage_usage = () => {

        let promise = new Promise((resolve, reject) => {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/space/';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_dip_uuid;

            (async () => {

                try {

                    let response = await HTTP.get(endpoint, {
                        timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                        headers: {
                            'Authorization': 'ApiKey ' + this.ARCHIVEMATICA.archivematica_storage_username + ':' + this.ARCHIVEMATICA.archivematica_storage_api_key
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            message: 'Archivematica/DuraCloud DIP storage usage',
                            data: response.data.used
                        });
                    }

                    return false;

                } catch (error) {

                    LOGGER.module().error('ERROR: [/libs/archivematica lib (get_dip_storage_usage)] unable to get DIP storage usage. ' + error);

                    reject({
                        message: 'ERROR: [/libs/archivematica lib (get_dip_storage_usage)] unable to get DIP storage usage.'
                    });
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
     * List the files and folders on the FTP server
     * @param folder
     */
    list = (folder) => {

        let promise = new Promise((resolve, reject) => {

            let config = {
                host: this.ARCHIVEMATICA.archivematica_sftp_host,
                port: this.ARCHIVEMATICA.archivematica_sftp_port,
                username: this.ARCHIVEMATICA.archivematica_sftp_user,
                password: this.ARCHIVEMATICA.archivematica_sftp_password,
                remote_path: this.ARCHIVEMATICA.archivematica_sftp_remote_path
            };

            const sftp = new CLIENT();

            sftp.connect(config).then(function () {

                let remotePath = config.remote_path;

                if (folder !== 'null') {
                    let path = folder.replace(/,/g, '/');
                    remotePath = config.remote_path + '/' + path;
                }

                return sftp.list(remotePath);

            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                LOGGER.module().error('ERROR: [/libs/archivematica lib (list)] unable to list sftp folders ' + error);
                reject(error);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Starts transfer process
     * @param transfer_obj
     */
    start_transfer = (transfer_obj) => {

        let promise = new Promise((resolve, reject) => {

            let transfer_source = this.ARCHIVEMATICA.archivematica_transfer_source;
            let sftp_path = this.ARCHIVEMATICA.archivematica_sftp_remote_path;
            let location = transfer_source + ':' + sftp_path + '/' + transfer_obj.is_member_of_collection + '/' + transfer_obj.object;
            let buffer = Buffer.from(location);
            let encoded_location = buffer.toString('base64');
            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'transfer/start_transfer/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            (async () => {

                try {

                    let data = {
                        'name': transfer_obj.is_member_of_collection + '_' + transfer_obj.object + '_transfer',
                        'type': 'standard',
                        'accession': '',
                        'paths[]': encoded_location,
                        'rows_ids[]': '[""]'
                    };

                    let response = await HTTP.post(endpoint, QS.stringify(data), {
                        timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    if (response.status === 200) {
                        resolve(JSON.stringify(response.data));
                    }

                    return false;

                } catch (error) {

                    LOGGER.module().fatal('FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer. Request failed: ' + error);
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

};

module.exports = Archivematica_lib;
