const config = require('../config/config'),
    client = require('ssh2-sftp-client'),
    request = require('request');

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

        callback({
            error: true,
            message: error
        });

        throw error;
    });
};

/**
 * Starts transfer
 * @param transferObj
 * @param callback
 */
exports.start_tranfser = function (transferObj, callback) {

    'use strict';

    var transferSource = config.archivematicaTransferSource,
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
            callback({
                error: true,
                message: error
            });
        }

        if (httpResponse.statusCode !== 201) {

            callback({
                error: true,
                message: 'Error: Unable to start transfer'
            });
        }

        callback(body);
    });
};

/**
 * Approves transfer
 * @param transferFolder
 * @param callback
 */
exports.approve_transfer = function (transferFolder, callback) {

    'use strict';

    var apiUrl = config.archivematicaApi + 'transfer/approve?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.post({
        url: apiUrl,
        form: {
            'type': 'standard',
            'directory': transferFolder
        }
    }, function (error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        callback(body);
    });
};

/**
 * Checks transfer status
 * @param uuid
 * @param callback
 */
exports.get_transfer_status = function (uuid, callback) {

    'use strict';

    var apiUrl = config.archivematicaApi + 'transfer/status/' + uuid + '/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.get({
        url: apiUrl
    }, function (error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        callback(body);
    });
};

/**
 * Check ingest status
 * @param uuid
 * @param callback
 */
exports.get_ingest_status = function (uuid, callback) {

    'use strict';

    var apiUrl = config.archivematicaApi + 'ingest/status/' + uuid + '/?username=' + config.archivematicaUsername + '&api_key=' + config.archivematicaApiKey;

    request.get({
        url: apiUrl
    }, function (error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        callback(body);
    });
};

/**
 * Constructs path to dip store in DuraCloud
 * @param uuid
 * @param callback
 */
exports.get_dip_path = function (uuid, callback) {

    'use strict';

    var apiUrl = config.archivematicaStorageApi + 'v2/file/' + uuid + '/?username=' + config.archivematicaStorageUsername + '&api_key=' + config.archivematicaStorageApiKey;

    request.get({
        url: apiUrl
    }, function (error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        var json = JSON.parse(body);
        var dipuuidArr = json.related_packages[0].split('/');
        var uuid = dipuuidArr.filter(function (result) {
            return result;
        });

        var dipuuid = uuid[uuid.length - 1],
            tmp = dipuuid.replace(/-/g, ''),
            tmpuuid = tmp.match(/.{1,4}/g),
            path = tmpuuid.join('/');

        var folderArr = json.current_path.split('/'),
            folderTmp = folderArr[folderArr.length - 1],
            folder = folderTmp.replace('.7z', ''),
            dipPath = path + '/' + folder;

        callback(dipPath);
    });
};