var config = require('../config/config'),
    fs = require('fs'),
    request = require('request');

exports.get_mets = function (data, callback) {

    'use strict';

    var mets = 'METS.' + data[0].sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + data[0].dip_path + '/' + mets;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {

            // TODO: log

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode !== 200) {

            // TODO: log

            callback({
                error: true,
                error_message: body
            });

            return false;
        }

        callback({
            error: false,
            mets: body,
            sip_uuid: data[0].sip_uuid
        });
    });
};

exports.get_object = function (data, callback) {

    'use strict';

    var dip_path = data.dip_path;

    // TODO: ... change extension from tif to jp2 (There are no direct references to jp2 files)
    if (data.file.indexOf('tif') !== -1) {  //  || data.file.indexOf('tiff')
        data.file = data.file.replace('tif', 'jp2');
    }

    var apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {

            // TODO: log

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode !== 200) {

            // TODO: log

            callback({
                error: true,
                error_message: body
            });

            return false;
        }

        var resp = {};
        resp.headers = httpResponse.headers;
        resp.file = data.file;

        // TODO: create tmp folder if it doesn't exist
        // save file to disk (temporarily)
        fs.writeFile('./tmp/' + data.file, body, function(error) {

            if (error) {

                // TODO: log
                callback({
                    error: true,
                    error_message: error
                });
            }

            if (fs.existsSync('./tmp/' + data.file)) {
                console.log('File ' + data.file + ' saved.');
                callback(resp);
                return false;
            }

        });
    });
};