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
    VALIDATOR = require('validator'),
    DR = require('../libs/display-record'),
    ARCHIVEMATICA = require('../libs/archivematica'),
    CREATE_COLLECTION_TASKS = require('../repository/tasks/create_collection_tasks'),
    UPDATE_THUMBNAIL_URL_TASKS = require('../repository/tasks/update_thumbnail_url_tasks'),
    PUBLISH_COLLECTION_RECORD_TASKS = require('../repository/tasks/publish_collection_record_tasks'),
    PUBLISH_CHILD_RECORD_TASKS = require('../repository/tasks/publish_child_record_tasks'),
    DISPLAY_RECORD_TASKS = require('../repository/tasks/display_record_tasks'),
    SUPPRESS_RECORD_TASKS = require('../repository/tasks/suppress_record_tasks'),
    LOGGER = require('../libs/log4'),
    DB = require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Gets metadata display record
 * @param uuid
 * @param callback
 */
exports.get_display_record = function (uuid, callback) {
    DR.get_db_display_record_data(uuid, function (data) {
        callback({
            status: 200,
            message: 'Display record retrieved.',
            data: data
        });
    });
};

/**
 * Creates repository collection record
 * @param data (contains data.uri/data.is_member_of_collection)
 * @param callback
 * @returns callback
 */
exports.create_collection_record = (data, callback) => {

    if (data.uri === undefined || data.is_member_of_collection === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });
    }

    const URI = VALIDATOR.unescape(data.uri);
    const TASKS = new CREATE_COLLECTION_TASKS.Create_collection_tasks(DB, REPO_OBJECTS);

    (async () => {

        try {

            let obj = {};
            let token;
            let is_duplicate = await TASKS.check_uri(URI);

            if (is_duplicate === true) {

                callback({
                    status: 200,
                    message: 'Collection already exists.'
                });

                return false;
            }

            obj.is_member_of_collection = data.is_member_of_collection;
            obj.uri = URI;
            token = await TASKS.get_session_token();
            obj.metadata = await TASKS.get_resource_record(URI, token);
            obj.uuid = await TASKS.get_uuid(CONFIG.uuidDomain);
            obj.handle = await TASKS.create_handle(obj.uuid);
            obj.display_record = await TASKS.create_display_record(obj);
            TASKS.save_record(obj);
            await TASKS.index_record(obj.uuid);

            callback({
                status: 201,
                message: 'Collection record created',
                data: {uuid: obj.uuid}
            });

        } catch (error) {

            callback({
                status: 500,
                message: 'Unable to create collection record ' + error.message
            });
        }

    })();
};

/**
 * Updates thumbnail url
 * @param uuid
 * @param thumbnail_url
 * @param callback
 */
exports.update_thumbnail_url = (uuid, thumbnail_url, callback) => {

    const THUMBNAIL_URL = VALIDATOR.unescape(thumbnail_url);
    const TASKS = new UPDATE_THUMBNAIL_URL_TASKS.Update_thumbnail_url_tasks(uuid, THUMBNAIL_URL, DB, REPO_OBJECTS);

    (async () => {

        try {

            let data;
            let display_record;

            await TASKS.update_repo_record();
            data = await TASKS.get_display_record_data();
            display_record = await TASKS.create_display_record(data);
            await TASKS.update_display_record(display_record);
            await TASKS.reindex_display_record(JSON.parse(display_record));
            await TASKS.republish_display_record(JSON.parse(display_record));

            callback({
                status: 201,
                message: 'Thumbnail URL updated.'
            });

        } catch (error) {

            callback({
                status: 500,
                message: 'Unable to update thumbnail url ' + error.message
            });
        }

    })();
};

/**
 * Publishes record(s)
 * @param uuid
 * @param type
 * @param callback
 */
