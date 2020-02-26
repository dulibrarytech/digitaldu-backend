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
 * Gets thumbnail from TN service
 * @param tn
 * @param callback
 */
exports.get_tn = function (uuid, type, callback) {

    'use strict';

    let apiUrl = CONFIG.tnService + 'discovery/datastream/' + uuid + '/tn?key=' + CONFIG.tnServiceApiKey;

    REQUEST.get({
        url: apiUrl,
        encoding: null,
        timeout: 45000,
        headers: {
            'x-api-key': CONFIG.tnServiceApiKey
        }
    }, function (error, httpResponse, body) {

        let missing_tn = '/images/image-tn.png';

        if (error) {

            LOGGER.module().error('ERROR: [/libs/tn-service lib (get_tn)] Unable to get thumbnail from TN service' + error);

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

            LOGGER.module().error('ERROR: [/libs/tn-service lib (get_tn)] Unable to get thumbnail from TN service ' + httpResponse.statusCode + '/' + body);

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });

            return false;
        }
    });
};