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
    HTTP = require('../libs/http'),
    ASYNC = require('async'),
    LOGGER = require('../libs/log4'),
    CACHE = require('../libs/cache'),
    DURACLOUD = require('../libs/duracloud'),
    DB = require('../config/db')(),
    DBQ = require('../config/dbqueue')(),
    REPO_OBJECTS = 'tbl_objects',
    CONVERT_QUEUE = 'tbl_convert_queue';

/**
 * reindexes all repository records
 * @param req
 * @param callback
 */
exports.reindex = function (req, callback) {

    CACHE.clear_cache();

    function check_indexes(callback) {

        let obj = {};
        let indexes = [CONFIG.elasticSearchBackIndex, CONFIG.elasticSearchFrontIndex];
        obj.indexes = [];

        function check_index(index, cb) {

            (async () => {

                let response = await HTTP.head({
                    url: CONFIG.elasticSearch + '/' + index
                });

                let result = {};

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/model module (check_index)] request failed. Index does not exist.');
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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex/delete_index)] indexer error ' + response.error);
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

        obj.create_indexes = [CONFIG.elasticSearchBackIndex, CONFIG.elasticSearchFrontIndex];

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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex/create_index/create)] indexer error ' + response.error);
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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex/index/reindex)] indexer error ' + response.error);
                } else if (response.data.status === 201) {
                    obj.reindexed = true;
                    callback(null, obj);
                    return false;
                }

            })();
        }

        reindex(CONFIG.elasticSearchBackIndex);
    }

    function monitor_index_progress(obj, callback) {

        console.log('Starting monitor...');

        function monitor() {

            DB(REPO_OBJECTS)
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
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error);
                    throw 'FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor index progress ' + error;
                });
        }

        var timer = setInterval(function () {
            monitor();
        }, 10000);
    }

    ASYNC.waterfall([
        check_indexes,
        delete_index,
        create_index,
        index,
        monitor_index_progress
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] ' + error);
        }

        if (results.reindexed !== undefined) {
            LOGGER.module().info('INFO: [/utils/model module (reindex/async.waterfall)] indexing in progress');
        } else {
            LOGGER.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] reindex failed. ' + results);
        }

        if (results.reindex_complete !== undefined && results.reindex_complete === true) {
            republish('collection');
            republish('object');
        }

        CACHE.clear_cache();
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
            LOGGER.module().error('ERROR: [/import/utils module (republish/publish)] indexer error ' + response.error);
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

    DB(REPO_OBJECTS)
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
            LOGGER.module().fatal('FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error);
            throw 'FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error;
        });
};

/**
 * Retrieves files
 * @param req
 * @param callback
 */
