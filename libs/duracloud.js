var config = require('../config/config'),
    fs = require('fs'),
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
        pid = data.is_member_of_collection.replace(/:/g, '_');

    // TODO: ... change extension from tif to jp2 (There are no direct references to jp2 files)
    if (data.file.indexOf('tif') !== -1) {  //  || data.file.indexOf('tiff')
        data.file = data.file.replace('tif', 'jp2');
    }

    var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dcPath + '/' + pid + '_transfer-' + data.sip_uuid + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        var resp = {};
        resp.headers = httpResponse.headers;
        resp.file = data.file;

        // save file to disk (temporarily)
        fs.writeFile('./tmp/' + data.file, body, function(error) {

            if (error) {
                throw error;
            }

            if (fs.existsSync('./tmp/' + data.file)) {
                console.log('File ' + data.file + ' saved.');
                callback(resp);
                return false;
            }

        });
    });
};

// TODO:...
exports.get_xml = function (data, callback) {

    'use strict';

    var tmp = data.transfer_uuid.replace(/-/g, ''),
        tmpUuid = tmp.match(/.{1,4}/g),
        dcPath = tmpUuid.join('/'),
        pid = data.is_member_of_collection.replace(/:/g, '_');

    // TODO: ... change extension to .xml
    if (data.file.indexOf('tif') !== -1) {  //  || data.file.indexOf('tiff')
        data.file = data.file.replace('tif', 'jp2');
    }

    var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dcPath + '/' + pid + '_transfer-' + data.sip_uuid + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        var resp = {};
        resp.headers = httpResponse.headers;
        resp.file = data.file;

        // save file to disk (temporarily)
        fs.writeFile('./tmp/' + data.file, body, function(error) {

            if (error) {
                throw error;
            }

            if (fs.existsSync('./tmp/' + data.file)) {
                console.log('File ' + data.file + ' saved.');
                callback(resp);
                return false;
            }

        });
    });
};