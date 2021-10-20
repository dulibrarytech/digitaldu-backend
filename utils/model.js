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
    TRANSCRIPTS = require('../libs/transcripts'),
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
 * Re-indexes backend
 * @param req
 * @param callback
 */
exports.reindex_backend = function (req, callback) {

    CACHE.clear_cache();

    function check_backend_index(callback) {

        let obj = {};
        let indexes = [CONFIG.elasticSearchBackIndex];
        obj.indexes = [];

        function check_index(index, cb) {

            (async () => {

                let response = await HTTP.head({
                    url: CONFIG.elasticSearch + '/' + index
                });

                let result = {};

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/model module (check_index)] request failed. Backend index does not exist.');
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

    function delete_backend_index(obj, callback) {

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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex_backend/delete_index)] backend indexer error ' + response.error);
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

    function create_backend_index(obj, callback) {

        if (obj.delete_indexes.length !== 0) {
            obj.delete = false;
            callback(null, obj);
            return false;
        }

        obj.create_indexes = [CONFIG.elasticSearchBackIndex];

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
                    LOGGER.module().error('ERROR: [/import/utils module (backend_reindex/create_index/create)] backend indexer error ' + response.error);
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

    function index_backend(obj, callback) {

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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex_backend/index/reindex)] backend indexer error ' + response.error);
                } else if (response.data.status === 201) {
                    obj.reindexed = true;
                    callback(null, obj);
                    return false;
                }

            })();
        }

        reindex(CONFIG.elasticSearchBackIndex);
    }

    function monitor_backend_index_progress(obj, callback) {

        console.log('Starting monitor...');

        function monitor() {

            DB(REPO_OBJECTS)
                .count('is_indexed as is_indexed_count')
                .where({
                    is_indexed: 0,
                    is_active: 1
                })
                .then(function (data) {

                    console.log('Record backend index count: ', data[0].is_indexed_count);

                    if (data[0].is_indexed_count < 50) {
                        clearInterval(timer);
                        obj.reindex_complete = true;
                        callback(null, obj);
                        return false;
                    }

                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor backend index progress ' + error);
                    throw 'FATAL: [/stats/model module (get_stats/monitor_index_progress)] unable to monitor backend index progress ' + error;
                });
        }

        var timer = setInterval(function () {
            monitor();
            CACHE.clear_cache();
        }, 10000);
    }

    ASYNC.waterfall([
        check_backend_index,
        delete_backend_index,
        create_backend_index,
        index_backend,
        monitor_backend_index_progress
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] ' + error);
        }

        if (results.reindexed !== undefined) {
            LOGGER.module().info('INFO: [/utils/model module (reindex/async.waterfall)] indexing backend in progress');
        } else {
            LOGGER.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] backend reindex failed. ' + results);
        }

        CACHE.clear_cache();
    });

    callback({
        status: 201,
        message: 'reindexing backend repository records',
        data: []
    });
};

/**
 * Re-indexes frontend
 * @param req
 * @param callback
 */
