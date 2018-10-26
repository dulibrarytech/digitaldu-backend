var config = require('../config/config'),
    fs = require('fs'),
    request = require('request');

exports.get_mets = function (data, callback) {

    'use strict';

    // pid = data[0].is_member_of_collection.replace(/:/g, '_'),
    var mets = 'METS.' + data[0].sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + data[0].dip_path + '/' + mets;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

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

    var pid = data.is_member_of_collection.replace(/:/g, '_'),
        dip_path = data.dip_path;

    // TODO: ... change extension from tif to jp2 (There are no direct references to jp2 files)
    if (data.file.indexOf('tif') !== -1) {  //  || data.file.indexOf('tiff')
        data.file = data.file.replace('tif', 'jp2');
    }

    // var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/' + pid + '_' + data.file_id + '_transfer-' + data.sip_uuid + '/objects/' + data.uuid + '-' + data.file;
    var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {
            console.log(error);
        }

        var resp = {};
        resp.headers = httpResponse.headers;
        resp.file = data.file;

        // TODO: create tmp folder if it doesn't exist
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