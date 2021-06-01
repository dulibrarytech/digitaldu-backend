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
    CLIENT = require('ssh2-sftp-client'),
    HTTP = require('axios'),
    QS = require('querystring'),
    TIMEMOUT = 35000,
    LOGGER = require('../libs/log4'),
    TEST = require('../test/mocks/archivematica-mock');

/**
 * Pings archivematica api to check availability
 * @param callback
 */
exports.ping_api = function (callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'administration/dips/atom/levels/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping Archivematica.');

                callback({
                    error: true,
                    status: 'down',
                    message: 'ERROR: [/libs/archivematica lib (ping_api)] Unable to ping Archivematica'
                });

            } else if (response.status === 200) {

                callback({
                    error: false,
                    status: 'up',
                    message: 'Archivematica service is available'
                });

            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping Archivematica. Request failed: ' + error);

            callback({
                error: true,
                status: 'down',
                message: 'ERROR: [/libs/archivematica lib (ping_api)] Unable to ping Archivematica'
            });
        }

        return false;

    })();
};

/**
 * Pings archivematica storage api
 * @param callback
 */
exports.ping_storage_api = function (callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaStorageApi + 'v2/file/?username=' + CONFIG.archivematicaStorageUsername + '&api_key=' + CONFIG.archivematicaStorageApiKey;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping Archivematica storage api.');

                callback({
                    error: true,
                    status: 'down',
                    message: 'ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping Archivematica storage api.'
                });

            } else if (response.status === 200) {

                callback({
                    error: false,
                    status: 'up',
                    message: 'Archivematica storage api service is available'
                });

            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping archivematica storage api. Request failed: ' + error);

            callback({
                error: true,
                status: 'down',
                message: 'ERROR: [/libs/archivematica lib (ping_storage_api)] Unable to ping archivematica storage api'
            });
        }

    })();
};

/**
 * List the files and folders on the FTP server
 * @param folder
 * @param callback
 */
exports.list = function (folder, callback) {

    'use strict';

    if (CONFIG.nodeEnv === 'test') {

        TEST.list(folder, function(data) {
            callback(data);
        });

        return false;
    }

    const sftp = new CLIENT();

    sftp.connect({

        host: CONFIG.sftpHost,
        port: '22',
        username: CONFIG.sftpId,
        password: CONFIG.sftpPwd

    }).then(function () {

        let remotePath = CONFIG.sftpRemotePath;

        if (folder !== 'null') {
            let path = folder.replace(/,/g, '/');
            remotePath = CONFIG.sftpRemotePath + '/' + path;
        }

        return sftp.list(remotePath);

    }).then(function (data) {
        callback(data);
    }).catch(function (error) {
        LOGGER.module().fatal('FATAL: [/libs/archivematica lib (list)] unable to list sftp folders ' + error);
        throw 'FATAL: [/libs/archivematica lib (list)] unable to list sftp folders ' + error;
    });
};

/**
 * Starts transfer process
 * @param transferObj
 * @param callback
 */
exports.start_transfer = function (transferObj, callback) {

    'use strict';

    if (CONFIG.nodeEnv === 'test') {

        TEST.start_transfer(transferObj, function(data) {
            callback(data);
        });

        return false;
    }

    let transferSource = CONFIG.archivematicaTransferSource,
        sftpPath = CONFIG.sftpRemotePath,
        location = transferSource + ':' + sftpPath + '/' + transferObj.is_member_of_collection + '/' + transferObj.object,
        buffer = Buffer.from(location),
        encodedLocation = buffer.toString('base64'),
        endpoint = CONFIG.archivematicaApi + 'transfer/start_transfer/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let data = {
                'name': transferObj.is_member_of_collection + '_' + transferObj.object + '_transfer',
                'type': 'standard',
                'accession': '',
                'paths[]': encodedLocation,
                'rows_ids[]': '[""]'
            };

            let response = await HTTP.post(endpoint, QS.stringify(data), {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().fatal('FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer.');

                callback({
                    error: true,
                    message: 'FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer.'
                });

            } else if (response.status === 200) {
                console.log(JSON.stringify(response.data));
                callback(JSON.stringify(response.data));
            }

            return false;

        } catch (error) {

            LOGGER.module().fatal('FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer. Request failed: ' + error);

            callback({
                error: true,
                message: 'FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer. Request failed: ' + error
            });
        }

    })();
};

/**
 * Approves transfer
 * @param transferFolder
 * @param callback
 */
exports.approve_transfer = function (transferFolder, callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'transfer/approve?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let data = {
                'type': 'standard',
                'directory': transferFolder
            };

            let response = await HTTP.post(endpoint, QS.stringify(data), {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer.');

                callback({
                    error: true,
                    message: 'ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer.'
                });

            } else if (response.status === 200) {
                callback(JSON.stringify(response.data));
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer. Request failed: ' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer. Request failed: ' + error
            });
        }

    })();
};

