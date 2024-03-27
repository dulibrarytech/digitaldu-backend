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
    HTTP = require('axios'),
    TIMEOUT = 35000,
    HEADER = {
        'Content-Type': 'application/json'
    };

/**
 * Pings duracloud service to check availability
 * @param callback
 */
exports.ping = function (callback) {

    'use strict';

    let endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEOUT,
                headers: HEADER
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (ping)] unable to ping duracloud.');

                callback({
                    error: true,
                    status: 'down',
                    message: error
                });

            } else if (response.status === 200) {

                callback({
                    error: false,
                    status: 'up',
                    message: 'Duracloud service is available'
                });

                return false;
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (ping)] unable to ping duracloud ' + error);

            callback({
                error: true,
                status: 'down',
                message: error
            });
        }

        return false;

    })();
};

/**
 * Gets METS file
 * @param data
 * @param callback
 */
exports.get_mets = function (data, callback) {

    'use strict';

    let mets = 'METS.' + data.sip_uuid + '.xml',
        endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + data.dip_path + '/' + mets;

    setTimeout(function() {

        (async () => {

            try {

                let response = await HTTP.get(endpoint, {
                    timeout: TIMEOUT,
                    headers: HEADER
                });

                if (response.status !== 200) {

                    LOGGER.module().error('ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS.');

                    callback({
                        error: true,
                        error_message: 'ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS.'
                    });

                } else if (response.status === 200) {

                    callback({
                        error: false,
                        mets: response.data,
                        sip_uuid: data.sip_uuid
                    });
                }

                return false;

            } catch (error) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS ' + error);

                callback({
                    error: true,
                    error_message: error
                });
            }

        })();

    }, 15000);
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
    let endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

    (async () => {

        try {

            let response = await HTTP.head(endpoint, {
                timeout: TIMEOUT
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object.');

                callback({
                    error: true,
                    error_message: error
                });

            } else if (response.status === 200) {

                let resp = {};
                resp.headers = response.headers;
                resp.file = data.file;
                callback(resp);
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

    })();
};

/**
 * Used for archivespace uri.txt retrieval
 * @param data
 * @param callback
 */
exports.get_uri = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file;

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEOUT,
                headers: HEADER
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object.');

                callback({
                    error: true,
                    error_message: 'ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object.'
                });

            } else if (response.status === 200) {
                callback(response.data);
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

    })();
};

/**
 * Gets manifest for chunked files
 * @param data
 * @param callback
 */
exports.get_object_manifest = function (data, callback) {

    'use strict';

    let dip_path = data.dip_path,
        endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + dip_path + '/objects/' + data.uuid + '-' + data.file  + '.dura-manifest';

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEOUT,
                headers: HEADER
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_manifest)] Unable to get duracloud manifest.');

                callback({
                    error: true,
                    error_message: 'ERROR: [/libs/duracloud lib (get_object_manifest)] Unable to get duracloud manifest.'
                });

            } else if (response.status === 200) {
                callback(response.data);
            }

            return false;

        } catch (error) {

            LOGGER.module().warn('WARN: [/libs/duracloud lib (get_object_manifest)] Unable to get duracloud manifest.  Objects under 1GB do not have a manifest. ' + error);

            callback({
                error: true,
                error_message: error
            });
        }

    })();
};

/**
 * Gets thumbnail and renders it for client to consume
 * @param tn
 * @param callback
 */
exports.get_thumbnail = function (tn, callback) {

    'use strict';

    let endpoint = 'https://' + CONFIG.duraCloudUser + ':' + CONFIG.duraCloudPwd + '@' + CONFIG.duraCloudApi + 'dip-store/' + tn,
        missing_tn = '/images/image-tn.png';

    (async () => {

        try {

            let response = await HTTP.get(endpoint, {
                timeout: TIMEOUT,
                responseType: 'arraybuffer'
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail.');

                callback({
                    error: true,
                    status: 200,
                    data: missing_tn
                });

            } else if (response.status === 200) {
                callback(response.data);
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail ' + error);

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });
        }

    })();
};

/**
 * Sends object data to convert service
 * @param data
 */
exports.convert_service = function(data) {

    let service = CONFIG.convertService;
    let service_api_key = CONFIG.convertServiceApiKey;
    let endpoint;

    if (data.mime_type === 'image/tiff') {
        endpoint = '/api/v1/convert/tiff';
    }

    if (endpoint === undefined) {
        LOGGER.module().info('INFO: [/duracloud/lib (convert_service)] Conversion not required.');
        return false;
    }

    let url = service + endpoint + '?api_key=' + service_api_key;

    (async () => {

        try {

            let response = await HTTP.post(url, data, {
                timeout: '60000',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 201) {

                LOGGER.module().error('ERROR: [/libs/duracloud lib (convert_service)] unable to convert file.');

            } else if (response.status === 201) {
                LOGGER.module().info('INFO: [/duracloud/lib (convert_service)] ' + response.data.data);
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/duracloud/lib (convert_service)] convert failed. Request failed: ' + error);

            return {
                error: true,
                message: 'ERROR: [/duracloud/lib (convert_service)] convert failed. Request failed: ' + error
            };
        }

    })();
};