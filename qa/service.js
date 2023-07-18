/**

 Copyright 2023 University of Denver

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

// const HTTP = require('axios');
const HTTP = require('../libs/http');
const REPOSITORY_ENDPOINTS = require('../repository/endpoints');
const CONFIG = require('../config/webservices_config')();
const APP_CONFIG = require('../config/app_config')();
const TOKEN_CONFIG = require('../config/token_config')();
const QA_SERVICE_TASKS = require('../qa/tasks/service_tasks');
const COLLECTION_TASKS = require('../qa/tasks/check_collection_tasks');
const HELPER_TASKS = require('../libs/helper');
const ARCHIVESSPACE_CONFIG = require('../config/archivesspace_config')();
const ARCHIVESSPACE = require('../libs/archivesspace');
const DB = require('../config/db_config')();
const DB_QUEUE = require('../config/dbqueue_config')();
const DB_TABLES = require('../config/db_tables_config')();
const TABLE = DB_TABLES.repo_queue.repo_qa_queue;
const REPO = DB_TABLES.repo.repo_objects;
const QA_TASK = new QA_SERVICE_TASKS(CONFIG);
const COLLECTION_TASK = new COLLECTION_TASKS(DB, REPO);
const HELPER = new HELPER_TASKS();
const ARCHIVESSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
const TIMEOUT = 60000 * 15;
const LOGGER = require('../libs/log4');

/**
 * Gets list of ready folders
 * @param callback
 */
exports.get_folder_list = (callback) => {

    (async () => {

        try {

            let qa_response = await QA_TASK.get_folder_list();

            if (qa_response !== false) {
                callback({
                    status: 200,
                    data: qa_response
                });
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (get_list_ready)] request to QA server failed - ' + error.message);
            callback({
                status: 500
            });
        }

    })();
};

/**
 * Executes QA processes on designated folder
 * @param folder
 * @param callback
 */
exports.run_qa = (folder, callback) => {

    (async () => {

        try {

            const QA_UUID = HELPER.create_uuid();
            let result = await QA_TASK.set_folder_name(folder);
            let queue_record = {};
            let is_queue_record_created;
            let folder_name_check_results;
            let is_package_name_checked;
            let is_file_name_checked;
            let is_uri_txt_checked;
            let uri_txt;
            let total_batch_size_results;
            let batch_size_results;
            let uris;
            let is_metadata_checked;
            let collection_exists;

            if (result.is_set === false) {
                // stop process
                // log
                // update log - INGEST_STOPPED
                return false;
            }

            let tmp = folder.split('-');
            let collection_uri = tmp[tmp.length - 1];
            queue_record.uuid = QA_UUID;
            queue_record.collection_folder = folder;
            is_queue_record_created = await QA_TASK.create_qa_queue_record(DB_QUEUE, TABLE, queue_record);

            if (is_queue_record_created === false || is_queue_record_created === undefined) {
                // // stop process
                // // log
                // // attempt to update log - INGEST_STOPPED
                return false;
            }

            folder_name_check_results = await QA_TASK.check_folder_name(folder);
            queue_record.collection_folder_name_results = JSON.stringify(folder_name_check_results);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            total_batch_size_results = await QA_TASK.get_total_batch_size(folder);
            batch_size_results = HELPER.format_bytes(total_batch_size_results.total_batch_size.result);
            queue_record.total_batch_size_results = JSON.stringify(batch_size_results);

            if (batch_size_results.size_type === 'GB' && batch_size_results.batch_size > 200) {
                queue_record.errors = 'This batch is too large.  Batch size cannot exceed 200GB';
                return false;
            }

            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            is_package_name_checked = await QA_TASK.check_package_names(folder);
            queue_record.package_names_results = JSON.stringify(is_package_name_checked);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            is_file_name_checked = await QA_TASK.check_file_names(folder);
            queue_record.file_names_results = JSON.stringify(is_file_name_checked);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            is_uri_txt_checked = await QA_TASK.check_uri_txt(folder);
            queue_record.uri_txt_results = JSON.stringify(is_uri_txt_checked);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            uri_txt = await QA_TASK.get_uri_txt(folder);
            queue_record.uri_txt_results = JSON.stringify(uri_txt);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

            uris = await QA_TASK.get_metadata_uris(DB_QUEUE, TABLE, QA_UUID);
            is_metadata_checked = await QA_TASK.check_metadata(DB_QUEUE, TABLE, QA_UUID, ARCHIVESSPACE_LIB, JSON.parse(uris.uri_txt_results));

            if (is_metadata_checked === false) {
                // TODO:
                return false;
            }

            collection_exists = await COLLECTION_TASK.check_collection('/repositories/2/' + collection_uri.replace('_', '/'));
            console.log('collection exists: ', collection_exists);

            if (collection_exists === false) {
                // TODO: save status to queue
                // TODO: log
                queue_record.collection_results = collection_exists;
                await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);

                try {

                    let endpoint = REPOSITORY_ENDPOINTS().repository.repo_records.endpoint;
                    let url = `${APP_CONFIG.api_url}${endpoint}?api_key=${TOKEN_CONFIG.api_key}`;
                    let response = await HTTP.request({
                        method: 'POST',
                        url: url,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: {
                            uri: '/repositories/2/' + collection_uri.replace('_', '/'),
                            is_member_of_collection: 'root'
                        }
                    });

                    console.log(response.status);
                    console.log(response.data);

                    if (response.status === 201) {
                        console.log('201');
                    }
                } catch(error) {
                    console.log(error);
                }

            } else {
                // TODO: update qa status
            }

            queue_record.collection_results = collection_exists.status;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);
            console.log('QA Complete');

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] request to QA server failed - ' + error.message);
        }

    })();

    callback({
        status: 200,
        message: 'QA running on ingest folder ' + folder
    });
};

/**
 * Checks QA status
 */
exports.qa_status = async (callback) => {
    callback({
        status: 200,
        data: await QA_TASK.qa_status(DB_QUEUE, TABLE)
    });
}

/**
 * moves folder from ready to ingest folder
 * @param uuid
 * @param folder
 * @param callback
 */
exports.move_to_ingest = (uuid, folder, callback) => {

    (async () => {

        try {

            let is_moved = QA_TASK.move_to_ingest(uuid, folder);
            console.log('move to ingest: ', is_moved);

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] request to QA server failed - ' + error);
            callback({
                status: 500
            });
        }

    })();
};

/**
 * moves packages to Archivematica sftp server
 * @param uuid
 * @param folder
 * @param callback
 */
exports.move_to_sftp = function (uuid, folder, callback) {

    (async () => {

        try {

            let is_moved = QA_TASK.move_to_sftp(uuid, folder);
            console.log('move to sftp: ', is_moved);

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (move_to_sftp)] move to sftp failed - ' + error);
            callback({
                status: 500
            });
        }

    })();

    callback({
        status: 200,
        message: 'Uploading packages to sftp.',
        data: []
    });
};

/** TODO: move to task
 * Checks sftp upload status
 * @param req
 * @param callback
 */
exports.sftp_upload_status = function (req, callback) {

    let pid = req.query.pid;
    let total_batch_file_count = req.query.total_batch_file_count;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/upload-status?pid=' + pid + '&total_batch_file_count=' + total_batch_file_count + '&api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                callback({
                    status: 200,
                    message: 'Checking sftp upload status.',
                    data: response.data
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (upload_status)] request to QA server failed - ' + error);
            return false;
        }

    })();
};