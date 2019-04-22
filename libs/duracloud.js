const config = require('../config/config'),
    logger = require('../libs/log4'),
    fs = require('fs'),
    request = require('request');

exports.get_mets = function (data, callback) {

    'use strict';

    let mets = 'METS.' + data.sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + data.dip_path + '/' + mets;

    request.get({
        url: apiUrl
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get METS ' + error);

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode !== 200) {

            logger.module().error('ERROR: Unable to get METS: status code: ' + httpResponse.statusCode);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }

        callback({
            error: false,
            mets: body,
            sip_uuid: data.sip_uuid
        });
    });
};

exports.get_object = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path;

    // change extension from tif to jp2 (There are no direct references to jp2 files in Duracloud)
    if (data.file.indexOf('tif') !== -1) {
        data.file = data.file.replace('tif', 'jp2');
    }

    if (data.file.indexOf('wav') !== -1) {
        data.file = data.file.replace('wav', 'mp3');
    }

    let apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl,
        timeout: 60000
    }, function(error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get duracloud object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            if (data.file === 'uri.txt') {
                callback(body);
                return false;
            }

            var resp = {};
            resp.headers = httpResponse.headers;
            resp.file = data.file;

            // TODO: create tmp folder if it doesn't exist
            // save file to disk (temporarily)
            fs.writeFile('./tmp/' + data.file, body, function(error) {

                if (error) {

                    logger.module().error('ERROR: Unable to write to tmp folder ' + error);

                    callback({
                        error: true,
                        error_message: error
                    });
                }

                if (fs.existsSync('./tmp/' + data.file)) {
                    callback(resp);
                    return false;
                }

            });

        } else {

            logger.module().error('ERROR: Unable to get duracloud object ' + body);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};