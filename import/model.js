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
    MODS = require('../libs/display-record'),
    SERVICE = require('../import/service'),
    LOGGER = require('../libs/log4'),
    ASYNC = require('async'),
    HTTP = require('../libs/http'),
    VALIDATOR = require('validator'),
    DB = require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Batch updates all or a collection's metadata records in the repository via ArchivesSpace
 * @param req
 * @param callback
 */
exports.batch_update_metadata = function (req, callback) {

    function reset_update_flags(callback) {

        let obj = {};
        let whereObj = {};

        // size of collection
        if (req.query.size === undefined) {
            obj.size = 's';
        } else {
            obj.size = req.query.size;
        }

        whereObj.is_active = 1;
        whereObj.object_type = 'object';

        DB(REPO_OBJECTS)
            .where(whereObj)
            .update({
                is_updated: 0
            })
            .then(function (data) {

                if (data > 0) {
                    obj.total_records = data;
                    obj.reset = true;
                    LOGGER.module().info('INTO: [/import/model module (batch_update_metadata/reset_update_flags)] ' + data + ' update flags reset');
                    callback(null, obj);
                }

                return false;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/reset_update_flags/async.waterfall)] ' + error);
                throw 'ERROR: [/import/model module (batch_update_metadata/reset_update_flags/async.waterfall)] ' + error;
            });
    }

    function get_token(obj, callback) {

        (async() => {

            let response = await HTTP.get({
                endpoint: '/api/admin/v1/import/metadata/session'
            });

            if (response.error === true) {
                obj.session = null;
            } else {
                obj.session = response.data.session;
                callback(null, obj);
            }

            return false;

        })();
    }

    function get_collection_counts(obj, callback) {

        DB(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                object_type: 'collection'
            })
            .then(async function (data) {

                let object_timer = CONFIG.archivesSpaceTimer;
                let counts = [];

                for (let i = 0; i < data.length; i++) {

                    counts.push({
                        'sip_uuid': data[i].sip_uuid, 'count': await DB(REPO_OBJECTS)
                            .count('id as count', 'sip_uuid')
                            .where({
                                is_member_of_collection: data[i].sip_uuid,
                                is_active: 1,
                                object_type: 'object',
                                is_updated: 0
                            })
                    });
                }

                let collections = counts.filter(function (value) {

                    let object_count = value.count.pop().count;
                    let max_count;
                    let min_count;

                    switch (obj.size) {
                        case '1':
                            max_count = 100;
                            min_count = 0;
                            break;
                        case '2':
                            max_count = 200;
                            min_count = 100;
                            break;
                        case '3':
                            max_count = 400;
                            min_count = 200;
                            break;
                        default:
                            max_count = 300;
                            min_count = 0;
                            break;
                    }

                    if (object_count < max_count && object_count > min_count) {
                        delete value.count;
                        value.collection_timer = object_count * object_timer;  //60000 * 5;
                        return value;
                    }
                });

                let collection_timers = [];

                for (let i = 0; i < collections.length; i++) {
                    collection_timers.push(collections[i].collection_timer);
                    delete collections[i].collection_timer;
                }

                obj.collection_timer = Math.max.apply(Math, collection_timers);
                obj.object_timer = object_timer;
                obj.collections = collections;
                callback(null, obj);
            });

        return false;
    }

    function update_metadata_records(obj, callback) {

        if (obj.reset === false || obj.session === null) {
            callback(null, obj);
            return false;
        }

        let collection_timer = obj.collection_timer;
        let object_timer = obj.object_timer;
        let outer_timer;

        const reset_update_flag = function (sip_uuid) {

            DB(REPO_OBJECTS)
                .where({
                    sip_uuid: sip_uuid
                })
                .update({
                    is_updated: 1
                })
                .then(function (data) {

                    if (data === 1) {
                        return false;
                    }

                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/update_metadata_records)] unable to update metadata record ' + obj.sip_uuid + ' ' + error);
                    throw 'ERROR: [/import/model module (batch_update_metadata/update_metadata_records)] unable to update metadata record ' + obj.sip_uuid + ' ' + error;
                });
        };

        const request_collection_update = function (obj, sip_uuid) {

            LOGGER.module().info('INFO: [/import/model module (batch_update_metadata/request_collection_update)] updating collection ' + sip_uuid);

            (async() => {

                let data = {
                    'sip_uuid': sip_uuid,
                    'session': obj.session
                };

                let response = await HTTP.put({
                    endpoint: '/api/admin/v1/import/metadata/collection',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/request_collection_update)] unable to update record');
                }

                return false;

            })();
        };

        const request_object_update = function (obj, sip_uuid) {

            LOGGER.module().info('INFO: [/import/model module (batch_update_metadata/request_object_update)] updating object ' + sip_uuid);

            (async() => {

                let data = {
                    'sip_uuid': sip_uuid,
                    'session': obj.session
                };

                let response = await HTTP.put({
                    endpoint: '/api/admin/v1/import/metadata/object',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/request_object_update)] unable to update record');
                }

                return false;

            })();
        };

        // begin processing immediately
        collections();

        // processes updates for objects in collections - reference passed into interval function
        function collections() {

            let collection = obj.collections.pop();
            let inner_timer;

            if (obj.collections.length === 0) {
                LOGGER.module().info('INFO: [/import/model module (batch_update_metadata/update_metadata_records)] metadata updates complete');
                clearInterval(outer_timer);
                callback(null, obj);
                return false;
            }

            request_collection_update(obj, collection.sip_uuid);
            reset_update_flag(collection.sip_uuid);

            // processes objects - passed into interval function
            function objects() {

                if (obj.collections.length === 0) {
                    clearInterval(outer_timer);
                    clearInterval(inner_timer);
                    return false;
                }

                DB(REPO_OBJECTS)
                    .select('sip_uuid')
                    .where({
                        is_member_of_collection: collection.sip_uuid,
                        is_active: 1,
                        object_type: 'object',
                        is_updated: 0
                    })
                    .limit(1)
                    // .orderBy('id', 'asc')
                    .then(function (data) {

                        if (data.length === 0) {
                            clearInterval(inner_timer);
                            return false;
                        }

                        let sip_uuid = data[0].sip_uuid;
                        request_object_update(obj, sip_uuid);
                        reset_update_flag(sip_uuid);
                        return null;
                    })
                    .catch(function (error) {
                        LOGGER.module().error('ERROR: [/utils/model module (batch_update_metadata/update_metadata_records)] unable to get sip_uuid ' + error);
                        throw 'ERROR: [/import/model module (batch_update_metadata/update_metadata_records)] unable to get sip_uuid ' + error;
                    });

                return false; // end objects
            }

            inner_timer = setInterval(objects, object_timer);

            return false; // end collections
        }

        outer_timer = setInterval(collections, collection_timer);
    }

    ASYNC.waterfall([
        reset_update_flags,
        get_token,
        get_collection_counts,
        update_metadata_records
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/async.waterfall)] ' + error);
            throw 'ERROR: [/import/model module (batch_update_metadata/async.waterfall)] ' + error;
        }

        if (results.session !== null) {

            (async() => {

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/import/metadata/session/destroy'
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_metadata_record/get_mods)] Unable to terminate session');
                } else {
                    LOGGER.module().info('INFO: ArchivesSpace session terminated.');
                }

                return false;

            })();
        }

        LOGGER.module().info('INFO: [/import/model module (batch_update_metadata/async.waterfall)] metadata records updated');
    });

    callback({
        status: 201,
        message: 'Batch updating metadata records...'
    });
};