exports.publish_record = function (uuid, type, callback) {

    const COLLECTION_TASKS = new PUBLISH_COLLECTION_RECORD_TASKS.Publish_collection_record_tasks(uuid, DB, REPO_OBJECTS);
    const CHILD_RECORD_TASKS = new PUBLISH_CHILD_RECORD_TASKS.Publish_child_record_tasks(uuid, DB, REPO_OBJECTS);
    const DISPLAY_RECORD_TASK = new DISPLAY_RECORD_TASKS.Display_record_tasks(uuid);

    (async () => {

        let response;

        if (type === 'collection') {

            await COLLECTION_TASKS.update_collection_status(1);
            DISPLAY_RECORD_TASK.update();
            await CHILD_RECORD_TASKS.update_child_records_status(1);
            CHILD_RECORD_TASKS.reindex_child_records();
            await COLLECTION_TASKS.publish();
            await CHILD_RECORD_TASKS.publish_child_records();

            response = {
                status: 201,
                message: 'Collection Published',
                data: []
            };

        } else if (type === 'object') {

            let collection_uuid;
            let is_collection_published;
            let result;

            collection_uuid = await COLLECTION_TASKS.get_collection_uuid();
            is_collection_published = await COLLECTION_TASKS.check_collection_publish_status(collection_uuid);
            result = await CHILD_RECORD_TASKS.update_child_record(is_collection_published);

            if (result === true) {

                DISPLAY_RECORD_TASK.update();
                CHILD_RECORD_TASKS.publish();

                response = {
                    status: 201,
                    message: 'Object Published',
                    data: []
                }

            } else {

                response = {
                    status: 200,
                    message: 'Collection for record ' + uuid + ' is not published.  Child record cannot be published as a result',
                    data: []
                }
            }
        }

        callback(response);

    })();
};

/** TODO
 * Suppress record(s)
 * @param uuid
 * @param type
 * @param callback
 */
exports.suppress_record = function (uuid, type, callback) {

    const TASKS = new SUPPRESS_RECORD_TASKS.Suppress_record_tasks(uuid, DB, REPO_OBJECTS);

    (async () => {

        let response;

        if (type === 'collection') {

            await TASKS.suppress_collection_record();
            await TASKS.update_collection_status(0); // publish_record_tasks.js
            // TODO: update child records publish status to 0
            await TASKS.update_child_records_status(0); // publish_record_tasks.js

            // TODO: update child display records with publish status to 0
            // let data = await TASKS.get_display_record_data();
            // let display_record = await TASKS.create_display_record(data);
            // await TASKS.update_display_record(display_record);
            // await TASKS.reindex_display_record(JSON.parse(display_record));
            //

        } else if (type === 'object') {

        } else {

        }

        callback(response);

    })();
};

/** DEPRECATE
 * Unpublishes records
 * @param req
 * @param callback
 */
