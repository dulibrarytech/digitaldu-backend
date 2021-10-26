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
    REPO_OBJECTS = 'tbl_objects',
    CACHE = require('../libs/cache');

/**
 * Batch updates all metadata records in the repository via ArchivesSpace
 * @param req
 * @param callback
 */
exports.batch_update_metadata = function (req, callback) {

    function reset_update_flags(callback) {

        let obj = {};

        if (req.body.status === 'IN_PROGRESS') {
            obj.status = 'IN_PROGRESS';
            callback(null, obj);
            return false;
        }

        let whereObj = {};
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
                LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/reset_update_flags)] ' + error);
                throw 'ERROR: [/import/model module (batch_update_metadata/reset_update_flags)] ' + error;
            });
    }

    function get_batch_records(obj, callback) {

        DB(REPO_OBJECTS)
            .select('sip_uuid')
            .limit(10)  // TODO: test
            .where({
                object_type: 'object',
                is_active: true,
                is_updated: 0
                // is_compound: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    obj.status = 'COMPLETE';
                    callback(null, obj);
                    return false;
                }

                obj.batch = data;
                callback(null, obj);
                return false;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/get_batch_records)] ' + error);
                throw 'ERROR: [/import/model module (batch_update_metadata/get_batch_records)] ' + error;
            });
    }

    function flag_records(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        for (let i = 0; i < obj.batch.length; i++) {

            DB(REPO_OBJECTS)
                .where({
                    sip_uuid: obj.batch[i].sip_uuid
                })
                .update({
                    is_updated: 1
                })
                .then(function (data) {
                    return false;
                })
                .catch(function (error) {
                    LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/reset_update_flags)] ' + error);
                    throw 'ERROR: [/import/model module (batch_update_metadata/reset_update_flags)] ' + error;
                });
        }

        callback(null, obj);
    }

    function get_db_mods(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        let modsArr = [];
        let timer = setInterval(function () {

            if (obj.batch.length === 0) {
                clearInterval(timer);
                obj.modsArr = modsArr;
                callback(null, obj);
                return false;
            }

            let record = obj.batch.pop();

            DB(REPO_OBJECTS)
                .select('mods_id', 'mods')
                .where({
                    sip_uuid: record.sip_uuid,
                    object_type: 'object',
                    is_active: 1
                })
                .then(function (data) {

                    if (data.length === 0) {
                        LOGGER.module().info('INFO: no record found for ' + obj.sip_uuid);
                        return false;
                    }

                    let modsObj = {};
                    modsObj.sip_uuid = record.sip_uuid;
                    modsObj.mods_id = data[0].mods_id;
                    modsObj.prev_mods = data[0].mods;
                    modsArr.push(modsObj);
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/import/model module (update_object_metadata_record/get_db_mods)] unable to get mods ' + error);
                    throw 'FATAL: [/import/model module (update_object_metadata_record/get_db_mods)] unable to get mods ' + error;
                });

        }, 100);
    }

    function get_token(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        (async() => {

            let response = await HTTP.get({
                endpoint: '/api/admin/v1/import/metadata/session'
            });

            if (response.error === true) {
                obj.session = null;
            } else {
                obj.session = response.data.session;
                LOGGER.module().info('INFO: ArchivesSpace session initiated.');
                callback(null, obj);
            }

            return false;

        })();
    }

    function get_as_mods(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        let updates = [];
        let timer = setInterval(function () {

            if (obj.modsArr.length === 0) {
                clearInterval(timer);
                obj.updates = updates;
                callback(null, obj);
                return false;
            }

            let mods = obj.modsArr.pop();
            let modsObj = {};

            modsObj.session = obj.session;
            modsObj.mods_id = mods.mods_id;

            SERVICE.get_mods(modsObj, function (data) {

                if (data.error === true) {
                    obj.session = null;
                    return false;
                }

                if (mods.prev_mods === data.mods) {

                    LOGGER.module().info('INFO: no update required for record ' + mods.sip_uuid);

                } else {

                    LOGGER.module().info('INFO: update required for record ' + mods.sip_uuid);

                    let updatesObj = {
                        sip_uuid: mods.sip_uuid,
                        mods: data.mods
                    };

                    updates.push(updatesObj);
                }
            });

        }, 10000); // TODO: get from config
    }

    function mods_db_updates(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        if (obj.updates.length === 0) {
            callback(null, obj);
            return false;
        }

        for (let i = 0; i < obj.updates.length; i++) {

            DB(REPO_OBJECTS)
                .where({
                    sip_uuid: obj.updates[i].sip_uuid
                })
                .update({
                    mods: obj.updates[i].mods
                })
                .then(function (data) {
                    return false;
                })
                .catch(function (error) {
                    LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/mods_db_updates)] ' + error);
                    throw 'ERROR: [/import/model module (batch_update_metadata/mods_db_updates)] ' + error;
                });
        }

        callback(null, obj);
    }

    function display_record_updates(obj, callback) {

        if (obj.status === 'COMPLETE') {
            callback(null, obj);
            return false;
        }

        if (obj.updates.length === 0) {
            callback(null, obj);
            return false;
        }

        let timer = setInterval(function() {

            if (obj.updates.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let record = obj.updates.pop();
            let sip_uuid = record.sip_uuid;
            let mods = record.mods;

            // TODO: test
            MODS.get_display_record_data(sip_uuid, function(recordObj) {

                console.log('recordObj: ', recordObj);

                // override mods property
                recordObj.mods = mods;
                // TODO: object property is being deleted here
                MODS.create_display_record(recordObj, function (result) {

                    let tmp = JSON.parse(result);
                    let display_record;

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

                        display_record = JSON.stringify(tmp);

                    } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {
                        display_record = result;
                    }

                    let where_obj = {
                        sip_uuid: sip_uuid
                    };

                    MODS.update_display_record(where_obj, display_record, function(result) {
                        console.log('update_display_record: ', result);
                        update_index(sip_uuid, recordObj.is_published);
                    });

                    // TODO: move to function
                    /*
                    DB(REPO_OBJECTS)
                        .where({
                            sip_uuid: sip_uuid
                        })
                        .update({
                            display_record: display_record
                        })
                        .then(function (data) {

                            if (data === 1) {
                                LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/display_record_updates)] ' + sip_uuid + ' display record updated');
                                update_index(sip_uuid, recordObj.is_published);
                            }

                            return null;
                        })
                        .catch(function (error) {
                            LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/display_record_updates)] unable to update display record ' + error);
                        });

                     */
                });
            });

            /*
            DB(REPO_OBJECTS)
                .select('*')
                .where({
                    sip_uuid: sip_uuid,
                    is_active: 1
                })
                .then(function (data) {

                    if (data.length === 0) {
                        LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/display_record_updates)] unable to update display record');
                        return false;
                    }

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
                    recordObj.transcript = data[0].transcript;
                    recordObj.is_published = data[0].is_published;
                    recordObj.mods = mods;

                    MODS.create_display_record(recordObj, function (result) {

                        let tmp = JSON.parse(result);
                        let display_record;

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

                            display_record = JSON.stringify(tmp);

                        } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {
                            display_record = result;
                        }

                        DB(REPO_OBJECTS)
                            .where({
                                sip_uuid: sip_uuid
                            })
                            .update({
                                display_record: display_record
                            })
                            .then(function (data) {

                                if (data === 1) {
                                    LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/display_record_updates)] ' + sip_uuid + ' display record updated');
                                    update_index(sip_uuid, recordObj.is_published);
                                }

                                return null;
                            })
                            .catch(function (error) {
                                LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/display_record_updates)] unable to update display record ' + error);
                            });
                    });

                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/import/model module (update_object_metadata_record/display_record_updates)] Unable to get display record ' + error);
                    throw 'FATAL: [/import/model module (update_object_metadata_record/display_record_updates)] Unable to get display record ' + error;
                });

             */

        }, 500);
    }

    function update_index(sip_uuid, is_published) {

        // update admin index
        (async() => {

            let data = {
                'sip_uuid': sip_uuid
            };

            let response = await HTTP.post({
                endpoint: '/api/admin/v1/indexer',
                data: data
            });

            if (response.error === true) {
                LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/update_admin_index)] indexer error');
            } else {
                LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_admin_index)] ' + sip_uuid + ' indexed');
            }

            return false;

        })();

        if (is_published === 1) {

            // update public index
            (async () => {

                let data = {
                    'sip_uuid': sip_uuid,
                    'publish': true
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_object_metadata_record/update_public_index)] indexer error');
                } else {
                    LOGGER.module().info('INFO: [/import/model module (update_object_metadata_record/update_public_index)] ' + sip_uuid + ' indexed');
                }

                return false;

            })();
        }
    }

    ASYNC.waterfall([
        reset_update_flags,
        get_batch_records,
        flag_records,
        get_db_mods,
        get_token,
        get_as_mods,
        mods_db_updates,
        display_record_updates
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/model module (batch_update_metadata/async.waterfall)] ' + error);
            throw 'ERROR: [/import/model module (batch_update_metadata/async.waterfall)] ' + error;
        }

        (async() => {

            let data = {
                'session': results.session
            };

            let response = await HTTP.post({
                endpoint: '/api/admin/v1/import/metadata/session/destroy',
                data: data
            });

            if (response.error === true) {
                LOGGER.module().error('ERROR: [/import/model module (update_metadata_record/async.waterfall)] Unable to terminate session');
            } else {
                LOGGER.module().info('INFO: ArchivesSpace session terminated.');
            }

            return false;

        })();

        if (results.status === 'COMPLETE') {
            LOGGER.module().info('INFO: [/import/model module (batch_update_metadata/async.waterfall)] metadata records updated');
            return false;
        }

        setTimeout(function() {

            (async() => {

                let data = {
                    status: 'IN_PROGRESS'
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/import/metadata/batch?api_key=' + CONFIG.apiKey + '&',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/model module (update_metadata_record)] Unable to make request');
                } else {
                    LOGGER.module().info('INFO: Batch request made');
                }

                return false;

            })();

        }, 1000);
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

        MODS.get_display_record_data(obj.pid, function (recordObj) {

            MODS.create_display_record(recordObj, function (result) {

                /* TODO: result code from repository/model
                let tmp = JSON.parse(result);

                if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                    let currentRecord = JSON.parse(data[0].display_record),
                        currentCompoundParts = currentRecord.display_record.parts;

                    delete tmp.display_record.parts;
                    delete tmp.compound;

                    if (currentCompoundParts !== undefined) {
                        tmp.display_record.parts = currentCompoundParts;
                        tmp.compound = currentCompoundParts;
                    }

                    obj.display_record = JSON.stringify(tmp);

                } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {
                    obj.display_record = result;
                }

                 */
                // TODO: compare code (above/below) repository/model and import/model
                // TODO:... test
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

                let where_obj = {
                    sip_uuid: obj.sip_uuid
                };

                MODS.update_display_record(where_obj, obj.display_record, function (result) {

                    if (result.error === true) {
                        LOGGER.module().error('ERROR: [/import/model module (create_display_record)] unable to update display record.');
                        obj.updated = false;
                        callback({
                            error: true,
                            error_message: 'ERROR: [/import/model module (create_display_record)] unable to update display record.'
                        });
                    }

                    obj.is_published = recordObj.is_published;

                });
            });
        });

        /////////////////////

        // TODO: refactor
        /*
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

         */
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

/**
 * Gets completed imports for the past 30 days
 * @param req
 * @param callback
 */
exports.get_import_complete = function (req, callback) {

    DB(REPO_OBJECTS)
        .select('id', 'sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'is_published', 'created')
        .whereRaw('DATE(created) BETWEEN NOW() - INTERVAL 30 DAY AND NOW()')
        .where({
            is_active: 1,
            is_complete: 1,
            object_type: 'object'
        })
        .orderBy('created', 'asc')
        .then(function (data) {

            let response = [];

            // Get collection names
            let timer = setInterval(function() {

                if (data.length === 0) {
                    clearInterval(timer);

                    callback({
                        status: 200,
                        message: 'Complete records.',
                        data: response
                    });

                    return false;
                }

                let record = data.pop();

                DB(REPO_OBJECTS)
                    .select( 'mods')
                    .where({
                        pid: record.is_member_of_collection,
                        object_type: 'collection'
                    })
                    .then(function (collection_obj) {
                        let mods = JSON.parse(collection_obj[0].mods);
                        record.collection_title = mods.title;
                        response.push(record);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });

            }, 10);

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error);
            throw 'FATAL: [/import/model module (get_import_complete)] unable to get complete records ' + error;
        });
};