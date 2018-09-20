var config = require('../config/config'),
    request = require('request');

exports.get_mets = function (data, callback) {

    'use strict';

    var tmp = data[0].transfer_uuid.replace(/-/g, ''),
        tmpUuid = tmp.match(/.{1,4}/g),
        dcPath = tmpUuid.join('/'),
        pid = data[0].is_member_of_collection.replace(/:/g, '_'),
        mets = 'METS.' + data[0].sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dcPath + '/' + pid + '_transfer-' + data[0].sip_uuid + '/' + mets;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body){

        if (error) {
            console.log(error);
        }

        callback({
            mets: body,
            sip_uuid: data[0].sip_uuid
        });
    });
};

exports.get_object = function (data, callback) {

    'use strict';

    var tmp = data.transfer_uuid.replace(/-/g, ''),
        tmpUuid = tmp.match(/.{1,4}/g),
        dcPath = tmpUuid.join('/'),
        pid = data.is_member_of_collection.replace(/:/g, '_')

    // TODO: ...
    if (data.file.indexOf('tif') !== -1) {  //  || data.file.indexOf('tiff')
        data.file = data.file.replace('tif', 'jp2');
    }

    var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dcPath + '/' + pid + '_transfer-' + data.sip_uuid + '/objects/' + data.uuid + '-' + data.file;
    console.log(apiUrl);

    // TODO: construct thumbnail references

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body){

        if (error) {
            console.log(error);
        }

        console.log(httpResponse.headers);
        // console.log(body);

        // console.log(httpResponse.headers['content-md5']);
        // console.log(httpResponse.headers['content-length']);
        // console.log(httpResponse.headers['content-type']);

        /* TODO: get mime-type
        var tmp = shell.exec('file --mime-type ' + importPath + file).stdout,
            mimetype = tmp.split(':');
            mimeType = mimetype[1].trim();
        */

        /*
        callback({
            mets: body,
            sip_uuid: data[0].sip_uuid
        });
        */

    });

};