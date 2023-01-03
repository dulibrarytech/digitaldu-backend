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
const CREATE_COLLECTION_TASKS = require('../repository/tasks/create_collection_tasks');
const UPDATE_THUMBNAIL_URL_TASKS = require('../repository/tasks/update_thumbnail_url_tasks');
const PUBLISH_COLLECTION_RECORD_TASKS = require('../repository/tasks/publish_collection_record_tasks');
const PUBLISH_CHILD_RECORD_TASKS = require('../repository/tasks/publish_child_record_tasks');
const SUPPRESS_COLLECTION_RECORD_TASKS = require('../repository/tasks/suppress_collection_record_tasks');
const SUPPRESS_CHILD_RECORD_TASKS = require('../repository/tasks/suppress_child_record_tasks');
const INDEX_RECORD_TASKS = require('../repository/tasks/index_record_tasks');
const DELETE_RECORD_TASKS = require('../repository/tasks/delete_record_tasks');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const REPO_OBJECTS = DB_TABLES.repo.repo_objects;
const ARCHIVEMATICA_CONFIG = require('../config/archivematica_config')();
const ARCHIVEMATICA = require('../libs/archivematica');
const ARCHIVESSPACE_CONFIG = require('../config/archivesspace_config')();
const ARCHIVESSPACE = require('../libs/archivesspace');
const LOGGER = require('../libs/log4');

/**
 * Gets metadata display record
 * @param uuid
 * @param callback
 */
exports.get_display_record = (uuid, callback) => {

    (async () => {

        const INDEX_RECORD_TASK = new INDEX_RECORD_TASKS(uuid, DB, REPO_OBJECTS);
        const data = await INDEX_RECORD_TASK.get_index_record_data();

        callback({
            status: 200,
            message: 'Display record retrieved.',
            data: data
        });
    })();
};

/** TODO: remove test code
 * Creates repository collection record
 * @param uri
 * @param is_member_of_collection
 * @param callback
 * @returns callback
 */
exports.create_collection_record = (uri, is_member_of_collection, callback) => {

    const URI = VALIDATOR.unescape(uri);
    const ARCHIVESSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
    const TASKS = new CREATE_COLLECTION_TASKS(DB, REPO_OBJECTS, ARCHIVESSPACE_LIB);

    (async () => {

        try {

            let obj = {};
            let is_saved = false;
            let token;
            let is_duplicate = await TASKS.check_uri(URI);

            if (is_duplicate === true) {

                callback({
                    status: 200,
                    message: 'Collection already exists.'
                });

                return false;
            }

            obj.is_member_of_collection = is_member_of_collection;
            obj.uri = URI;
            token = await TASKS.get_session_token();
            obj.metadata = await TASKS.get_resource_record(URI, token);

            if (obj.metadata === 'false') {
                // TODO: log
                callback({
                    status: 200,
                    message: 'Unable to get metadata',
                });

                return false;

            } else {

                obj.uuid = await TASKS.create_uuid();
                obj.handle = 'https://test-handle.net/' + obj.uuid; // await TASKS.create_handle(obj.uuid);
                obj.display_record = await JSON.stringify(TASKS.create_index_record(obj));
                is_saved = await TASKS.save_record(obj);

                console.log('IS_SAVED: ', is_saved);

                if (is_saved === true) {
                    // await TASKS.index_record(obj.uuid);
                } else {
                    // LOG
                }

                callback({
                    status: 201,
                    message: 'Collection record created',
                    data: {uuid: obj.uuid}
                });
            }

            // TODO:
            console.log(obj);
            return false;

        } catch (error) {

            callback({
                status: 200,
                message: 'Unable to create collection record ' + error.message
            });
        }

    })();
};

/** TODO: rename display record to index record
 * Updates thumbnail url
 * @param uuid
 * @param thumbnail_url
 * @param callback
 */
