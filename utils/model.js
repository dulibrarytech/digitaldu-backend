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

const VALIDATOR = require('validator');
const CACHE = require('../libs/cache');
const DURACLOUD_LIB = require('../libs/duracloud');
const ES_CONFIG = require('../config/elasticsearch_config')();
const DB = require('../config/db_config')();
const DBQ = require('../config/dbqueue_config')();
const REINDEX_TASKS = require('../utils/tasks/reindex_tasks');
const DB_TABLES = require('../config/db_tables_config')();
const REPO_OBJECTS = DB_TABLES.repo.repo_objects;
const CONVERT_QUEUE = 'tbl_convert_queue';
const UTILS_NORMALIZE_RECORDS_TASKS = require('../utils/tasks/utils_normalize_records_tasks');
const INDEX_RECORD_LIB = require('../libs/index_record_lib');
const LOGGER = require('../libs/log4');

/**
 * Re-indexes repository records
 * @param index
 * @param callback
 */
exports.reindex = (index, callback) => {

    (async () => {

        let es_index = ES_CONFIG.elasticsearch_back_index;
        let where_obj = {};
        where_obj.is_indexed = 0;
        where_obj.is_active = 1;

        if (index === 'frontend') {
            where_obj.is_published = 1;
            es_index = ES_CONFIG.elasticsearch_front_index;
        }

        const TASKS = new REINDEX_TASKS(ES_CONFIG, es_index, DB, REPO_OBJECTS);
        let is_created = true;
        let is_indexing;
        let index_exists = await TASKS.check_index();

        if (index_exists === true) {
            await TASKS.delete_index();
        } else if (index_exists === false) {
            is_created = await TASKS.create_index();
        }

        if (is_created !== false) {

            is_indexing = await TASKS.index(index);

            if (is_indexing === true) {

                let timer = setInterval(() => {
                    (async () => {

                        let is_indexed = await TASKS.monitor_index_progress(where_obj);

                        if (is_indexed === true) {
                            console.log('indexing complete');
                            clearInterval(timer);
                        }
                    })();

                    CACHE.clear_cache();

                }, 10000);

            } else {
                console.log('re-index failed');
                return false;
            }
        }

    })();

    callback({
        status: 201,
        message: 'reindexing repository records',
        data: []
    });
};

/** TEST
 * Normalize collection metadata and index records
 * @param callback
 */
exports.normalize_collection_records = function (callback) {

    (async () => {

        console.log('normalizing collection records...');
        const NORMALIZE_RECORDS_TASK = new UTILS_NORMALIZE_RECORDS_TASKS(DB, REPO_OBJECTS);
        let token = await NORMALIZE_RECORDS_TASK.get_session_token();
        let result = await NORMALIZE_RECORDS_TASK.reset_updated_flags();

        if (result === false) {
            // TODO: log failure
            console.log('is_updated flag reset failed.');
            // Stop process
            return false;
        }

        let timer = setInterval(async () => {

            try {

                let uri;
                let uuid;
                let data;
                let where_obj = {};
                where_obj.object_type = 'collection';
                where_obj.is_updated = 0;
                where_obj.is_active = 1;

                data = await NORMALIZE_RECORDS_TASK.get_record_uri(where_obj);

                if (data === 0) {
                    clearInterval(timer);
                    console.log('Normalization complete.');
                    // TODO: log completion
                    return false;
                }

                uuid = data[0].uuid;
                uri = VALIDATOR.unescape(data[0].uri);
                console.log(uri);

                let record = await NORMALIZE_RECORDS_TASK.get_aspace_record(uri, token);
                console.log(record.metadata);

                // update metadata
                let is_updated = await NORMALIZE_RECORDS_TASK.update_collection_data(uuid, uri, record.metadata)

                if (is_updated === true) {
                    let result = await NORMALIZE_RECORDS_TASK.update_status(uuid);
                    console.log(result);
                } else {
                    console.log(uuid + 'not updated');
                }

            } catch (error) {
                // TODO: log error
                console.log(error.message);
            }

        }, 10000); // TIMERS_CONFIG.index_timer

    })();

    callback({
        status: 201,
        message: 'Normalizing repository collection records...'
    });
};

/** TEST
 * Normalize index records
 * @param callback
 */
