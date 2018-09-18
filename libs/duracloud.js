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