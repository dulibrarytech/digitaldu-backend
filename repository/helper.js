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
            endpoint: '/api/admin/v1/indexer/reindex',
            data: data
        });

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/helper module (reindex)] reindex failed.');
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

    (async () => {

        let response;
        let result = {};
        let data = {
            'uuid': uuid
        };

        response = await HTTP.post({
            endpoint: '/api/admin/v1/indexer',
            data: data
        });

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
            endpoint: '/api/admin/v1/indexer',
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

/** TODO: REMOVE
 * Updates display record after publish status changed
 * @param uuid
 * @param callback

function update_record_publish_status(uuid, callback) {

    let pid;
    let is_published;

    if (obj.sip_uuid !== undefined) {
        pid = obj.sip_uuid // publish
        is_published = 1;
    } else if (obj.pid !== undefined) {
        pid = obj.pid;  // unpublish
        is_published = 0;
    }

    (async () => {

        let response = await HTTP.get({
            endpoint: '/api/admin/v1/repo/object',
            params: {
                uuid: uuid
            }
        });

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (update_display_record)] unable to get display record.');
        } else if (response.error === false) {

            let display_record = JSON.parse(response.data[0].display_record);
            display_record.is_published = is_published;

            // TODO: use display record lib instead
            DB(REPO_OBJECTS)
                .where({
                    pid: pid,
                    is_active: 1
                })
                .update({
                    display_record: JSON.stringify(display_record)
                })
                .then(function () {
                })
                .catch(function (error) {
                    LOGGER.module().error('ERROR: [/repository/model module (update_display_record)] unable to update display record. ' + error);
                });
        }

        callback(null, obj);

    })();
}
 */