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

const VALIDATOR = require('validator'),
    DB = require('../config/db')(),
    DR = require('../libs/display-record'),
    LOGGER = require('../libs/log4'),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Checks if collection exists
 * @param req
 * @param callback
 */
exports.check_collection = function(req, callback) {

    let uri = VALIDATOR.unescape(req.query.uri);

    DB(REPO_OBJECTS)
        .select('pid')  // display_record
        .where({
            uri: uri,
            object_type: 'collection',
            is_active: 1
        })
        .then(function (data) {
            // if collection doesn't exist
            if (data.length === 0) {

                callback({
                    status: 200,
                    data: []
                });

            } else {

                DR.get_db_display_record_data(data[0].pid, function(result) {

                    callback({
                        status: 200,
                        data: result[0].display_record
                    });
                });
            }

        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/qa/model module (check_collection)] Unable to check collection ' + error);
            throw 'FATAL: [/qa/model module (check_collection)] Unable to check collection ' + error;
        });
};