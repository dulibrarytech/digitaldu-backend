/**

 Copyright 2021 University of Denver

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
    DB = require('../config/db')(),
    LOGGER = require('../libs/log4'),
    HTTP = require('axios'),
    REPO_OBJECTS = 'tbl_objects',
    TIMEMOUT = 35000;

/**
 * Gets transcript during ingest process
 * @param obj
 * @param callback
 */
exports.get = function (obj, callback) {

    let mods = JSON.parse(obj.mods);
    let call_number = mods.identifiers.map(function (node) {

        if (node.type === 'local') {
            return node.identifier;
        }
    });

    (async () => {

        try {

            let endpoint = CONFIG.transcriptService + '/api/v1/transcript?call_number=' + call_number + '&api_key=' + CONFIG.transcriptServiceApiKey;
            let response = await HTTP.get(endpoint, {
                timeout: TIMEMOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                let transcript_search = response.data.transcript_search;  // for search - save to index
                let transcript_obj = {};

                transcript_obj.transcripts = response.data.transcripts;  // display and edits - save to DB
                transcript_obj.transcript_search = transcript_search;

                setTimeout(function() {
                    flag(obj.sip_uuid);
                }, 5000);

                callback(transcript_obj);
            } else {
                LOGGER.module().info('INFO: [/libs/transcript lib (get)] No transcript found for this record.');
                callback('no_transcript');
            }

        } catch (error) {
            LOGGER.module().info('INFO: [/libs/transcript lib (get)] No transcript found for this record. ' + error);
            callback('no_transcript');
        }

    })();
};

/**
 * Flag transcript record during ingest process
 * @param sip_uuid
 */
const flag = function (sip_uuid) {

    DB(REPO_OBJECTS)
        .where({
            sip_uuid: sip_uuid
        })
        .update({
            has_transcript: 1
        })
        .then(function (data) {})
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transcript lib (flag)] unable to flag transcript record ' + error);
            throw 'FATAL: [/libs/transcript lib (flag)] unable to flag transcript record ' + error;
        });
};

/**
 * Loads transcripts from transcript service
 */
exports.load = function () {

    // TODO: get all transcripts from service
    // 1.) gets array of folder names containing call numbers
    // 2.) Loop through call numbers (folder names)

    /*
    let mods = JSON.parse(obj.mods);
    let call_number = mods.identifiers.map(function (node) {

        if (node.type === 'local') {
            return node.identifier;
        }
    });

     */

    (async () => {

        let endpoint = CONFIG.transcriptService + '/api/v1/transcript?call_number=' + call_number + '&api_key=' + CONFIG.transcriptServiceApiKey;
        let response = await HTTP.get(endpoint, {
            timeout: TIMEMOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            save(obj.sip_uuid, response.data.transcript);
            callback(response.data.transcript);
        } else {
            LOGGER.module().info('INFO: [/libs/transcript lib (get)] No transcript found for this record.');
            callback('no_transcript');
        }

    })();
};
