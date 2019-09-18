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

const config = require('../config/config'),
    client = require('ssh2-sftp-client'),
    request = require('request'),
    fs = require('fs'),
    logger = require('../libs/log4');

/**
 * Pings archivematica api to check availability
 * @param callback
 */
exports.ping_api = function (callback) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'administration/dips/atom/levels/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping archivematica ' + error);

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
                message: 'Archivematica service is available'
            });

            return false;

        } else {

            logger.module().error('ERROR: [/libs/archivematica lib (ping_api)] unable to ping archivematica ' + body);

            callback({
                error: true,
                status: 'down',
                message: 'ERROR: [/libs/archivematica lib (ping_api)] Unable to ping archivematica'
            });
        }
    });
};

/**
 * Pings archivematica storage api
 * @param callback
 */
exports.ping_storage_api = function (callback) {

    'use strict';

    let apiUrl = config.archivematicaStorageApi + 'v2/file/?username=' + config.archivematicaStorageUsername + '&api_key=' + config.archivematicaStorageApiKey;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping archivematica storage api ' + error);

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
                message: 'Archivematica storage api service is available'
            });

            return false;

        } else {

            logger.module().error('ERROR: [/libs/archivematica lib (ping_storage_api)] unable to ping archivematica storage api ' + body);

            callback({
                error: true,
                status: 'down',
                message: 'ERROR: [/libs/archivematica lib (ping_storage_api)] Unable to ping archivematica storage api'
            });
        }
    });
};

/**
 * List the files and folders on the FTP server
 * @param folder
 * @param callback
 */
exports.list = function (folder, callback) {

    'use strict';

    const sftp = new client();

    sftp.connect({

        host: config.sftpHost,
        port: '22',
        username: config.sftpId,
        password: config.sftpPwd

    }).then(function () {

        let remotePath = config.sftpRemotePath;

        if (folder !== 'null') {
            let path = folder.replace(/,/g, '/');
            remotePath = config.sftpRemotePath + '/' + path;
        }

        return sftp.list(remotePath);

    }).then(function (data) {
        callback(data);
    }).catch(function (error) {
        logger.module().fatal('FATAL: [/libs/archivematica lib (list)] unable to list sftp folders ' + error);
        throw 'FATAL: [/libs/archivematica lib (list)] unable to list sftp folders ' + error;
    });
};

/**
 * Starts transfer process
 * @param transferObj
 * @param callback
 */ // TODO: fix typo github issue #159
exports.start_tranfser = function (transferObj, callback) {

    'use strict';

    let transferSource = config.archivematicaTransferSource,
        sftpPath = config.sftpRemotePath,
        location = transferSource + ':' + sftpPath + '/' + transferObj.is_member_of_collection + '/' + transferObj.object,
        buffer = new Buffer(location),
        encodedLocation = buffer.toString('base64'),
        apiUrl = config.archivematicaApi + 'transfer/start_transfer/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.post({
        url: apiUrl,
        form: {
            'name': transferObj.is_member_of_collection + '_' + transferObj.object + '_transfer',
            'type': 'standard',
            'accession': '',
            'paths[]': encodedLocation,
            'rows_ids[]': '[""]'
        }
    }, function (error, httpResponse, body) {

        if (error) {
            logger.module().fatal('FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer ' + error);
            return false;
        }

        if (httpResponse.statusCode === 200) {
            callback(body);
            return false;
        } else {

            logger.module().fatal('FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer ' + httpResponse.statusCode + '/' + error);

            callback({
                error: true,
                message: 'FATAL: [/libs/archivematica lib (start_transfer)] unable to start transfer ' + httpResponse.statusCode + '/' + error
            });

            return false;
        }
    });
};

/**
 * Approves transfer
 * @param transferFolder
 * @param callback
 */
exports.approve_transfer = function (transferFolder, callback) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'transfer/approve?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.post({
        url: apiUrl,
        form: {
            'type': 'standard',
            'directory': transferFolder
        },
        timeout: 55000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {
            callback(body);
            return false;
        } else {

            logger.module().error('ERROR: [/libs/archivematica lib (approve_transfer)] unable to approve transfer ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (approve_transfer)] Unable to approve transfer'
            });
        }
    });
};

/**
 * Checks transfer status
 * @param uuid
 * @param callback
 */
exports.get_transfer_status = function (uuid, callback) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'transfer/status/' + uuid + '/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {
            logger.module().error('ERROR: [/libs/archivematica lib (get_transfer_status)] unable to get transfer status ' + error);
            return false;
        }

        if (httpResponse.statusCode === 200) {
            callback(body);
            return false;

        } else {

            logger.module().error('ERROR: [/libs/archivematica lib (get_transfer_status)] unable to get transfer status ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (get_transfer_status)] Unable to get transfer status'
            });
        }
    });
};