exports.normalize_records = function (callback) {

    (async () => {

        console.log('normalizing records...');
        const INDEX_RECORD_TASKS = new INDEX_RECORD_LIB(DB, REPO_OBJECTS);
        const NORMALIZE_RECORDS_TASK = new UTILS_NORMALIZE_RECORDS_TASKS(DB, REPO_OBJECTS);
        let result = await NORMALIZE_RECORDS_TASK.reset_updated_flags();

        if (result === false) {
            // TODO: log failure
            console.log('is_updated flag reset failed.');
            // Stop index processs[
            return false;
        }

        let timer = setInterval(async () => {

            try {

                let uuid;
                let result;
                let record;

                uuid = await NORMALIZE_RECORDS_TASK.get_record_uuid({
                    is_updated: 0,
                    is_active: 1
                });

                if (uuid === undefined || uuid === 0) {
                    clearInterval(timer);
                    console.log('Normalization complete.');
                    // TODO: log completion
                    return false;
                }

                record = await INDEX_RECORD_TASKS.get_index_record_data(uuid);

                if (record.metadata === null) {
                    console.log('no metadata record for ' + uuid);
                    result = await NORMALIZE_RECORDS_TASK.update_status(uuid);
                    console.log(result);
                    return false;
                }

                console.log('Processing: ', uuid);

                let metadata = JSON.parse(record.metadata);
                metadata.title = unescape(metadata.title);

                if (metadata.identifiers !== undefined && metadata.identifiers[0].type === 'local') {
                    NORMALIZE_RECORDS_TASK.save_call_number(uuid, metadata.identifiers[0].identifier);
                }

                if (record.is_compound === 1) {

                    let index_record = JSON.parse(record.index_record);

                    if (index_record.display_record !== undefined && index_record.display_record.parts !== undefined) {

                        let compound_parts = JSON.stringify(index_record.display_record.parts);

                        NORMALIZE_RECORDS_TASK.save_parts({
                            uuid: uuid,
                            is_compound: 1
                        }, compound_parts);
                    }
                }

                if (record.handle !== null && record.handle.length > 0) {
                    await NORMALIZE_RECORDS_TASK.update_handle(uuid, record.handle.replace('http://', 'https://'));
                }

                let new_record = await INDEX_RECORD_TASKS.create_index_record(record);
                new_record.display_record.title = unescape(new_record.display_record.title);
                console.log(uuid + ' normalized.');

                let is_updated = await NORMALIZE_RECORDS_TASK.update_index_record({
                    uuid: uuid
                }, new_record);

                if (is_updated === true) {
                    let result = await NORMALIZE_RECORDS_TASK.update_status(uuid);
                    console.log(result);
                }

            } catch (error) {
                // TODO: log error
                console.log(error.message);
            }

        }, 50); // TIMERS_CONFIG.index_timer

    })();

    callback({
        status: 201,
        message: 'Normalizing repository records...'
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
            .select('uuid', 'display_record', 'file_name')
            .where(whereObj)
            .orderBy('id', 'desc')
            .then(function (data) {

                let timer1 = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer1);
                        console.log('Compound objects complete!');
                        setTimeout(function () {
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
            .select('uuid', 'file_name')
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

                    obj.uuid = record.uuid;

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
            .select('uuid', 'full_path', 'object_name', 'mime_type')
            .then(function (data) {

                let timer = setInterval(function () {

                    console.log(data.length);

                    if (data.length === 0) {
                        clearInterval(timer);
                        console.log('objects converted!');
                        return false;
                    }

                    let record = data.pop();
                    DURACLOUD_LIB.convert_service(record);

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
        return await DB(REPO_OBJECTS).select('sip_uuid', 'display_record').where({object_type: 'object'});
    }

    function find_broken_display_records(data) {

        let timer = setInterval(function () {

            if (data.length === 0) {
                clearInterval(timer);
                console.log('done');
                setTimeout(function () {
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
                        setTimeout(function () {
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
                        .then(function (data) {
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
                        .then(function (data) {
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
                        .then(function (data) {
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

    (async function () {

        try {

            let data = await get_display_records();
            find_broken_display_records(data);
            // update_display_records();

        } catch (error) {
            console.log(error);
        }

    })();
};

exports.save_call_number = function (req, callback) {

    DB(REPO_OBJECTS)
        .select('uuid', 'display_record')
        .then(function (data) {

            let timer = setInterval(function () {

                console.log(data.length);

                if (data.length === 0) {
                    clearInterval(timer);
                    console.log('done!');
                    return false;
                }

                let record = data.pop();
                let display_record = JSON.parse(record.display_record);

                if (display_record === null) {
                    console.log('no display record');
                    return false;
                }

                let identifiers = display_record.display_record.identifiers;
                let uuid = display_record.pid;

                if (identifiers === undefined) {
                    console.log(uuid);
                    console.log('no call number');
                    return false;
                }

                for (let i = 0; i < identifiers.length; i++) {

                    if (identifiers[i].type === 'local') {

                        console.log(identifiers[i].identifier);

                        DB(REPO_OBJECTS)
                            .where({
                                uuid: uuid
                            })
                            .update({
                                call_number: identifiers[i].identifier
                            })
                            .then(function (data) {
                                // console.log(data);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }
                }

            }, 100);

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });

    callback({
        status: 201,
        message: 'saving call numbers...',
        data: []
    });
};

/** TODO: DEPRECATED
 * publishes (indexes) record into public index
 * @param uuid

 function publish(uuid) {

    (async() => {

        let data = {
            'uuid': uuid
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
 */

/** TODO: DEPRECATED
 * Republishes records after full reindex

 const republish = function (object_type) {

    console.log('Republishing ' + object_type + ' records...');

    let whereObj = {
        object_type: object_type,
        is_published: 1,
        is_active: 1
    };

    DB(REPO_OBJECTS)
        .select('uuid')
        .where(whereObj)
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer);
                    return false;
                }

                let record = data.pop();
                publish(record.uuid);

            }, 20);

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error);
            throw 'FATAL: [/import/utils module (reindex/republish_collection/publish_collection)] Unable to get object ' + error;
        });
};
 */

// TODO: delete ES record curl -X DELETE "localhost:9200/document-index/_doc/1"
// curl -X DELETE "http://domain:9200/repo_admin/_doc/0e642af3-79cb-456e-ba7e-ccdf5ec0cee3"