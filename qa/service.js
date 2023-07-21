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

const CONFIG = require('../config/webservices_config')();
const APP_CONFIG = require('../config/app_config')();
const TOKEN_CONFIG = require('../config/token_config')();
const HELPER = require('../qa/helper');
const HELPER_TASKS = require('../libs/helper');
const QA_SERVICE_TASKS = require('../qa/tasks/qa_service_tasks');
const DB_QUEUE = require('../config/dbqueue_config')();
const DB_TABLES = require('../config/db_tables_config')();
const TABLE = DB_TABLES.repo_queue.repo_qa_queue;
const QA_TASK = new QA_SERVICE_TASKS(CONFIG);
const HELPER_LIB = new HELPER_TASKS();
const LOGGER = require('../libs/log4');
const SERVICE_HELPER = new HELPER();

/**
 * Runs qa processes
 * @type {QA_service}
 */
const QA_service = class {

    constructor() {
    }

    /**
     * Gets list of ready folders
     */
    async get_folder_list() {

        try {

            const qa_response = await QA_TASK.get_folder_list();

            if (qa_response !== false) {
                return {
                    status: 200,
                    data: qa_response
                };
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service (get_list_ready)] request to QA server failed - ' + error.message);
        }
    }

    /**
     * Moves packages to ingested folder
     * @param uuid
     */
    async move_to_ingested(uuid) {

        try {

            await QA_TASK.move_to_ingested(uuid)

            return {
                status: 200,
                data: []
            };

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service (get_list_ready)] request to QA server failed - ' + error.message);
        }
    }

    /**
     * Executes QA processes on designated collection folder
     * @param folder_name
     */
    async run_qa(folder_name) {

            try {

                const QA_UUID = HELPER_LIB.create_uuid();
                const COLLECTION_FOLDER = folder_name;
                let result;
                let total_files;
                let queue_record = {};

                if (await SERVICE_HELPER.set_collection_folder(COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.create_qa_record(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_folder_name(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_batch_size(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_package_names(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_uri_txt_files(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_file_names(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.get_uri_txt(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_metadata(QA_UUID) === false) {
                    return false;
                }

                if (await SERVICE_HELPER.check_collection(QA_UUID, COLLECTION_FOLDER) === false) {
                    return false;
                }

                result = await QA_TASK.qa_status(DB_QUEUE, TABLE);

                if (await SERVICE_HELPER.move_to_ingest(QA_UUID, result.collection_uuid, COLLECTION_FOLDER) === false) {
                    return false;
                }

                total_files = JSON.parse(result.file_names_results);

                if (await SERVICE_HELPER.move_to_sftp(QA_UUID, result.collection_uuid, COLLECTION_FOLDER, total_files) === false) {
                    return false;
                }

                let timer = setInterval(async () => {

                    let result = await QA_TASK.qa_status(DB_QUEUE, TABLE);

                    if (result.is_error === 1) {
                        LOGGER.module().info('INFO: [/qa/service module (run_qa)] QA Error encountered');
                        clearInterval(timer);
                        return false;
                    }

                    if (result.packages !== null) {
                        LOGGER.module().info('INFO: [/qa/service module (run_qa)] SFTP upload complete');
                        clearInterval(timer);
                        queue_record.is_complete = 1;
                        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);
                        LOGGER.module().info('INFO: [/qa/service module (run_qa)] QA Complete');

                        // TODO: queue objects here

                        setTimeout(async () => {

                            LOGGER.module().info('INFO: [/qa/service module (run_qa)] Starting package ingest');

                            try {

                                let data = {
                                    collection: result.collection_uuid,
                                    user: 'import_user'
                                };

                                const URL = `${APP_CONFIG.api_url}/api/admin/v1/import/queue_objects?api_key=${TOKEN_CONFIG.api_key}`;

                                let response = await QA_TASK.start_ingest(URL, data);
                                console.log('start ingest response: ', response);
                                if (response === true) {
                                    await QA_TASK.clear_qa_queue(DB_QUEUE, TABLE, collection_uuid);
                                }

                            } catch (error) {
                                LOGGER.module().error('ERROR: [/qa/service task (start_ingest)] ingest start failed - ' + error.message);
                                reject(false);
                            }

                        }, 5000);
                    }

                }, 5000);

            } catch (error) {
                LOGGER.module().error('ERROR: [/qa/service module (run_qa)] request to QA server failed [catch error] - ' + error.message);
            }

        return {
            status: 200,
            message: 'QA running on ingest folder ' + folder_name
        };
    }

    /**
     * Checks QA status
     */
    async qa_status() {
        return {
            status: 200,
            data: await QA_TASK.qa_status(DB_QUEUE, TABLE)
        };
    };
}

module.exports = QA_service;
