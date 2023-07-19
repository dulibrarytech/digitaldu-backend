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

const CLIENT = require('ssh2-sftp-client'),
    HTTP = require('axios'),
    QS = require('querystring'),  // TODO: deprecated
    LOGGER = require('../libs/log4');

/**
 * Object contains methods to access Archivematica
 * @param ARCHIVESSPACE (object)
 * @type {Archivematica}
 */
const Archivematica = class {

    constructor(ARCHIVEMATICA_CONFIG) {
        this.ARCHIVEMATICA = ARCHIVEMATICA_CONFIG;
    }

    /**
     * Pings archivematica api to check availability
     */
    async ping_api() {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'administration/dips/atom/levels/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=' + this.ARCHIVEMATICA.archivematica_api_key;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return true;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping Archivematica. Request failed: ' + error.message);
        }
    };

    /**
     * Pings archivematica storage api
     */
    async ping_storage_api() {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/file/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_api_key;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return true;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping archivematica storage api. Request failed: ' + error.message);
        }
    };

    /**
     * Gets DIP storage usage
     */
    async get_dip_storage_usage() {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/space/';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_dip_uuid;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Authorization': 'ApiKey ' + this.ARCHIVEMATICA.archivematica_storage_username + ':' + this.ARCHIVEMATICA.archivematica_storage_api_key
                }
            });

            if (response.status === 200) {
                return response.data.used;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_dip_storage_usage)] unable to get DIP storage usage. ' + error.message);
        }
    };

    /**
     * Gets AIP storage usage
     */
    async get_aip_storage_usage() {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/space/';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_aip_uuid;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Authorization': 'ApiKey ' + this.ARCHIVEMATICA.archivematica_storage_username + ':' + this.ARCHIVEMATICA.archivematica_storage_api_key
                }
            });

            if (response.status === 200) {
                return response.data.used
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_aip_storage_usage)] unable to get AIP storage usage. ' + error.message);
        }
    };

    /**
     * Starts transfer process
     * @param transfer_obj
     */
    async start_transfer(transfer_obj) {

        try {

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

            const data = {
                'name': transfer_obj.is_member_of_collection + '_' + transfer_obj.object + '_transfer',
                'type': 'standard',
                'accession': '',
                'paths[]': encoded_location,
                'rows_ids[]': '[""]'
            };

            // TODO: Remove QS usage
            const response = await HTTP.post(endpoint, QS.stringify(data), {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                return JSON.stringify(response.data);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (start_transfer)] unable to start transfer. Request failed: ' + error.message);
        }
    };

    /**
     * Approves transfer
     * @param transfer_folder
     */
    async approve_transfer(transfer_folder) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'transfer/approve?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            const data = {
                'type': 'standard',
                'directory': transfer_folder
            };

            // TODO: remove QS
            const response = await HTTP.post(endpoint, QS.stringify(data), {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                return JSON.stringify(response.data);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer. Request failed: ' + error.error);
        }
    };

    /**
     * Checks transfer status
     * @param uuid
     */
    async get_transfer_status(uuid) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'transfer/status/';
            endpoint += uuid;
            endpoint += '/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return JSON.stringify(response.data);
            }

            return false;

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_transfer_status)] unable to get transfer status. Request failed:  ' + error.message);
        }
    };

    /**
     * Check ingest status
     * @param uuid
     */
    async get_ingest_status(uuid) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'ingest/status/';
            endpoint += uuid;
            endpoint += '/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return JSON.stringify(response.data);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status. Request failed: ' + error.message);
        }
    };

    /**
     * Constructs path to dip store in DuraCloud
     * @param uuid
     */
    async get_dip_path(uuid) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/file/';
            endpoint += uuid;
            endpoint += '/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_api_key;

            const response = await HTTP.get(endpoint, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                let json = response.data,
                    dipuuidArr = json.related_packages[0].split('/');

                let uuid = dipuuidArr.filter(function (result) {
                    return result;
                });

                let dipuuid = uuid[uuid.length - 1],
                    tmp = dipuuid.replace(/-/g, ''),
                    tmpuuid = tmp.match(/.{1,4}/g),
                    path = tmpuuid.join('/');

                let folderArr = json.current_path.split('/'),
                    folderTmp = folderArr[folderArr.length - 1],
                    folder = folderTmp.replace('.7z', ''),
                    dipPath = path + '/' + folder;

                return dipPath;
            }

            return false;

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path. Request failed: ' + error.message);
        }
    };

    /**
     * Clears archivematica transfer queue
     * @param uuid
     */
    async clear_transfer(uuid) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'transfer/';
            endpoint += uuid;
            endpoint += '/delete/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            const response = await HTTP.delete(endpoint);

            if (response.status === 200) {
                LOGGER.module().info('INFO: [/libs/archivematica lib (clear_transfer)] transfer ' + uuid + ' has been cleared.');
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (clear_transfer)] unable to clear transfer queue ' + error);
        }
    };

    /**
     * Clears archivematica ingest queue
     * @param uuid
     */
    async clear_ingest(uuid) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_api;
            endpoint += 'ingest/';
            endpoint += uuid;
            endpoint += '/delete/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_api_key;

            const response = await HTTP.delete(endpoint);

            if (response.status === 200) {
                LOGGER.module().info('INFO: [/libs/archivematica lib (clear_ingest)] ingest ' + uuid + ' has been cleared.');
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (clear_ingest)] unable to clear ingest ' + error.message);
        }
    };

    /**
     * Generates a delete request
     * @param obj
     */
    async delete_aip_request(obj) {

        try {

            let endpoint = this.ARCHIVEMATICA.archivematica_storage_api;
            endpoint += 'v2/file/';
            endpoint += obj.uuid;
            endpoint += '/delete_aip/?username=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_username;
            endpoint += '&api_key=';
            endpoint += this.ARCHIVEMATICA.archivematica_storage_api_key;

            const data = {
                'event_reason': obj.delete_reason,
                'pipeline': this.ARCHIVEMATICA.archivematica_pipeline,
                'user_id': this.ARCHIVEMATICA.archivematica_user_id,
                'user_email': this.ARCHIVEMATICA.archivematica_user_email
            };

            const response = await HTTP.post(endpoint, data, {
                timeout: this.ARCHIVEMATICA.archivematica_transfer_timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                LOGGER.module().info('INFO: [/libs/archivematica lib (delete_aip)] A deletion request already exists for this AIP (' + obj.uuid + ').');

                if (response.data.message === 'A deletion request already exists for this AIP.') {
                    return {
                        message: response.data.message,
                        data: {
                            id: 0
                        }
                    };
                }

            } else if (response.status === 202) {

                LOGGER.module().info('INFO: [/libs/archivematica lib (delete_aip)] delete aip (' + obj.uuid + ') request succeeded.');

                return {
                    message: 'INFO: [/libs/archivematica lib (delete_aip)] delete aip (' + obj.uuid + ') request succeeded.',
                    data: JSON.stringify(response.data)
                };
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (delete_aip)] unable to delete aip. Request failed: ' + error.message);
        }
    };

}

module.exports = Archivematica;
