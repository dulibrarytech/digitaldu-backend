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
    request = require('request');

/**
 * Gets thumbnail from TN service
 * @param tn
 * @param callback
 */
exports.get_tn = function (uuid, type, callback) {

    'use strict';

    let apiUrl = config.tnService + 'discovery/datastream/' + uuid + '/tn';

    // TODO: check type when file is not available to determine which replacement image to render

    request.get({
        url: apiUrl,
        encoding: null,
        timeout: 45000,
        headers: {
            'x-api-key': config.tnServiceApiKey
        }
    }, function (error, httpResponse, body) {

        let missing_tn = '/images/image-tn.png';

        if (error) {

            logger.module().error('ERROR: [/libs/tn-service lib (get_tn)] Unable to get thumbnail from TN service' + error);

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

            logger.module().error('ERROR: [/libs/tn-service lib (get_tn)] Unable to get thumbnail from TN service ' + httpResponse.statusCode + '/' + body);

            // TODO: check audio, video image mime types
            if (type) {
                //...
            }

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });

            return false;
        }
    });
};

/** NOT USED
 * Gets viewer
 * @param uuid
 * @param callback
 */
exports.get_viewer = function (uuid, callback) {

    'use strict';

    let apiUrl = config.tnService + 'discovery/viewer/' + uuid;

    request.get({
        url: apiUrl,
        encoding: null,
        timeout: 45000,
        headers: {
            'x-api-key': config.tnServiceApiKey
        }
    }, function (error, httpResponse, body) {

        if (error) {

            logger.module().error('ERROR: [/libs/object-service lib (get_tn)] Unable to get viewer ' + error);

            callback({
                error: true,
                status: 200,
                data:''
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

            logger.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                status: 404,
                data: body
            });

            return false;
        }
    });
};