exports.unpublish_objects = function (req, callback) {

    const type = req.body.type,
        pid = req.body.pid;

    if (pid === undefined || pid.length === 0 || type === undefined) {
        return false;
    }

    // unpublish entire collection - remove record from public index
    function unpublish_collection(callback) {

        let obj = {};
        obj.is_member_of_collection = pid;

        del(obj.is_member_of_collection, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection)] unable to remove published record from index.');
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            callback(null, obj);
        });

        let pidObj = {};
        pidObj.pid = pid;

        update_display_record(pidObj, function () {
        });
    }

    // unpublish entire collection - unpublish objects
    function unpublish_collection_docs(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1,
                is_active: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        // remove objects from public index
                        del(record.sip_uuid, function (result) {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection_docs)] unable to remove published record from index.');
                            }

                            return false;
                        });

                        // update admin objects to unpublished status
                        update_fragment(record.sip_uuid, 0, function (result) {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/unpublish_collection_docs)] unable to update published status.');
                                obj.status = 'failed';
                            }

                            return false;
                        });

                        let pidObj = {};
                        pidObj.pid = record.sip_uuid;

                        update_display_record(pidObj, function () {
                        });

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 250);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                callback(null, obj);
            });
    }

    // unpublish entire collection - update indexed admin collection record
    function update_collection_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        update_fragment(obj.is_member_of_collection, 0, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update published status.');
                obj.status = 'failed';
            }

            callback(null, obj);
            return false;
        });
    }

    // update db record
    function update_collection_record(obj, callback) {

        DB(REPO_OBJECTS)
            .where({
                sip_uuid: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    // update db records
    function update_collection_object_records(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_child_objects)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    /*
     unpublish single objects
     */

    // unpublish single object - remove record from public index
    function unpublish_object(callback) {

        let obj = {};
        obj.pid = pid;

        if (obj.pid === undefined || obj.pid.length === 0) {
            return false;
        }

        del(obj.pid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index.');
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            callback(null, obj);
            return false;
        });
    }

    // unpublish single object - update indexed admin object record
    function update_object_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        update_fragment(obj.pid, 0, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/update_object_doc)] unable to update published status.');
                obj.status = 'failed';
            }

            callback(null, obj);
        });
    }

    // unpublish single object - update db record
    function update_object_record(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                pid: obj.pid,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/update_object_record)] unable to unpublish object ' + error);
                obj.status = 'failed';
                callback(null, obj);
            });
    }

    // unpublish collection and all of its objects
    if (type === 'collection') {

        ASYNC.waterfall([
            unpublish_collection,
            unpublish_collection_docs,
            update_collection_doc,
            update_collection_record,
            update_collection_object_records
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            LOGGER.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] collection unpublished');
        });

        callback({
            status: 201,
            message: 'Collection unpublished',
            data: []
        });

        return false;

    } else if (type === 'object') {

        ASYNC.waterfall([
            unpublish_object,
            update_object_doc,
            update_object_record,
            update_display_record
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            LOGGER.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] object unpublished');
        });

        callback({
            status: 201,
            message: 'Object unpublished',
            data: []
        });

        return false;

    } else {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }
};

/**
 * Recreates display record
 * @param req
 * @param callback
 */
exports.reset_display_record = function (req, callback) {

    if (req.body.pid === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    function create_display_record(callback) {

        let obj = {};
        let sip_uuid = req.body.pid;

        DR.get_display_record_data(sip_uuid, function (record) {

            DR.create_display_record(record, function (display_record) {

                let recordObj = JSON.parse(display_record);
                let where_obj = {
                    is_member_of_collection: recordObj.is_member_of_collection,
                    pid: recordObj.pid,
                    is_active: 1
                };

                DR.update_display_record(where_obj, display_record, function (result) {
                    obj.sip_uuid = recordObj.pid;
                    obj.is_published = recordObj.is_published;
                    callback(null, obj);
                });
            });
        });
    }

    function admin_index(obj, callback) {

        // update admin index
        index(obj.sip_uuid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] indexer error.');
                obj.admin_index = false;
                callback(null, obj);
                return false;
            }

            obj.admin_index = true;
            callback(null, obj);
            return false;
        });
    }

    function public_index(obj, callback) {

        if (obj.is_published === 1) {

            // update public index
            index(obj.sip_uuid, function (result) {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] indexer error.');
                    obj.public_index = false;
                    callback(null, obj);
                    return false;
                }

                obj.public_index = true;
                callback(null, obj);
                return false;
            });

        } else {
            obj.public_index = false;
            callback(null, obj);
        }
    }

    ASYNC.waterfall([
        create_display_record,
        admin_index,
        public_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        LOGGER.module().info('INFO: [/repository/model module (reset_display_record/async.waterfall)] display record reset');

        callback({
            status: 201,
            message: 'Display record(s) updated.'
        });
    });
};

/**
 * Deletes repository object (DB, Index, and creates archivematica delete request)
 * @param req
 * @param callback
 */
