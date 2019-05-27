/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

const config = require('../config/config'),
    logger = require('../libs/log4'),
    fs = require('fs'),
    request = require('request');


exports.ping = function (callback) {

    'use strict';

    let apiUrl = 'https://' + config.duraCloudApi;

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to ping duracloud ' + error);

            callback({
                error: true,
                status: 'down',
                message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                status: 'up',
                message: 'Duracloud service is available'
            });

            return false;

        } else {

            logger.module().error('ERROR: Unable to ping duracloud ' + body);

            callback({
                error: true,
                status: 'down',
                message: error
            });

            return false;
        }
    });
};

/**
 * Gets METS file
 * @param data
 * @param callback
 */
exports.get_mets = function (data, callback) {

    'use strict';

    let mets = 'METS.' + data.sip_uuid + '.xml',
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/' + data.dip_path + '/' + mets;

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
exports.get_object_info = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path;

    // change extension from tif to jp2 (There are no direct references to jp2 files in Duracloud)
    if (data.file.indexOf('tif') !== -1) {
        data.file = data.file.replace('tif', 'jp2');
    }

    if (data.file.indexOf('wav') !== -1) {
        data.file = data.file.replace('wav', 'mp3');
    }

    let apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

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
 * Get entry id (kaltura)
 * @param data
 * @param callback
 */
exports.get_entry_id = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-kalturaid.txt';

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get duracloud kalturaid object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            callback(body);
            return false;

        } else {

            logger.module().error('ERROR: Unable to get duracloud kalturaid object ' + body);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};

/**
 * Used for archivespace uri.txt retrieval
 * @param data
 * @param callback
 */
exports.get_uri = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

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

            callback(body);
            return false;

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

/**
 * Gets manifest for chunked files
 * @param data
 * @param callback
 */
exports.get_object_manifest = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file  + '.dura-manifest';

    request.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: Unable to get duracloud video manifest ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            callback(body);
            return false;

        } else {

            logger.module().error('ERROR: Unable to get manifest ' + body);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};