/**
 * updates single metadata record
 * @param req
 * @param callback
 */
exports.update_object_metadata_record = function (req, callback) {

    if (req.body.sip_uuid === undefined) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });

        return false;
    }

    let sip_uuid = req.body.sip_uuid;
    let session = req.body.session;

    function get_token(callback) {

        let obj = {};
        obj.sip_uuid = sip_uuid;

        if (session === undefined) {

            (async() => {

                let response = await HTTP.get({
                    endpoint: '/api/admin/v1/import/metadata/session'
                });

                if (response.error === true) {
                    obj.session = null;
                } else {
                    obj.single_record = true;
                    obj.session = response.data.session;
                    callback(null, obj);
                }

                return false;

            })();

        } else {
            obj.session = session;
            callback(null, obj);
        }
    }

    // 1.)
    function get_mods_id(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('mods_id', 'mods')
            .where({
                sip_uuid: obj.sip_uuid,
                object_type: 'object'
            })
            .then(function (data) {

                if (data.length === 0) {
                    LOGGER.module().info('INFO: no record found for ' + obj.sip_uuid);
                    return false;
                }

                obj.mods_id = data[0].mods_id;
                obj.prev_mods = data[0].mods;
                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/model module (update_object_metadata_record/get_mods_id)] unable to get mods id ' + error);
                throw 'FATAL: [/import/model module (update_object_metadata_record/get_mods_id)] unable to get mods id ' + error
            });
    }

    // 2.)
    function get_mods(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        SERVICE.get_mods(obj, function (data) {

            if (data.error === true) {
                obj.session = null;
                callback(null, obj);
                return false;
            }

            // move to local helper
            if (obj.prev_mods === data.mods) {

                LOGGER.module().info('INFO: no update required for record ' + obj.sip_uuid);

                if (obj.single_record !== undefined && obj.single_record === true) {

                    (async() => {

                        let data = {
                            'session': obj.session
                        };

                        let response = await HTTP.post({
                            endpoint: '/api/admin/v1/import/metadata/session/destroy',
                            data: data
                        });

                        if (response.error === true) {
                            LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/get_mods)] Unable to terminate session');
                        } else {
                            LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/get_mods)] ArchivesSpace session terminated.');
                        }

                    })();

                    obj.session = null;
                    callback(null, obj);
                    return false;
                }
            }

            obj.mods = data.mods;
            callback(null, obj);
            return false;
        });
    }

    // 3.)
    function update_mods(obj, callback) {

        if (obj.session === null || obj.error === true) {
            callback(null, obj);
            return false;
        }

        let mods = obj.mods;

        update_db_mods(obj.sip_uuid, mods, function (result) {
            obj.updated = result;
            callback(null, obj);
        });
    }

    // 4.)
    function update_display_record(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('*')
            .where({
                mods_id: obj.mods_id,
                is_active: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_display_record)] unable to update display record');
                    return false;
                }

                // TODO: move to lib
                let recordObj = {};
                recordObj.pid = data[0].pid;
                recordObj.is_member_of_collection = data[0].is_member_of_collection;
                recordObj.object_type = data[0].object_type;
                recordObj.sip_uuid = data[0].sip_uuid;
                recordObj.handle = data[0].handle;
                recordObj.entry_id = data[0].entry_id;
                recordObj.thumbnail = data[0].thumbnail;
                recordObj.object = data[0].file_name;
                recordObj.mime_type = data[0].mime_type;
                recordObj.is_published = data[0].is_published;
                recordObj.mods = obj.mods;

                MODS.create_display_record(recordObj, function (result) {

                    let tmp = JSON.parse(result);

                    if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                        let currentRecord = JSON.parse(data[0].display_record),
                            currentCompoundParts = currentRecord.display_record.parts;

                        let updatedParts = tmp.display_record.parts.filter(function (elem) {

                            for (let i = 0; i < currentCompoundParts.length; i++) {

                                if (elem.title === currentCompoundParts[i].title) {
                                    elem.caption = currentCompoundParts[i].caption;
                                    elem.object = currentCompoundParts[i].object;
                                    elem.thumbnail = currentCompoundParts[i].thumbnail;
                                    return elem;
                                }
                            }

                        });

                        delete tmp.display_record.parts;
                        delete tmp.compound;

                        if (currentCompoundParts !== undefined) {
                            tmp.display_record.parts = updatedParts;
                            tmp.compound = updatedParts;
                        }

                        obj.display_record = JSON.stringify(tmp);

                    } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                        obj.display_record = result;

                    }

                    DB(REPO_OBJECTS)
                        .where({
                            sip_uuid: obj.sip_uuid
                        })
                        .update({
                            display_record: obj.display_record
                        })
                        .then(function (data) {

                            if (data === 1) {
                                LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_display_record)] ' + obj.sip_uuid + ' display record updated');
                                obj.is_published = recordObj.is_published;
                                callback(null, obj);
                            } else {
                                obj.updated = false;
                                callback(null, obj);
                            }

                            return null;
                        })
                        .catch(function (error) {
                            LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/update_display_record)] unable to update display record ' + error);
                            obj.updated = false;
                            callback(null, obj);
                        });
                });

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/model module (update_object_metadata_record/update_display_record)] Unable to get display record ' + error);
                throw 'FATAL: [/import/model module (update_object_metadata_record/update_display_record)] Unable to get display record ' + error;
            });
    }

    // 5.)
    function update_admin_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        // update admin index
        (async() => {

            let data = {
                'sip_uuid': obj.sip_uuid
            };

            let response = await HTTP.post({
                endpoint: '/api/admin/v1/indexer',
                data: data
            });

            if (response.error === true) {
                LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/update_admin_index)] indexer error');
            } else {
                LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_admin_index)] ' + obj.sip_uuid + ' indexed');
                obj.admin_index = true;
                callback(null, obj);
            }

            return false;

        })();
    }

    // 6.)
    function update_public_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.admin_index === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        if (obj.is_published === 1) {

            // update public index
            (async() => {

                let data = {
                    'sip_uuid': obj.sip_uuid,
                    'publish': true
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/update_public_index)] indexer error');
                } else {
                    LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_public_index)] ' + obj.sip_uuid + ' indexed');
                    obj.admin_index = true;
                    callback(null, obj);
                }

                return false;

            })();
        }
    }

    ASYNC.waterfall([
        get_token,
        get_mods_id,
        get_mods,
        update_mods,
        update_display_record,
        update_admin_index,
        update_public_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/async.waterfall)] ' + error);
        }

    });

    callback({
        status: 201
    });
};

