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
    }, function(error, httpResponse, body){

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
        }, function(error, httpResponse, body) {

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
    }, function(error, httpResponse, body){

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
    }, function(error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        callback(body);
    });
};

exports.start_reingest = function () {

    'use strict';

    /* TODO:...
     URL: /api/transfer/reingest
     Verb: POST
     Start a full reingest.
     Parameters: JSON body
     name: Name of the AIP. The AIP should also be found at %sharedDirectory%/tmp/<name>
     uuid: UUID of the AIP to reingest
     Response: JSON
     message: "Approval successful."
     reingest_uuid: UUID of the reingested transfer
     */
};

exports.create_folder = function (folder, callback) {

    'use strict';
    // TODO:...

    var sftp = new client();

    sftp.connect({

        host: config.sftpHost,
        port: '22',
        username: config.sftpId,
        password: config.sftpPwd

    }).then(function () {
        sftp.mkdir(config.sftpRemotePath + '/' + folder, true);
        callback('done');
    }).catch(function (err) {
        console.log(err, 'catch error');
    });
};