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
    DB = require('../config/db')(),
    LOGGER = require('../libs/log4'),
    REPO_OBJECTS = 'tbl_objects';
const HTTP = require("../libs/http");

/**
 *
 * @param call_number
 */
exports.get = function (sip_uuid) {

    // TODO: async/await

    DB(REPO_OBJECTS)
        .select('mods')
        .where({
            sip_uuid: sip_uuid,
        })
        .then(function (data) {

            console.log(data);

        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transcript lib (get)] Unable to get mods record ' + error);
            return false;
        });

    /*
        (async () => {

            let params = {
                transcript: 'callNumber'
            };

            let response = await HTTP.get({
                endpoint: '/api/v1/transcript',
                params: params
            });

            if (response.error === true) {
                // TODO: Update record here
                // LOGGER.module().fatal('FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/TRANSFER_INGEST.save_mets_data)] create repo record request error.');
                // throw 'FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/TRANSFER_INGEST.save_mets_data)] create repo record request error.';
            } else if (response.data.status === 200) {
                callback(null, obj);
            }

        })();

         */

    /*
    "identifiers": [
        {
            "type": "local",
            "identifier": "B002.01.0098.0002.00020"
        }
    ],

     */

};