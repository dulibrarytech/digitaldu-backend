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

'use strict';

// const CONFIG = require("../config/config");
const HTTP = require("axios");
const LOGGER = require('../libs/log4');

/** TODO: Deprecate
 * Gets repository images by sip_uuid
 * @param req
 * @param callback
 */
exports.get_images = function (req, callback) {

    if (req.query.filename === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let filename = req.query.filename;

    (async () => {

        try {

            let endpoint = CONFIG.convertService + '/api/v1/image?filename=' + filename + '&api_key=' + CONFIG.convertServiceApiKey;
            let response = await HTTP.get(endpoint, {
                timeout: 60000,
                responseType: 'arraybuffer'
            });

            if (response.status === 200) {
                callback({
                    error: false,
                    status: 200,
                    data: response.data
                });
            }

            return false;

        } catch (error) {
            LOGGER.module().error('ERROR: [/api/service module (get_image)] Unable to get image: ' + error);
        }

    })();
};