/**
 * Checks transfer status
 * @param uuid
 * @param callback
 */
exports.get_transfer_status = function (uuid, callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'transfer/status/' + uuid + '/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (get_transfer_status)] unable to get transfer status ' + error);

                callback({
                    error: true,
                    message: 'ERROR: [/libs/archivematica lib (get_transfer_status)] Unable to get transfer status'
                });

            } else if (response.status === 200) {
                callback(JSON.stringify(response.data));
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_transfer_status)] unable to get transfer status. Request failed:  ' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (get_transfer_status)] Unable to get transfer status'
            });
        }

    })();
};

/**
 * Check ingest status
 * @param uuid
 * @param callback
 */
exports.get_ingest_status = function (uuid, callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'ingest/status/' + uuid + '/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status.');

                callback({
                    error: true,
                    message: 'ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status.'
                });

            } else if (response.status === 200) {
                callback(JSON.stringify(response.data));
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status. Request failed: ' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status. Request failed: ' + error
            });
        }

    })();
};

/**
 * Constructs path to dip store in DuraCloud
 * @param uuid
 * @param callback
 */
exports.get_dip_path = function (uuid, callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaStorageApi + 'v2/file/' + uuid + '/?username=' + CONFIG.archivematicaStorageUsername + '&api_key=' + CONFIG.archivematicaStorageApiKey;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path.');

                callback({
                    error: true,
                    message: 'ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path.'
                });

            } else if (response.status === 200) {

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

                callback(dipPath);
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path. Request failed: ' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path. Request failed: ' + error
            });
        }

    })();
};

/**
 * Clears archivematica transfer queue
 * @param uuid
 */
exports.clear_transfer = function (uuid) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'transfer/' + uuid + '/delete/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let response = await HTTP.delete(endpoint);

            if (response.status === 200) {
                LOGGER.module().info('INFO: [/libs/archivematica lib (clear_transfer)] transfer ' + uuid + ' has been cleared.');
            } else {
                LOGGER.module().error('ERROR: [HTTP libs (delete)] HTTP DELETE request failed.');
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (clear_transfer)] unable to clear transfer queue ' + error);
        }

    })();
};

/**
 * Clears archivematica ingest queue
 * @param uuid
 */
exports.clear_ingest = function (uuid) {

    'use strict';

    let endpoint = CONFIG.archivematicaApi + 'ingest/' + uuid + '/delete/?username=' + CONFIG.archivematicaUsername + '&api_key=' + CONFIG.archivematicaApiKey;

    (async () => {

        try {

            let response = await HTTP.delete(endpoint);

            if (response.status === 200) {
                LOGGER.module().info('INFO: [/libs/archivematica lib (clear_ingest)] ingest ' + uuid + ' has been cleared.');
            } else {
                LOGGER.module().error('ERROR: [HTTP libs (delete)] HTTP DELETE request failed.');
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/archivematica lib (clear_ingest)] unable to clear ingest ' + error);
        }

    })();
};

/**
 * Generates a delete request
 * @param obj
 * @param callback
 */
exports.delete_aip_request = function (obj, callback) {

    'use strict';

    let endpoint = CONFIG.archivematicaStorageApi + 'v2/file/' + obj.pid + '/delete_aip/?username=' + CONFIG.archivematicaStorageUsername + '&api_key=' + CONFIG.archivematicaStorageApiKey;

    (async () => {

        try {

            let data = {
                'event_reason': obj.delete_reason,
                'pipeline': CONFIG.archivematicaPipeline,
                'user_id': CONFIG.archivematicaUserId,
                'user_email': CONFIG.archivematicaUserEmail
            };

            let response = await HTTP.post(endpoint, data, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                LOGGER.module().info('INFO: [/libs/archivematica lib (delete_aip)] A deletion request already exists for this AIP (' + obj.pid + ').');

                if (response.data.message === 'A deletion request already exists for this AIP.') {
                    callback({
                        error: false,
                        message: response.data.message,
                        data: {
                            id: 0
                        }
                    });
                }

            } else if (response.status === 202) {

                LOGGER.module().info('INFO: [/libs/archivematica lib (delete_aip)] delete aip (' + obj.pid + ') request succeeded.');

                callback({
                    error: false,
                    message: 'INFO: [/libs/archivematica lib (delete_aip)] delete aip (' + obj.pid + ') request succeeded.',
                    data: JSON.stringify(response.data)
                });

            } else {

                LOGGER.module().error('ERROR: [/libs/archivematica lib (delete_aip)] unable to delete aip - (' + obj.pid + ')');

                callback({
                    error: true,
                    message: 'ERROR: [/libs/archivematica lib (delete_aip)] unable to delete aip - (' + obj.pid + ')'
                });
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/archivematica lib (delete_aip)] unable to delete aip. Request failed: ' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (delete_aip)] unable to delete aip. Request failed: ' + error
            });
        }

    })();
};