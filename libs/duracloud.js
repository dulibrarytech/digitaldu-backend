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

const CONFIG = require('../config/config'),
    LOGGER = require('../libs/log4'),
    REQUEST = require('request');

/**
 * Pings duracloud service to check availability
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    let apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi;

    REQUEST.get({
        url: apiUrl,
        timeout: 25000
    }, function (error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (ping)] unable to ping duracloud ' + error);

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

            LOGGER.module().error('ERROR: [/libs/duracloud lib (ping)] Unable to ping duracloud ' + httpResponse.statusCode + '/' + body);

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
        apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + data.dip_path + '/' + mets;

    REQUEST.get({
        url: apiUrl
    }, function (error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS ' + error);

            callback({
                error: true,
                error_message: error
            });

            return false;
        }

        if (httpResponse.statusCode !== 200) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS: status code: ' + httpResponse.statusCode + '/' + body);

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

    let apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

    REQUEST.head({
        url: apiUrl,
        timeout: 45000
    }, function (error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + error);

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

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + httpResponse.statusCode + '/' + body);

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
        apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

    REQUEST.get({
        url: apiUrl,
        timeout: 45000
    }, function (error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            callback(body);
            return false;

        } else {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object ' + httpResponse.statusCode + '/' + body);

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
        apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file  + '.dura-manifest';

    REQUEST.get({
        url: apiUrl,
        timeout: 45000
    }, function (error, httpResponse, body) {

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_manifest)] Unable to get duracloud video manifest ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

        if (httpResponse.statusCode === 200) {

            callback(body);
            return false;

        } else {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_manifest)] Unable to get manifest ' + body);

            callback({
                error: true,
                error_message: body
            });

            return false;
        }
    });
};

/**
 * Gets thumbnail and renders it for client to consume
 * @param tn
 * @param callback
 */
exports.get_thumbnail = function (tn, callback) {

    'use strict';

    let apiUrl = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + tn;

    REQUEST.get({
        url: apiUrl,
        encoding: null,
        timeout: 45000
    }, function (error, httpResponse, body) {

        let missing_tn = '/images/image-tn.png';

        if (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail ' + error);

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            callback({
                error: false,
                status: 200,
                data: body
            });

            return false;

        } else {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });

            return false;
        }
    });
};