/**
 * Updates collection metadata record
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.update_collection_metadata_record = function (req, callback) {

    if (req.body.sip_uuid === undefined) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });

        return false;
    }

    let sip_uuid = req.body.sip_uuid;
    let session = req.body.session;

    // 1.)
    function get_token(callback) {

        let obj = {};
        obj.sip_uuid = sip_uuid;

        if (session === undefined) {

            (async() => {

                let response = await HTTP.get({
                    endpoint: '/api/admin/v1/import/metadata/session'
                });

                if (response.error === true) {
                    obj.session = null;
                } else {
                    obj.single_record = true;
                    obj.session = response.data.session;
                }

                callback(null, obj);
                return false;

            })();

        } else {
            obj.session = session;
            callback(null, obj);
        }
    }

    // 2.)
    function get_uri(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('uri', 'mods')
            .where({
                sip_uuid: obj.sip_uuid,
                object_type: 'collection'
            })
            .then(function (data) {

                if (data.length === 0) {
                    LOGGER.module().info('INFO: no record found for ' + obj.sip_uuid);
                    return false;
                }

                obj.uri = data[0].uri;
                obj.prev_mods = data[0].mods;
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/model module (update_collection_metadata_record/get_uri)] unable to get uri ' + error);
                throw 'FATAL: [/import/model module (update_collection_metadata_record/get_uri)] unable to get uri ' + error;
            });
    }

    // 3.)
    function get_mods(obj, callback) {

        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        obj.mods_id = obj.uri;

        SERVICE.get_mods(obj, function (data) {

            if (data.error === true) {
                obj.session = null;
                callback(null, obj);
                return false;
            }

            if (obj.prev_mods === data.mods) {

                LOGGER.module().info('INFO: no update required for record ' + obj.sip_uuid);
                // TODO: log update message to db

                if (obj.single_record !== undefined && obj.single_record === true) {

                    (async() => {

                        let data = {
                            'session': obj.session
                        };

                        let response = await HTTP.post({
                            endpoint: '/api/admin/v1/import/metadata/session/destroy',
                            data: data
                        });

                        if (response.error === true) {
                            LOGGER.module().error('ERROR: [/import/model module (update_metadata_record/get_mods)] Unable to terminate session');
                        }

                        obj.session = null;
                        callback(null, obj);
                        return false;

                    })();

                } else {
                    // no update needed, but we still need the session for the batch to proceed
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

            } else {
                // record needs to be updated
                obj.mods = data.mods;
                callback(null, obj);
            }
        });
    }

    // 4.)
    function update_mods(obj, callback) {

        if (obj.session === null || obj.error === true) {
            callback(null, obj);
            return false;
        }

        let mods = obj.mods;

        // TODO: log update message to db

        update_db_mods(obj.sip_uuid, mods, function (result) {
            obj.updated = result;
            callback(null, obj);
        });
    }

    // 5.)
    function update_display_record(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('*')
            .where({
                uri: obj.uri,
                is_active: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    LOGGER.module().info('INFO: [/import/model module (update_collection_metadata_record/update_display_record)] unable to update display record');
                    return false;
                }

                let recordObj = {};
                recordObj.pid = VALIDATOR.escape(data[0].pid);
                recordObj.is_member_of_collection = VALIDATOR.escape(data[0].is_member_of_collection);
                recordObj.object_type = data[0].object_type;
                recordObj.sip_uuid = data[0].sip_uuid;
                recordObj.handle = data[0].handle;
                recordObj.entry_id = data[0].entry_id;
                recordObj.thumbnail = data[0].thumbnail;
                recordObj.object = data[0].file_name;
                recordObj.mime_type = data[0].mime_type;
                recordObj.is_published = data[0].is_published;
                recordObj.mods = obj.mods;

                MODS.create_display_record(recordObj, function (result) {

                    let tmp = JSON.parse(result);

                    if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                        let currentRecord = JSON.parse(data[0].display_record),
                            currentCompoundParts = currentRecord.display_record.parts;

                        let updatedParts = tmp.display_record.parts.filter(function (elem) {

                            for (let i = 0; i < currentCompoundParts.length; i++) {

                                if (elem.title === currentCompoundParts[i].title) {
                                    elem.caption = currentCompoundParts[i].caption;
                                    elem.object = currentCompoundParts[i].object;
                                    elem.thumbnail = currentCompoundParts[i].thumbnail;
                                    return elem;
                                }
                            }

                        });

                        delete tmp.display_record.parts;
                        delete tmp.compound;

                        if (currentCompoundParts !== undefined) {
                            tmp.display_record.parts = updatedParts;
                            tmp.compound = updatedParts;
                        }

                        obj.display_record = JSON.stringify(tmp);

                    } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                        obj.display_record = result;

                    }

                    DB(REPO_OBJECTS)
                        .where({
                            sip_uuid: obj.sip_uuid
                        })
                        .update({
                            display_record: obj.display_record
                        })
                        .then(function (data) {

                            if (data === 1) {
                                obj.is_published = recordObj.is_published;
                                callback(null, obj);
                            } else {
                                obj.updated = false;
                                callback(null, obj);
                            }

                        })
                        .catch(function (error) {
                            LOGGER.module().error('ERROR: [/import/model module (update_collection_metadata_record/update_display_record)] Unable to update display record ' + error);
                            obj.updated = false;
                            callback(null, obj);
                        });
                });

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/import/model module (update_collection_metadata_record/update_display_record)] Unable to get mods ' + error);
                throw 'FATAL: [/import/model module (update_collection_metadata_record/update_display_record)] Unable to get mods ' + error;
            });
    }

    // 6.)
    function update_admin_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        // update admin index
        (async() => {

            let data = {
                'sip_uuid': obj.sip_uuid
            };

            let response = await HTTP.post({
                endpoint: '/api/admin/v1/indexer',
                data: data
            });

            if (response.error === true) {
                LOGGER.module().error('ERROR: [/import/model module (update_collection_metadata_record/update_admin_index)] http error');
                obj.public_index = false;
            } else {
                obj.admin_index = true;
            }

            callback(null, obj);
            return false;

        })();
    }

    function update_public_index(obj, callback) {

        if (obj.session === null || obj.updated === false || obj.admin_index === false || obj.error === true) {
            callback(null, obj);
            return false;
        }

        if (obj.is_published === 1) {

            // update public index
            (async() => {

                let data = {
                    'sip_uuid': obj.sip_uuid,
                    'publish': true
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_collection_metadata_record/update_public_index)] http error');
                    obj.public_index = false;
                } else {
                    obj.public_index = true;
                }

                callback(null, obj);
                return false;

            })();
        }
    }

    ASYNC.waterfall([
        get_token,
        get_uri,
        get_mods,
        update_mods,
        update_display_record,
        update_admin_index,
        update_public_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/model module (update_collection_metadata_record/async.waterfall)] ' + error);
        }

        if (results.session !== null) {

            (async() => {

                let data = {
                    'session': results.session
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/import/metadata/session/destroy',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_collection_metadata_record/async.waterfall)] Unable to terminate session');
                }

            })();
        }

        callback({
            status: 201
        });
    });
};

/**
 * Updates mods
 * @param sip_uuid
 * @param mods
 * @param callback
 */
