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
    HTTP = require('../libs/http'),
    async = require('async'),
    logger = require('../libs/log4'),
    knex = require('../config/db')(),
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    }),
    REPO_OBJECTS = 'tbl_objects';

/**
 * reindexes all repository records
 * @param req
 * @param callback
 */
exports.reindex = function (req, callback) {

    function check_indexes(callback) {

        let obj = {};
        let indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];
        obj.indexes = [];

        function check_index(index, cb) {

            (async () => {

                let response = await HTTP.head({
                    url: config.elasticSearch + '/' + index
                });

                let result = {};

                if (response.error === true) {
                    logger.module().error('ERROR: [/utils/model module (check_index)] request failed. Index does not exist.');
                    result.error = true;
                } else {
                    result.error = false;
                }

                result.index = index;
                cb(result);
            })();
        }

        let timer = setInterval(function () {

            if (indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = indexes.pop();

            check_index(index, function(result) {

                if (result.error === false) {
                    // indexes to delete
                    obj.indexes.push(result.index);
                }

            });

        }, 500);
    }

    function delete_index(obj, callback) {

        // no need to run delete if indices do not exist
        if (obj.error === false) {
            obj.delete_indexes = [];
            callback(null, obj);
            return false;
        }

        obj.delete_indexes = obj.indexes;

        function del(index_name) {

            (async() => {

                let data = {
                    'index_name': index_name
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/index/delete',
                    data: data
                });

                if (response.error === true) {
                    logger.module().error('ERROR: [/import/utils module (reindex/delete_index)] indexer error ' + response.error);
                } else if (response.data.status === 201) {
                    return false;
                }

            })();
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

    function create_index(obj, callback) {

        if (obj.delete_indexes.length !== 0) {
            obj.delete = false;
            callback(null, obj);
            return false;
        }

        obj.create_indexes = [config.elasticSearchBackIndex, config.elasticSearchFrontIndex];

        function create(index_name) {

            (async() => {

                let data = {
                    'index_name': index_name
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/index/create',
                    data: data
                });

                if (response.error === true) {
                    logger.module().error('ERROR: [/import/utils module (reindex/create_index/create)] indexer error ' + response.error);
                } else if (response.data.status === 201) {
                    return false;
                }

            })();
        }

        let timer = setInterval(function () {

            if (obj.create_indexes.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let index = obj.create_indexes.pop();
            create(index);

        }, 4000);
    }

    function index(obj, callback) {

        if (obj.create_indexes.length !== 0) {
            obj.create = false;
            callback(null, obj);
            return false;
        }

        function reindex(index_name) {

            (async() => {

                let data = {
                    'index_name': index_name,
                    'reindex': true
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer/all',
                    data: data
                });

                if (response.error === true) {
                    logger.module().error('ERROR: [/import/utils module (reindex/index/reindex)] indexer error ' + response.error);
                } else if (response.data.status === 201) {
                    obj.reindexed = true;
                    callback(null, obj);
                    return false;
                }

            })();
        }

        reindex(config.elasticSearchBackIndex);
    }

    function monitor_index_progress(obj, callback) {

        console.log('Starting monitor...');

        function monitor() {

            knex(REPO_OBJECTS)
                .count('is_indexed as is_indexed_count')
                .where({
                    is_indexed: 0,
                    is_active: 1
                })
                .then(function (data) {

                    console.log('Record index count: ', data[0].is_indexed_count);

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
        }, 10000);
    }

    async.waterfall([
        check_indexes,
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
            republish('collection');
            republish('object');
        }
    });

    callback({
        status: 201,
        message: 'reindexing repository',
        data: []
    });
};

/**
 * publishes (indexes) records into public index
 * @param sip_uuid
 */
function publish(sip_uuid) {

    (async() => {

        let data = {
            'sip_uuid': sip_uuid
        };

        let response = await HTTP.post({
            endpoint: '/api/admin/v1/indexer/republish',
            data: data
        });

        if (response.error === true) {
            logger.module().error('ERROR: [/import/utils module (republish/publish)] indexer error ' + response.error);
        } else if (response.data.status === 201) {
            return false;
        }

    })();
}

/**
 * Republishes records after full reindex
 */
const republish = function (object_type) {

    console.log('Republishing ' + object_type + ' records...');

    let whereObj = {
        object_type: object_type,
        is_published: 1,
        is_active: 1
    };

    knex(REPO_OBJECTS)
        .select('sip_uuid')
        .where(whereObj)
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();
                publish(record.sip_uuid);

            }, 20);

            return null;
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error);
            throw 'FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error;
        });
};

/**
 *  gets archivesspace ids for incomplete records
 */
exports.get_archivesspace_ids = function (req, callback) {

    knexQ('tbl_incomplete_queue')
        .distinct('sip_uuid', 'call_number')
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();

                knex(REPO_OBJECTS)
                    .select('uri')
                    .where({
                        sip_uuid: record.sip_uuid
                    })
                    .then(function (data) {

                        let obj = {};
                        obj.sip_uuid = record.sip_uuid.trim();
                        obj.uri = data[0].uri.trim();
                        obj.call_number = record.call_number.trim();

                        knexQ('broken_tiffs')
                            .insert(obj)
                            .then(function (data) {
                                console.log(data);
                                return null;
                            })
                            .catch(function (error) {
                                logger.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error);
                                throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save incomplete record data ' + error;
                            });
                    })
                    .catch(function (error) {
                        logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
                        throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
                    });

            }, 150);

        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/utils/model module (check_objects)] Unable to get objects ' + error);
            throw 'FATAL: [/utils/model module (check_objects)] Unable to check objects ' + error;
        });

    callback({
        status: 200,
        message: 'Getting archivesspace ids.'
    });
};