exports.batch_convert = function (req, callback) {

    let mime_type = req.body.mime_type;

    if (mime_type === undefined || mime_type.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    /**
     * Gets all compound objects
     */
    function get_compounds_objects() {

        let whereObj = {
            mime_type: mime_type,
            is_active: 1,
            is_compound: 1
        };

        DB(REPO_OBJECTS)
            .select('sip_uuid', 'display_record', 'file_name')
            .where(whereObj)
            .orderBy('id', 'desc')
            .then(function (data) {

                let timer1 = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer1);
                        console.log('Compound objects complete!');
                        setTimeout(function() {
                            console.log('Starting conversions...');
                            convert();
                        }, 35000);
                        return false;
                    }

                    let record = data.pop();
                    let json = JSON.parse(record.display_record);
                    let obj = {};
                    let full_path_arr = [];

                    obj.sip_uuid = json.pid;

                    // package up request data
                    for (let i = 0; i < json.display_record.parts.length; i++) {

                        // object_name is used to name the file
                        let full_path = json.display_record.parts[i].object;

                        if (full_path === null) {
                            return false;
                        }

                        if (full_path !== undefined && full_path.indexOf('jp2') !== -1) {
                            full_path = full_path.replace('jp2', 'tif');
                        }

                        full_path_arr.push(full_path);
                    }

                    obj.full_paths = full_path_arr;

                    let request_obj = {};
                    request_obj.sip_uuid = obj.sip_uuid

                    let timer2 = setInterval(function () {

                        if (obj.full_paths.length === 0) {
                            clearInterval(timer2);
                            return false;
                        }

                        let full_path = obj.full_paths.pop();

                        if (full_path === undefined) {
                            return false;
                        }

                        request_obj.full_path = full_path;

                        let arr = full_path.split('/');
                        let object_name = arr[arr.length - 1];

                        if (object_name !== undefined && object_name.indexOf('tif') !== -1) {
                            object_name = object_name.replace('tif', 'jpg');
                        }

                        request_obj.object_name = object_name;
                        request_obj.mime_type = mime_type;

                        save_to_queue(request_obj);

                    }, 100);

                }, 500);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/utils module (batch_convert/get_compounds_objects)] Unable to get compound objects ' + error);
                throw 'FATAL: [/import/utils module (batch_convert/get_compounds_objects)] Unable to get compound objects ' + error;
            });
    }

    /**
     * Gets all non-compound objects
     */
    function get_objects() {

        let whereObj = {
            mime_type: mime_type,
            is_active: 1,
            is_compound: 0
        };

        DB(REPO_OBJECTS)
            .select('sip_uuid','file_name')
            .where(whereObj)
            .orderBy('id', 'desc')
            .then(function (data) {

                let timer1 = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer1);
                        get_compounds_objects();
                        console.log('objects complete!');
                        return false;
                    }

                    let record = data.pop();
                    let full_path;
                    let object_name;
                    let obj = {};

                    obj.sip_uuid = record.sip_uuid;

                    if (record.file_name === null) {
                        return false;
                    }

                    if (record.file_name !== undefined && record.file_name.indexOf('jp2') !== -1) {
                        full_path = record.file_name.replace('jp2', 'tif');
                    }

                    if (full_path === undefined) {
                        return false;
                    }

                    obj.full_path = full_path;

                    let arr = full_path.split('/');
                    object_name = arr[arr.length - 1];

                    if (object_name !== undefined && object_name.indexOf('tif') !== -1) {
                        object_name = object_name.replace('tif', 'jpg');
                    }

                    obj.object_name = object_name;
                    obj.mime_type = mime_type;

                    save_to_queue(obj);

                }, 20);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/utils module (batch_convert/get_objects)] Unable to get objects ' + error);
                throw 'FATAL: [/import/utils module (batch_convert/get_objects)] Unable to get objects ' + error;
            });
    }

    /**
     * Saves convert data to queue
     * @param obj
     */
    function save_to_queue(obj) {

        DBQ(CONVERT_QUEUE)
            .insert(obj)
            .then(function (data) {
                console.log(data);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/utils module (batch_convert/save_to_queue)] Unable to save objects ' + error);
                throw 'FATAL: [/import/utils module (batch_convert/save_to_queue)] Unable to save objects ' + error;
            });
    }

    /**
     * Sends request to convert service
     */
    function convert() {

        DBQ(CONVERT_QUEUE)
            .select('sip_uuid','full_path', 'object_name', 'mime_type')
            .then(function (data) {

                let timer = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer);
                        console.log('objects converted!');
                        return false;
                    }

                    let record = data.pop();
                    DURACLOUD.convert_service(record);

                }, 6000);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/utils module (batch_convert/convert)] Unable to send convert request ' + error);
                throw 'FATAL: [/import/utils module (batch_convert/convert)] Unable to send convert request ' + error;
            });
    }

    // TODO: have option to choose between the two to begin the process
    // get_objects();
    convert();
};

/*
    data:  {
        pid: '2a478eb4-e8fe-4048-8ffa-469aa2dfcb3e',
        *sip_uuid: '2a478eb4-e8fe-4048-8ffa-469aa2dfcb3e',
        is_member_of_collection: 'a5efb5d1-0484-429c-95a5-15c12ff40ca0',
        dip_path: 'ec1f/0da1/609c/4a58/b91f/0464/2cf3/6b2a/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.16.0202.00001_transfer_2-2a478eb4-e8fe-4048-8ffa-469aa2dfcb3e',
        file: 'B002.16.0202.00001.tif',
        *uuid: 'e224402a-c6b1-45ff-8ed9-d2dc699a4736',
        uri: '/repositories/2/archival_objects/57019',
        mods_id: '57019',
        mime_type: 'image/tiff',
        checksum: 'e66e62248969f41a313f4c0a855419db',
        file_size: '3626830',
        *file_name: 'ec1f/0da1/609c/4a58/b91f/0464/2cf3/6b2a/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.16.0202.00001_transfer_2-2a478eb4-e8fe-4048-8ffa-469aa2dfcb3e/objects/e224402a-c6b1-45ff-8ed9-d2dc699a4736-B002.16.0202.00001.tif',
        thumbnail: 'ec1f/0da1/609c/4a58/b91f/0464/2cf3/6b2a/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.16.0202.00001_transfer_2-2a478eb4-e8fe-4048-8ffa-469aa2dfcb3e/thumbnails/e224402a-c6b1-45ff-8ed9-d2dc699a4736.jpg'
    }
     */