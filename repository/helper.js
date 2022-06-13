/**

 Copyright 2022 University of Denver

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

const HTTP = require('../libs/http'),
    ENDPOINTS = require('../indexer/endpoints'),
    LOGGER = require('../libs/log4');

/**
 * Moves records from admin to public index (publishes record)
 * @param match_phrase
 * @param callback
 */
exports.publish_record = (match_phrase, callback) => {

    (async () => {

        let query = {};
        let bool = {};
        let data;
        let response;
        let result = {};

        bool.must = {};
        bool.must.match_phrase = match_phrase;
        query.bool = bool;

        data = {
            'query': query
        };

        response = await HTTP.post({
            endpoint: ENDPOINTS().indexer.indexer_publish_records,
            data: data
        });

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/helper module (publish (reindex))] publish failed.');
            result.error = true;
        } else if (response.data.status === 201) {
            result.error = false;
        }

        callback(result);

    })();
};

/**
 * Indexes record
 * @param uuid
 * @param callback
 */
exports.index = (uuid, callback) => {
    console.log('UUID helper index: ', uuid);
    (async () => {

        let response;
        let result = {};
        let data = {
            'uuid': uuid
        };

        response = await HTTP.post({
            endpoint: ENDPOINTS().indexer.indexer_index_records,
            data: data
        });
        console.log('INDEX RESPONSE: ', response);
        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/helper (index)] index failed.');
            result.error = true;
        } else if (response.data.status === 201) {
            result.error = false;
        }

        callback(result);

    })();
};

/**
 * Removes record from index
 * @param uuid
 * @param callback
 */
exports.del = (uuid, callback) => {

    (async () => {

        let response = await HTTP.delete({
            endpoint: ENDPOINTS().indexer.indexer_index_records,
            params: {
                uuid: uuid
            }
        });

        let result = {};

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (del)] unable to remove published record from index.');
            result.error = true;
        } else if (response.data.status === 204) {
            result.error = false;
        }

        callback(result);

    })();
};
