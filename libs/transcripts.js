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

const CONFIG = require('../config/config'),
    LOGGER = require('../libs/log4'),
    HTTP = require('axios'),
    TIMEMOUT = 35000;

/**
 * Gets transcript
 * @param data
 */
exports.get = function (data, callback) {

    let mods = JSON.parse(data);
    let call_number = mods.identifiers.map(function (obj) {

        if (obj.type === 'local') {
            return obj.identifier;
        }
    });

    (async () => {

        let endpoint = CONFIG.transcriptService + '/api/v1/transcript?call_number=' + call_number + '&api_key=' + CONFIG.transcriptServiceApiKey;
        let response = await HTTP.get(endpoint, {
            timeout: TIMEMOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            callback(response.data.transcript);
        } else {
            LOGGER.module().error('ERROR: [/libs/transcript lib (get)] Unable to get transcript.');
            callback('error');
        }

    })();
};