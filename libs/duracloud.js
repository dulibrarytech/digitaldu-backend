const config = require('../config/config'),
    logger = require('../libs/log4'),
    fs = require('fs'),
    request = require('request');

/**
 * Gets METS file
 * @param data
 * @param callback
 */
exports.get_mets = function (data, callback) {

    'use strict';

    let mets = 'METS.' + data.sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + data.dip_path + '/' + mets;

    request.get({
        url: apiUrl
    }, function (error, httpResponse, body) {

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

/**
 * Gets objects/header info
 * @param data
 * @param callback
 * @returns {boolean}
 */
exports.get_object = function (data, callback) {

    'use strict';

    if (data.file === 'uri.txt') {

        get_uri(data, function (result) {
            callback(result);
        });

        return false;
    }

    let dip_path = data.dip_path;

    // change extension from tif to jp2 (There are no direct references to jp2 files in Duracloud)
    if (data.file.indexOf('tif') !== -1) {
        data.file = data.file.replace('tif', 'jp2');
    }

    if (data.file.indexOf('wav') !== -1) {
        data.file = data.file.replace('wav', 'mp3');
    }

    let apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/objects/' + data.uuid + '-' + data.file;

    request.head({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get duracloud object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            let resp = {};
            resp.headers = httpResponse.headers;
            resp.file = data.file;
            callback(resp);
            return false;

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

/**
 *
 * @param data
 * @param callback
 */
const get_uri = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + dip_path + '/objects/' + data.uuid + '-' + data.file;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get duracloud uri object ' + error);

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

            let resp = {};
            resp.headers = httpResponse.headers;
            resp.file = data.file;

            // TODO: create tmp folder if it doesn't exist
            // save file to disk (temporarily)
            fs.writeFile('./tmp/' + data.file, body, function (error) {

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

            logger.module().error('ERROR: Unable to get duracloud uri object ' + body);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};