const update_db_mods = function (sip_uuid, mods, callback) {

    DB(REPO_OBJECTS)
        .where({
            sip_uuid: sip_uuid
        })
        .update({
            mods: mods
        })
        .then(function (data) {

            let updated = false;

            if (data === 1) {
                updated = true;
            }

            callback(updated);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/model module (update_db_mods)] unable to update mods ' + error);
            throw 'FATAL: [/import/model module (update_db_mods)] unable to update mods ' + error;
        });
};

/** TODO:...
 * logs update to db
 * @param obj
 * @param callback
 */
const metadata_update_logs = function (obj, callback) {

    let log = {};
        // obj.mods;

    /*
    DBQ(UPDATE_LOGS)
        .insert(log)
        .then(function (data) {
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/service module (metadata_update_logs)] unable to save update log' + error);
            throw 'FATAL: [/import/service module (metadata_update_logs)] unable to save update log ' + error;
        });
        */
};

/**
 * Gets incomplete records in repo
 * @param req
 * @param callback
 */
exports.get_import_incomplete = function (req, callback) {

    DB(REPO_OBJECTS)
        .select('id', 'sip_uuid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'checksum', 'object_type', 'created')
        .orWhere('thumbnail', null)
        .orWhere('file_name', null)
        .orWhere('file_size', null)
        .orWhere('checksum', null)
        .orWhere('mods', null)
        .orWhere('display_record', null)
        .orderBy('created', 'desc')
        .then(function (data) {

            callback({
                status: 200,
                message: 'Incomplete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/model module (get_import_incomplete)] unable to get incomplete records ' + error);
            throw 'FATAL: [/import/model module (get_import_incomplete)] unable to get incomplete records ' + error;
        });
};

/**
 * Gets daily completed records list
 * @param req
 * @param callback
 */
exports.get_import_complete = function (req, callback) {

    DB(REPO_OBJECTS)
        .select('id', 'sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'created')
        .whereRaw('DATE(created) BETWEEN NOW() - INTERVAL 30 DAY AND NOW()')
        .where({
            is_active: 1,
            is_complete: 1,
            object_type: 'object'
        })
        .orderBy('created', 'desc')
        .then(function (data) {

            callback({
                status: 200,
                message: 'Complete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error);
            throw 'FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error;
        });
};