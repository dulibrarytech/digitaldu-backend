var config = require('../config/config'),
    client = require('ssh2-sftp-client'),
    request = require('request');

exports.create_folder = function (folder, callback) {

    'use strict';

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

exports.list = function (folder, callback) {

    'use strict';

    var sftp = new client();

    sftp.connect({

        host: config.sftpHost,
        port: '22',
        username: config.sftpId,
        password: config.sftpPwd

    }).then(function () {
        return sftp.list(config.sftpRemotePath + '/' + folder);
    }).then(function (data) {
        console.log(data, 'the data info');
        callback(data);
    }).catch(function (err) {
        console.log(err, 'catch error');
    });
};

exports.upload = function (callback) {

    'use strict';

    // TODO: pass in an array of files or upload each individual file
    var sftp = new client();

    sftp.connect({
        host: config.sftpHost,
        port: '22',
        username: config.sftpId,
        password: config.sftpPwd
    }).then(function () {
        // TODO: confirm that folder exists
        // console.log(config.importPath + codu);
        return sftp.put(config.importPath + codu + '/CSUbice.xml', config.sftpRemotePath + '/CSUbice.xml');
    }).then(function (data) {
        console.log(data, 'the data info');
        callback(data);
    }).catch(function (err) {
        console.log(err, 'catch error');
    });
};

exports.start_tranfser = function () {

    'use strict';

    /*
    URL: /api/transfer/start_transfer/
    Verb: POST
    Start a transfer.
        Parameters: JSON body
    name: Name of new transfer
    type: Type of the new transfer. One of: standard, unzipped bag, zipped bag, dspace
    accession: Accession number of new transfer
    paths[]: List of base64-encoded "<location_uuid>:<relative_path>" to be copied into the new transfer. Location UUIDs should be associated with this pipeline, and relative path should be relative to the location (TODO confirm relative vs absolute path). E.g. NWJiYWJjMTMtMTIyNy00MWE3LWIwY2QtZjJhYzM1MjkxZTdmOi92YWdyYW50L3NhbXBsZWRhdGEvQ1NWbWV0YWRhdGE= (decoded: 5bbabc13-1227-41a7-b0cd-f2ac35291e7f:/vagrant/sampledata/CSVmetadata)
    row_ids[]: ID of the associated TransferMetadataSet for disk image ingest. Can be provided as [""]
    Response: JSON
    message: "Copy successful."
    path: Path the transfer was copied to on start?
    */

};

exports.start_reingest = function () {

    'use strict';

    /*
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

exports.get_status = function () {

    'use strict';

    /*
    URL: /ingest/status/<unit UUID>/
    Verb: GET
    Returns the status of the SIP
    Response: JSON
    status: One of FAILED, REJECTED, USER_INPUT, COMPLETE or PROCESSING
    name: Name of the SIP, e.g. "imgs"
    microservice: Name of the current microservice
    directory: Name of the directory, e.g. "imgs-52dd0c01-e803-423a-be5f-b592b5d5d61c"
    path: Full path to the transfer, e.g. "/var/archivematica/sharedDirectory/currentlyProcessing/imgs-52dd0c01-e803-423a-be5f-b592b5d5d61c/"
    message: "Fetched status for <SIP UUID> successfully."
    type: "SIP"
    uuid: UUID of the SIP, e.g. "52dd0c01-e803-423a-be5f-b592b5d5d61c"
    */

};