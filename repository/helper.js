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
 * Moves records from admin to public index
 * @param match_phrase
 * @param callback
 */
exports.reindex = function (match_phrase, callback) {

    (async () => {

        let query = {};
        let bool = {};

        bool.must = {};
        bool.must.match_phrase = match_phrase;
        query.bool = bool;

        let data = {
            'query': query
        };

        let response = await HTTP.post({
            endpoint: '/api/admin/v1/indexer/reindex',
            data: data
        });

        let result = {};

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (reindex)] reindex failed.');
            result.error = true;
        } else if (response.data.status === 201) {
            result.error = false;
        }

        callback(result);

    })();
};

/**
 * Updates published status
 * @param sip_uuid
 * @param is_published
 * @param callback
 */
exports.update_fragment = function (sip_uuid, is_published, callback) {

    (async () => {

        let data = {
            'sip_uuid': sip_uuid,
            'fragment': {
                doc: {
                    is_published: is_published
                }
            }
        };

        let response = await HTTP.put({
            endpoint: '/api/admin/v1/indexer/update_fragment',
            data: data
        });

        let result = {};

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (update_fragment)] unable to update published status.');
            result.error = true;
        } else if (response.data.status === 201) {
            result.error = false;
        }

        callback(result);

    })();
};

/**
 * Indexes record
 * @param sip_uuid
 * @param callback
 */
exports.index = function (sip_uuid, callback) {

    (async () => {

        let data = {
            'sip_uuid': sip_uuid
        };

        let response = await HTTP.post({
            endpoint: '/api/admin/v1/indexer',
            data: data
        });

        let result = {};

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (index)] index failed.');
            result.error = true;
        } else if (response.data.status === 201) {
            result.error = false;
        }

        callback(result);

    })();
};

/**
 * Removes record from index
 * @param sip_uuid
 * @param callback
 */
exports.del = function (sip_uuid, callback) {

    (async () => {

        let response = await HTTP.delete({
            endpoint: '/api/admin/v1/indexer',
            params: {
                pid: sip_uuid
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

/** TODO: rename function - does it belong here?
 * Updates display record after publish status changed
 * @param obj
 * @param callback
 */
function update_display_record(obj, callback) {

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
                pid: pid
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

/**
 * Removes record from admin and public indexes - part of record delete process
 * @param sip_uuid
 * @param callback
 */
const unindex = function (sip_uuid, callback) {

    (async () => {

        let response = await HTTP.delete({
            endpoint: '/api/admin/v1/indexer/delete',
            params: {
                pid: sip_uuid
            }
        });

        let result = {};

        if (response.error === true) {
            LOGGER.module().error('ERROR: [/repository/model module (unindex)] unable to remove record from index.');
            result.error = true;
        } else if (response.data.status === 204) {
            result.error = false;
        }

        callback(result);

    })();
};
