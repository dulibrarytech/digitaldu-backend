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

const ASYNC = require('async'),
    LOGGER = require('../libs/log4'),
    DB = require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects',
    VALIDATOR = require('validator');

// http://localhost:8000/api/v1/uuids?start=2019-08-20&end=2019-09-18
// http://localhost:8000/api/v1/uuids?uri=/repositories/2/archival_objects/112120

/**
 * Gets repository uuids, uris and handles
 * @param req (start end) (uri)
 * @param callback
 */
exports.get_uuids = function (req, callback) {

    let start = req.query.start,
        end = req.query.end,
        uri = req.query.uri,
        sql = 'DATE(created) = CURRENT_DATE';

    if (start !== undefined && Array.isArray(start)) {
        start = start.pop();
    }

    if (end !== undefined && Array.isArray(end)) {
        end = end.pop();
    }

    if (uri !== undefined && Array.isArray(uri)) {
        uri = uri.pop();
    }

    if (uri !== undefined) {
        uri = VALIDATOR.unescape(uri);
    }

    function get_collection_uuids(callback) {

        if (start !== undefined && end !== undefined) {

            //--- gets records between start and end date ---//

            sql = '(created BETWEEN ? AND ?)';

            DB(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection',
                    is_active: 1
                })
                .andWhereRaw(sql, [start, end])
                .orderBy('created', 'desc')
                .then(function (data) {

                    if (data.length === 0) {
                        data.status = false;
                    }

                    callback(null, data);
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);
                    return false;
                });

        } else if (start !== undefined && end === undefined) {

            //--- gets records by start date, pulls record from single day ---//

            sql = 'DATE(created) = ?';

            DB(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection',
                    is_active: 1
                })
                .andWhereRaw(sql, [start])
                .orderBy('created', 'desc')
                .then(function (data) {

                    if (data.length === 0) {
                        data.status = false;
                    }

                    callback(null, data);
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);
                    return false;
                });

        } else {

            //--- gets records by current date ---//

            DB(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection',
                    is_active: 1
                })
                .andWhereRaw(sql)
                .orderBy('created', 'desc')
                .then(function (data) {

                    if (data.length === 0) {
                        data.status = false;
                    }

                    callback(null, data);
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);
                    return false;
                });
        }
    }

    // gets collection child objects
    function get_object_uuids(data, callback) {

        //--- if collection has no child objects ---//
        if (data.status !== undefined && data.status === false) {
            callback(null, data);
            return false;
        }

        let records = [];
        let timer = setInterval(function () {

            let record = data.pop(),
                params = {};

            if (record === undefined) {
                return false;
            }

            params.object_type = 'object';

            if (data.length === 0) {
                params.is_member_of_collection = 0;
            } else {
                params.is_member_of_collection = record.sip_uuid;
            }

            DB(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where(params)
                .then(function (objects) {

                    if (data.length > 0) {
                        record.objects = objects;
                        records.push(record);
                    } else if (data.length === 0) {
                        clearInterval(timer);
                        callback(null, records);
                        return false;
                    }

                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error);
                    return false;
                });

        }, 10);
    }

    //--- return single object based on Archivespace uri ---//
    if (uri !== undefined && uri.length !== 0) {

        DB(REPO_OBJECTS)
            .select('sip_uuid', 'handle', 'uri', 'object_type')
            .where({
                uri: uri,
                is_active: 1
            })
            .then(function (objects) {

                callback({
                    status: 200,
                    data: objects
                });
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error);
                return false;
            });

        return false;
    }

    ASYNC.waterfall([
        get_collection_uuids,
        get_object_uuids
    ], function (error, results) {

        if (error) {

            LOGGER.module().error('ERROR: [/repository/model module (get_pids/async.waterfall)] ' + error);

            callback({
                status: 500,
                error: 'ERROR: [/repository/model module (get_pids/async.waterfall)] ' + error,
                data: []
            });

            return false;
        }

        if (results.status === false) {

            callback({
                status: 200,
                data: []
            });

        } else {

            callback({
                status: 200,
                data: results
            });
        }
    });
};