var config = require('../config/config'),
    client = require('ssh2-sftp-client'),
    request = require('request');

/* list the files and folders on the FTP server */
exports.list = function (folder, callback) {

    'use strict';

    var sftp = new client();

    sftp.connect({

        host: config.sftpHost,
        port: '22',
        username: config.sftpId,
        password: config.sftpPwd

    }).then(function () {

        if (folder !== 'null') {
            var path = folder.replace(/,/g, '/');
            return sftp.list(config.sftpRemotePath + '/' + path);
        } else {
            return sftp.list(config.sftpRemotePath);
        }

    }).then(function (data) {
        callback(data);
    }).catch(function (err) {
        console.log(err, 'catch error');
    });
};

// 1.)
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
            console.log(error);
        }

        callback(body);
    });
};

// 2.)
exports.approve_transfer = function (transferFolder, callback) {

    'use strict';

    // the delay ensures that the folder's move has completed before attempting to approve it.
    // TODO: more testing required for large collections
    setTimeout(function () {

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

    }, 2000);
};

// 3.)
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

// 4.)
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

// 5.) Constructs path to dip store in DuraCloud
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
            folderTmp = folderArr[folderArr.length -1],
            folder = folderTmp.replace('.7z', ''),
            dipPath = path + '/' + folder;

        callback(dipPath);
    });
};