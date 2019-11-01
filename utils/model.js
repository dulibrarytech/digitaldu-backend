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

const config = require('../config/config'),
    fs = require('fs'),
    request = require('request'),
    async = require('async'),
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    duracloud = require('../libs/duracloud'),
    logger = require('../libs/log4'),
    knex = require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects';


/**
 *
 * @param req
 * @param callback
 */
exports.check_objects = function (req, callback) {

    let apiUrl = 'https://' + config.duraCloudUser + ':' + config.duraCloudPwd + '@' + config.duraCloudApi + 'dip-store/';

    knex(REPO_OBJECTS)
        .select('sip_uuid', 'object_type', 'thumbnail', 'file_name', 'file_size', 'mime_type', 'is_compound', 'created')
        .where({
            object_type: 'object',
            mime_type: 'image/tiff',
            is_active: 1
        })
        .then(function (data) {

            // TODO: get record count
            // TODO: check thumbnail
            // TODO: check master

            let timer = setInterval(function () {

                if (data.length === 0) {
                    console.log('done');
                    clearInterval(timer);
                }

                let record = data.pop();

                console.log(apiUrl + record.file_name);

                if (record.file_name === null) {
                    console.log('sip_uuid: ', record.sip_uuid);
                    console.log('no file name');
                    return false;
                }

                request.head({
                    url: apiUrl + record.file_name,
                    timeout: 25000
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + error);
                    }

                    if (httpResponse.statusCode === 200) {

                        console.log('sip_uuid: ', record.sip_uuid);
                        console.log('record exists');
                        console.log('--------------------------');
                        return false;

                    } else {

                        logger.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + 'sip_uuid: ' + record.sip_uuid + '--- (' + record.file_size + ') ' + httpResponse.statusCode + '/' + body);
                        console.log('--------------------------');
                        return false;
                    }
                });

            }, 500);

            callback({
                status: 200,
                message: 'Checking objects.',
                data: data
            });

        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
            throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
        });
};