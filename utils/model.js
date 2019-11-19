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

/** http://localhost:8000/api/v1/repo/uuids?start=2019-08-20&end=2019-09-18
 * Gets repository uuids, uris and handles by import date(s)
 * @param req
 * @param callback
 */
exports.get_uuids = function (req, callback) {

    let start = req.query.start,
        end = req.query.end,
        uri = req.query.uri,
        sql = 'DATE(created) = CURRENT_DATE';

    function get_collection_uuids(callback) {

        if (start !== undefined && end !== undefined) {

            sql = '(created BETWEEN ? AND ?)';

            knex(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection'
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
                    logger.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);

                    callback({
                        status: 500,
                        error: 'FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error,
                        data: []
                    });
                });

        } else if (start !== undefined && end === undefined) {

            sql = 'DATE(created) = ?';

            knex(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection'
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
                    logger.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);

                    callback({
                        status: 500,
                        error: 'FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error,
                        data: []
                    });
                });

        } else {

            sql = 'DATE(created) = CURRENT_DATE';

            knex(REPO_OBJECTS)
                .select('sip_uuid', 'handle', 'uri', 'object_type')
                .where({
                    object_type: 'collection'
                })
                .andWhereRaw(sql)  // , [start]
                .orderBy('created', 'desc')
                .then(function (data) {

                    if (data.length === 0) {
                        data.status = false;
                    }

                    callback(null, data);
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error);

                    callback({
                        status: 500,
                        error: 'FATAL: [/repository/model module (get_pids/get_collection_pids)] repository database error ' + error,
                        data: []
                    });
                });
        }
    }

    function get_object_uuids(data, callback) {

        if (data.status !== undefined && data.status === false) {
            callback(null, data);
            return false;
        }

        let records = [];
        let timer = setInterval(function () {

            let record = data.pop(),
                params = {};

            if (data.length === 0) {
                params.object_type = 'object';
                params.is_member_of_collection = 0;
            } else {
                params.object_type = 'object';
                params.is_member_of_collection = record.sip_uuid;
            }

            knex(REPO_OBJECTS)
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
                    logger.module().fatal('FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error);

                    callback({
                        status: 500,
                        error: 'FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error,
                        data: []
                    });
                });

        }, 100);
    }

    // return single object based on Archivespace uri
    if (uri !== undefined && uri.length !== 0) {

        knex(REPO_OBJECTS)
            .select('sip_uuid', 'handle', 'uri', 'object_type')
            .where({
                uri: uri
            })
            .then(function (objects) {

                callback({
                    status: 200,
                    data: objects
                });
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error);

                callback({
                    status: 500,
                    error: 'FATAL: [/repository/model module (get_pids/get_object_pids)] repository database error ' + error,
                    data: []
                });
            });

        return false;
    }

    async.waterfall([
        get_collection_uuids,
        get_object_uuids
    ], function (error, results) {

        if (error) {

            logger.module().error('ERROR: [/repository/model module (get_pids/async.waterfall)] ' + error);

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

/**
 * confirms that repository files exist on Archivematica service
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

/**
 * reindexes all repository records
 * @param req
 * @param callback
 */
exports.reindex = function (req, callback) {

    function delete_index (callback) {

        let obj = {};
        obj.delete_indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];

        function del(index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/index/delete',
                form: {
                    'index_name': index_name
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/delete_index)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 200) {
                    logger.module().info('INFO: [/import/utils module (reindex/delete_index/del)] ' + index_name + ' deleted.');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/delete_index/del)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        let timer = setInterval(function () {

            if (obj.delete_indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = obj.delete_indexes.pop();
            del(index);

        }, 500);
    }

    function create_index (obj, callback) {

        if (obj.delete_indexes.length !== 0) {
            obj.delete = false;
            callback(null, obj);
            return false;
        }

        obj.create_indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];

        function create(index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/index/create',
                form: {
                    'index_name': index_name
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/create_index/create)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 200) {
                    logger.module().info('INFO: [/import/utils module (reindex/create_index/create)] ' + index_name + ' created.');
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/create_index/create)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        let timer = setInterval(function () {

            if (obj.create_indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = obj.create_indexes.pop();
            create(index);

        }, 500);
    }

    function index (obj, callback) {

        if (obj.create_indexes.length !== 0) {
            obj.create = false;
            callback(null, obj);
            return false;
        }

        function reindex (index_name) {

            request.post({
                url: config.apiUrl + '/api/admin/v1/indexer/all',
                form: {
                    'index_name': index_name,
                    'reindex': true
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().error('ERROR: [/import/utils module (reindex/index/reindex)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 200) {
                    logger.module().info('INFO: [/import/utils module (reindex/index/reindex)] reindexing ' + index_name + '.');
                    obj.reindexed = true;
                    callback(null, obj);
                    return false;
                } else {
                    logger.module().error('ERROR: [/import/utils module (reindex/index/reindex)] http error ' + httpResponse.statusCode + '/' + body);
                    return false;
                }
            });
        }

        reindex(config.elasticSearchBackIndex);
    }

    function monitor_index_progress (obj, callback) {

        function monitor () {

            knex(REPO_OBJECTS)
                .count('is_indexed as is_indexed_count')
                .where({
                    is_indexed: 0
                })
                .then(function (data) {

                    if (data[0].is_indexed_count < 50) {
                        clearInterval(timer);
                        obj.reindex_complete = true;
                        callback(null, obj);
                        return false;
                    }

                    return null;
                })
                .catch(function (error) {
                    logger.module().fatal('FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error);
                    throw 'FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error;
                });
        }

        var timer = setInterval(function () {
            monitor();
        }, 60000);
    }

    async.waterfall([
        delete_index,
        create_index,
        index,
        monitor_index_progress
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] ' + error);
        }

        if (results.reindexed !== undefined) {
            logger.module().info('INFO: [/utils/model module (reindex/async.waterfall)] indexing in progress');
        } else {
            logger.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] reindex failed. ' + results);
        }

        if (results.reindex_complete !== undefined && results.reindex_complete === true) {
            republish();
        }

    });

    callback({
        status: 201,
        message: 'reindexing repository',
        data: []
    });
};

/**
 * Republishes collections
 */
const republish = function () {

    function publish (sip_uuid) {

        request.post({
            url: config.apiUrl + '/api/admin/v1/repo/publish',
            form: {
                'pid': sip_uuid,
                'type': 'collection'
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/import/utils module (republish/publish)] indexer error ' + error);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                logger.module().info('INFO: [/import/utils module (republish/publish)] published ' + sip_uuid + '.');
                return false;
            } else {
                logger.module().error('ERROR: [/import/utils module (republish/publish)] http error ' + httpResponse.statusCode + '/' + body);
                return false;
            }
        });
    }

    knex(REPO_OBJECTS)
        .select('pid')
        .where({
            object_type: 'collection',
            is_published: 1,
            is_active: 1
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();
                publish(record.pid);

            }, 10000);

        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/utils module (reindex/republish/publish)] Unable to get object ' + error);
            throw 'FATAL: [/import/utils module (reindex/republish/publish)] Unable to get object ' + error;
        });
};