exports.update_thumbnail_url = (uuid, thumbnail_url, callback) => {

    const THUMBNAIL_URL = VALIDATOR.unescape(thumbnail_url);
    const TASKS = new UPDATE_THUMBNAIL_URL_TASKS(uuid, THUMBNAIL_URL, DB, REPO_OBJECTS);

    (async () => {

        try {

            let data;
            let display_record;

            // TODO: refactor
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
exports.publish = (uuid, type, callback) => {

    const COLLECTION_TASKS = new PUBLISH_COLLECTION_RECORD_TASKS(uuid, DB, REPO_OBJECTS);
    const CHILD_RECORD_TASKS = new PUBLISH_CHILD_RECORD_TASKS(uuid, DB, REPO_OBJECTS); // .Publish_child_record_tasks
    const INDEX_RECORD_TASK = new INDEX_RECORD_TASKS(uuid, DB, REPO_OBJECTS);

    (async () => {

        let response;

        if (type === 'collection') {

            await COLLECTION_TASKS.update_collection_status(1);
            INDEX_RECORD_TASK.update();
            await CHILD_RECORD_TASKS.update_child_records_status(1);
            CHILD_RECORD_TASKS.update_child_display_records();
            CHILD_RECORD_TASKS.reindex_child_records();

            setTimeout(async () => {
                await COLLECTION_TASKS.publish();
                await CHILD_RECORD_TASKS.publish_child_records();
                LOGGER.module().info('INFO: [/repository/model module (publish_record)] Collection published');
                LOGGER.module().info('INFO: [/repository/model module (publish_record)] Child records published');
            }, 60000 * 5);

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

                setTimeout(() => {
                    CHILD_RECORD_TASKS.publish();
                }, 4000);

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

/**
 * Suppress record(s)
 * @param uuid
 * @param type
 * @param callback
 */
exports.suppress = (uuid, type, callback) => {

    const COLLECTION_TASK = new SUPPRESS_COLLECTION_RECORD_TASKS(uuid, DB, REPO_OBJECTS);
    const CHILD_TASK = new SUPPRESS_CHILD_RECORD_TASKS(uuid, DB, REPO_OBJECTS);
    const DISPLAY_RECORD_TASK = new DISPLAY_RECORD_TASKS(uuid, DB, REPO_OBJECTS);

    (async () => {

        let response;

        if (type === 'collection') {

            let result = await COLLECTION_TASK.suppress_collection_record();

            if (result.error === true) {

                response = {
                    status: 200,
                    message: 'Collection is already suppressed',
                    data: []
                }

                callback(response);
                return false;
            }

            await COLLECTION_TASK.update_collection_status(0);
            DISPLAY_RECORD_TASK.update(); // updates collection display record
            await CHILD_TASK.update_child_record_status(type, 0);
            await CHILD_TASK.suppress_child_records(type); // removes child records from public index and updates display records
            CHILD_TASK.reindex_child_records(type);
            COLLECTION_TASK.reindex_collection_record();

            response = {
                status: 201,
                message: 'Collection suppressed',
                data: []
            }

        } else if (type === 'object') {

            try {

                const REINDEX_TASK = new PUBLISH_CHILD_RECORD_TASKS(uuid, DB, REPO_OBJECTS);
                await CHILD_TASK.update_child_record_status(type, 0);
                await CHILD_TASK.suppress_child_records(type);
                REINDEX_TASK.reindex_child_records(type);

                response = {
                    status: 201,
                    message: 'Record suppressed',
                    data: []
                }

            } catch (error) {
                // TODO: log
                console.log(error);
            }


        } else {
            response = {
                status: 200,
                message: 'Unable to determine record type',
                data: []
            }
        }

        callback(response);

    })();
};

/**
 * Rebuilds display record
 * @param uuid
 * @param callback
 */
exports.rebuild_display_record = (uuid, callback) => {

    const task = new DISPLAY_RECORD_TASKS(DB, REPO_OBJECTS, uuid);
    task.update();

    callback({
        status: 201,
        message: 'Display record(s) updated'
    });
};

/** // TODO: test
 * Deletes repository record (DB, Index, and creates archivematica delete request)
 * @param uuid
 * @param delete_reason
 * @param callback
 */
exports.delete_record = (uuid, delete_reason, callback) => {

    (async () => {

        const TASK = new DELETE_RECORD_TASKS(uuid, delete_reason, DB, REPO_OBJECTS);
        let ARCHIVEMATICA_LIB = new ARCHIVEMATICA(ARCHIVEMATICA_CONFIG);
        let is_published = await TASK.check_if_published(); // delete only if object is not published

        if (is_published === 1) {
            callback({
                status: 200,
                message: 'Published records cannot be deleted.'
            });

            return false;
        }

        await TASK.set_to_inactive();
        await TASK.delete_from_index();
        // TASK.delete_aip_request(ARCHIVEMATICA_LIB); // TODO: ingest test record

        callback({
            status: 204,
            message: 'Delete object.'
        });

    })();
};