exports.delete_object = function (req, callback) {

    let pid = req.body.pid;
    let delete_reason = req.body.delete_reason;

    function check_if_published(callback) {

        let obj = {};
        obj.pid = pid;
        obj.delete_reason = delete_reason;

        DB(REPO_OBJECTS)
            .count('is_published as is_published')
            .where({
                pid: obj.pid,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                // delete only if object is not published
                if (data[0].is_published === 0) {
                    obj.is_published = false;
                } else {
                    obj.is_published = true;
                }

                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error;
            });
    }

    function delete_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                pid: obj.pid
            })
            .update({
                is_active: 0
            })
            .then(function (data) {

                if (data === 1) {
                    callback(null, obj);
                }
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object)] unable to delete record ' + error;
            });
    }

    function unindex_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        unindex(obj.pid, function (result) {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index.');
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            callback(null, obj);
        });
    }

    function delete_aip_request(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        ARCHIVEMATICA.delete_aip_request(obj, function (result) {

            if (result.error === false) {

                let json = JSON.parse(result.data);
                obj.delete_id = json.id;

                DB(REPO_OBJECTS)
                    .where({
                        pid: obj.pid
                    })
                    .update({
                        delete_id: obj.delete_id
                    })
                    .then(function (data) {

                        if (data === 1) {
                            LOGGER.module().info('INFO: [/repository/model module (delete_object/delete_aip_request)] delete id ' + obj.delete_id + ' saved');
                            callback(null, obj);
                        }
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error);
                        throw 'FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error;
                    });

            } else {
                LOGGER.module().error('ERROR: [/repository/model module (delete_object/delete_aip_request)] unable to create delete aip request');
                obj.delete_id = false;
            }
        });
    }

    ASYNC.waterfall([
        check_if_published,
        delete_record,
        unindex_record,
        delete_aip_request
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] ' + error);
        }

        // delete link only appears when record is unpublished
        if (results.is_published === true) {

            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] Cannot delete published object. ');
            return false;
        }

        LOGGER.module().info('INFO: [/repository/model module (delete_object/async.waterfall)] object deleted.');
    });

    callback({
        status: 204,
        message: 'Delete object.'
    });
};

/**
 * Adds transcript to existing record and re-indexes
 * @param req
 * @param callback
 */
exports.save_transcript = function (req, callback) {

    let sip_uuid = req.body.sip_uuid;
    let transcript = req.body.transcript;

    if (sip_uuid === undefined || transcript === undefined) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });
    }

    DB(REPO_OBJECTS)
        .where({
            pid: sip_uuid
        })
        .update({
            transcript: transcript
        })
        .then(function (data) {

            if (data === 1) {

                LOGGER.module().info('INFO: [/repository/model module (add_transcript)] Transcript saved to DB');

                DR.get_db_display_record_data(sip_uuid, function (data) {

                    let record = JSON.parse(data[0].display_record);
                    record.transcript = transcript;

                    let where_obj = {
                        sip_uuid: sip_uuid,
                        is_active: 1
                    };

                    DR.update_display_record(where_obj, JSON.stringify(record), function (result) {

                        (async () => {

                            let data = {
                                'sip_uuid': sip_uuid,
                                'fragment': {
                                    doc: {
                                        transcript: transcript
                                    }
                                }
                            };

                            let response = await HTTP.put({
                                endpoint: '/api/admin/v1/indexer/update_fragment',
                                data: data
                            });

                            let result = {};

                            if (response.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (update_fragment)] unable to update transcript.');
                                result.error = true;
                            } else if (response.data.status === 201) {
                                result.error = false;
                            }

                            if (result.error === false) {

                                if (record.is_published === 1) {

                                    let match_phrase = {
                                        'pid': sip_uuid
                                    };

                                    setTimeout(function () {

                                        // moves updated record to public index if already published
                                        reindex(match_phrase, function (result) {

                                            if (result.error === true) {
                                                LOGGER.module().error('ERROR: [/repository/model module (save_transcript)] unable to copy record to public index.');
                                            }
                                        });

                                    }, 3000);
                                }

                                callback({
                                    status: 201,
                                    message: 'Transcript Saved.'
                                });

                            } else if (result.error === true) {
                                callback({
                                    status: 200,
                                    message: 'Transcript not Saved.'
                                });
                            }

                        })();
                    });
                });
            }
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/repository/model module (add_transcript)] Unable to save transcript ' + error);
            throw 'FATAL: [/repository/model module (add_transcript)] Unable to save transcript ' + error;
        });
};