exports.reindex_frontend = function (req, callback) {

    CACHE.clear_cache();

    function check_frontend_index(callback) {

        let obj = {};
        let indexes = [CONFIG.elasticSearchFrontIndex];
        obj.indexes = [];

        function check_index(index, cb) {

            (async () => {

                let response = await HTTP.head({
                    url: CONFIG.elasticSearch + '/' + index
                });

                let result = {};

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/utils/model module (check_index)] request failed. Frontend index does not exist.');
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

    function delete_frontend_index(obj, callback) {

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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex_frontend/delete_index)] frontend indexer error ' + response.error);
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

    function create_frontend_index(obj, callback) {

        if (obj.delete_indexes.length !== 0) {
            obj.delete = false;
            callback(null, obj);
            return false;
        }

        obj.create_indexes = [CONFIG.elasticSearchFrontIndex];

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
                    LOGGER.module().error('ERROR: [/import/utils module (reindex_frontend/create_index/create)] frontend indexer error ' + response.error);
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

    ASYNC.waterfall([
        check_frontend_index,
        delete_frontend_index,
        create_frontend_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/utils/model module (reindex/async.waterfall)] ' + error);
        }

        republish('collection');
        republish('object');

        CACHE.clear_cache();
    });

    callback({
        status: 201,
        message: 'reindexing frontend repository records',
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
 * Loads transcripts from transcript service
 */
exports.load_transcripts = function () {
    TRANSCRIPTS.load();
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
    get_objects();
    // convert();
};

/**
 * fix records with missing object paths
 */
exports.batch_fix = function () {

    const archivematica = require('../libs/archivematica'),
        archivespace = require('../libs/archivespace'),
        duracloud = require('../libs/duracloud'),
        modslibdisplay = require('../libs/display-record'),
        metslib = require('../libs/mets'),
        importlib = require('../libs/transfer-ingest');

    async function get_display_records() {
        return await DB(REPO_OBJECTS).select('sip_uuid','display_record').where({object_type: 'object'});
    }

    function find_broken_display_records(data) {

        let timer = setInterval(function () {

            if (data.length === 0) {
                clearInterval(timer);
                console.log('done');
                setTimeout(function() {
                    fix_broken_display_records();
                }, 5000);
                return false;
            }

            let record = data.pop();
            let display_record = JSON.parse(record.display_record);

            if (display_record !== null && display_record.pid !== undefined) {
                console.log(display_record.pid);
            }

            if (display_record !== null && display_record.object === undefined) {

                console.log('BROKEN: ', display_record.pid);

                DB('tbl_fix_object_paths')
                    .insert({
                        pid: display_record.pid,
                        old_display_record: JSON.stringify(display_record)
                    })
                    .then(function (data) {
                        console.log(data);
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/utils/model module (find_broken_display_records)] unable to save record ' + error);
                    });

                get_mets(display_record.pid);
            }

        }, 250);
    }

    function get_mets(sip_uuid) {

        console.log('getting mets...');

        archivematica.get_dip_path(sip_uuid, function (dip_path) {

            let obj = {};
            obj.dip_path = dip_path;
            obj.sip_uuid = sip_uuid;

            duracloud.get_mets(obj, function (response) {

                if (response.error !== undefined && response.error === true) {
                    console.log(response.error);
                    // logger.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets');
                }

                let metsResults = metslib.process_mets(obj.sip_uuid, obj.dip_path, response.mets);

                importlib.save_mets_data(metsResults, function (result) {
                    console.log(result);
                });

            });

        });
    }

    function fix_broken_display_records() {

        DBQ('tbl_duracloud_queue')
            .select('*')
            .where({
                type: 'object'
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer);
                        console.log('done!');
                        setTimeout(function() {
                            fix_display_records();
                        }, 5000);

                        return false;
                    }

                    let record = data.pop();
                    let object_path = record.dip_path + '/objects/' + record.uuid + '-' + record.file;

                    DB('tbl_fix_object_paths')
                        .where({
                            pid: record.sip_uuid
                        })
                        .update({
                            object_path: object_path
                        })
                        .then(function(data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                }, 50);

                return null;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function fix_display_records() {

        DB('tbl_fix_object_paths')
            .select('*')
            .then(function (data) {

                let timer = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer);
                        console.log('done!');
                        update_display_records();
                        return false;
                    }

                    let record = data.pop();
                    let old_display_record = JSON.parse(record.old_display_record);
                    old_display_record.object = record.object_path;
                    let display_record = old_display_record;

                    DB('tbl_fix_object_paths')
                        .where({
                            pid: record.pid
                        })
                        .update({
                            display_record: JSON.stringify(display_record)
                        })
                        .then(function(data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                }, 250);

                return null;
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    function update_display_records() {

        DB('tbl_fix_object_paths')
            .select('*')
            .then(function (data) {

                let timer = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer);
                        console.log('done!');
                        return false;
                    }

                    let record = data.pop();
                    let display_record = record.display_record;

                    DB('tbl_objects')
                        .where({
                            pid: record.pid
                        })
                        .update({
                            display_record: display_record
                        })
                        .then(function(data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                }, 500);

                return null;
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    (async function(){

        try {

            let data = await get_display_records();
            find_broken_display_records(data);
            // update_display_records();

        } catch(error) {
            console.log(error);
        }

    })();
};

// TODO: delete ES record curl -X DELETE "localhost:9200/document-index/_doc/1"
// curl -X DELETE "http://domain:9200/repo_admin/_doc/07dce309-1281-47c4-b35e-ea0b6e847829"