/**
 * Check ingest status
 * @param uuid
 * @param callback
 */
exports.get_ingest_status = function (uuid, callback) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'ingest/status/' + uuid + '/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {
            logger.module().error('ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status ' + error);
            return false;
        }

        if (httpResponse.statusCode === 200) {
            callback(body);
            return false;
        } else {

            logger.module().error('ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status ' + httpResponse.statusCode + '/' + error);

            callback({
                error: true,
                message: 'ERROR: [/libs/archivematica lib (get_ingest_status)] unable to get ingest status ' + httpResponse.statusCode + '/' + error
            });

            return false;
        }
    });
};

/**
 * Constructs path to dip store in DuraCloud
 * @param uuid
 * @param callback
 */
exports.get_dip_path = function (uuid, callback) {

    'use strict';

    let apiUrl = config.archivematicaStorageApi + 'v2/file/' + uuid + '/?username=' + config.archivematicaStorageUsername + '&api_key=' + config.archivematicaStorageApiKey;

    request.get({
        url: apiUrl,
        timeout: 55000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (httpResponse.statusCode !== 200) {

            logger.module().error('ERROR: [/libs/archivematica lib (get_dip_path)] unable to get dip path ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                message: 'ERROR: Unable to get dip path'
            });

            return false;
        }

        let json = JSON.parse(body),
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
    });
};

/**
 * Clears archivematica transfer queue
 * @param uuid
 */
exports.clear_transfer = function (uuid) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'transfer/' + uuid + '/delete/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.delete({
        url: apiUrl,
        timeout: 55000
    }, function (error, httpResponse, body) {

        if (error) {
            logger.module().error('ERROR: [/libs/archivematica lib (clear_transfer)] unable to clear transfer queue ' + error);
            return false;
        }

        if (httpResponse.statusCode === 200) {
            logger.module().info('INFO: [/libs/archivematica lib (clear_transfer)] transfer ' + uuid + ' has been cleared.');
            return false;
        } else {
            logger.module().error('ERROR: [/libs/archivematica lib (clear_transfer)] unable to clear transfer queue ' + error);
            return false;
        }
    });
};

/**
 * Clears archivematica ingest queue
 * @param uuid
 */
exports.clear_ingest = function (uuid) {

    'use strict';

    let apiUrl = config.archivematicaApi + 'ingest/' + uuid + '/delete/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.delete({
        url: apiUrl,
        timeout: 55000
    }, function (error, httpResponse, body) {

        if (error) {
            logger.module().error('ERROR: [/libs/archivematica lib (clear_ingest)] unable to clear ingest ' + error);
            return false;
        }

        if (httpResponse.statusCode === 200) {
            logger.module().info('INFO: [/libs/archivematica lib (clear_ingest)] ingest ' + uuid + ' has been cleared.');
            return false;
        } else {
            logger.module().error('ERROR: [/libs/archivematica lib (clear_ingest)] unable to clear ingest ' + httpResponse.statusCode + '/' + error);
            return false;
        }
    });
};

/** TODO: refactor.  make use of shell.js and curl and run as OS process
 * Downloads AIP from archivematica
 * @param sip_uuid
 * @param callback
 */
exports.download_aip = function (sip_uuid, callback) {

    'use strict';

    if (fs.existsSync('./tmp/' + sip_uuid + '.7z')) {
        callback('./tmp/' + sip_uuid + '.7z');
        return false;
    }

    let apiUrl = config.archivematicaStorageApi + 'v2/file/' + sip_uuid + '/download/?username=' + config.archivematicaStorageUsername + '&api_key=' + config.archivematicaStorageApiKey;

    request.get({
        url: apiUrl,
        timeout: 600000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/archivematica lib (download_aip)] unable to download aip ' + error);

            callback({
                error: true,
                message: error
            });

            return false;
        }

        if (httpResponse.statusCode !== 200) {

            logger.module().error('ERROR: [/libs/archivematica lib (download_aip)] unable to get AIP ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                message: 'ERROR: Unable to get AIP'
            });

            return false;
        }

        fs.writeFile('./tmp/' + sip_uuid + '.7z', body, function(error) {

            if (error) {

                logger.module().error('ERROR: [/libs/archivematica lib (download_aip)] unable to write to tmp folder ' + error);

                callback({
                    error: true,
                    error_message: error
                });
            }

            setTimeout(function () {

                if (fs.existsSync('./tmp/' + sip_uuid + '.7z')) {
                    callback('./tmp/' + sip_uuid + '.7z');
                    return false;
                }

            }, 1000);
        });
    });
};