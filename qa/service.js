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

const HTTP = require('../qa/http');
const CONFIG = require('./config/webservices_config')();
const APP_CONFIG = require('./config/app_config')();
const TOKEN_CONFIG = require('./config/token_config')();
const QA_SERVICE_TASKS = require('../qa/tasks/service_tasks');
const COLLECTION_TASKS = require('../qa/tasks/check_collection_tasks');
const HELPER_TASKS = require('../qa/helper');
const ARCHIVESSPACE_CONFIG = require('./config/archivesspace_config')();
const ARCHIVESSPACE = require('./libs/archivesspace');
const DB = require('./config/db_config')();
const DB_QUEUE = require('./config/dbqueue_config')();
const DB_TABLES = require('./config/db_tables_config')();
const TABLE = DB_TABLES.repo_queue.repo_qa_queue;
const REPO = DB_TABLES.repo.repo_objects;
const QA_TASK = new QA_SERVICE_TASKS(CONFIG);
const COLLECTION_TASK = new COLLECTION_TASKS(DB, REPO);
const HELPER = new HELPER_TASKS();
const ARCHIVESSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
const LIB = require('../libs/transfer-ingest');
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
 * Makes request to the QA service to set collection folder name
 * @param collection_folder
 * @return {boolean}
 */
const set_collection_folder = async (collection_folder) => {

    try {

        let queue_record = {};
        let result = await QA_TASK.set_folder_name(collection_folder);

        if (result.is_set === false) {
            queue_record.uuid = 0;
            queue_record.collection_folder = 'error'
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.create_qa_queue_record(DB_QUEUE, TABLE, queue_record);
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - unable to set collection in QA service');
            return false;
        }

        LOGGER.module().info('INFO: [/qa/service module (set_collection_folder)] Collection folder set');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (set_collection_folder)] QA Halted - Unable to set collection folder [catch error] ' + error.message);
    }
};

/**
 * Creates a QA queue record
 * @param uuid
 * @param collection_folder
 * @return {Promise<void>}
 */
const create_qa_record = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let is_queue_record_created;

        queue_record.uuid = uuid;
        queue_record.collection_folder = collection_folder;
        is_queue_record_created = await QA_TASK.create_qa_queue_record(DB_QUEUE, TABLE, queue_record);

        if (is_queue_record_created === false || is_queue_record_created === undefined) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - unable to create QA queue record');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.create_qa_queue_record(DB_QUEUE, TABLE, queue_record);
            return false;
        }

        LOGGER.module().info('INFO: [/qa/service module (create_qa_record)] QA queue record created');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (create_qa_record)] QA Halted - Unable to create QA queue record [catch error] ' + error.message);
    }
};

/**
 * Checks collection folder name for correct naming convention
 * @param uuid
 * @param collection_folder
 * @return {Promise<boolean>}
 */
const check_folder_name = async (uuid, collection_folder) => {

    try {

        let folder_name_check_results = await QA_TASK.check_folder_name(collection_folder);
        let queue_record = {};
        queue_record.collection_folder_name_results = JSON.stringify(folder_name_check_results);

        if (folder_name_check_results.folder_name_results.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - Package name errors');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_folder_name)] Collection folder name checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_folder_name)] QA Halted - Unable to check folder name [catch error] ' + error.message);
    }
};

/**
 * Checks ingest batch size
 * @param uuid
 * @param collection_folder
 * @return {Promise<boolean>}
 */
const check_batch_size = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let total_batch_size_results = await QA_TASK.get_total_batch_size(collection_folder);
        let batch_size_results = HELPER.format_bytes(total_batch_size_results.total_batch_size.result);
        queue_record.total_batch_size_results = JSON.stringify(batch_size_results);

        if (batch_size_results.size_type === 'GB' && batch_size_results.batch_size > 200) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - Batch size is too large');
            queue_record.total_batch_size_results = JSON.stringify({errors: 'This batch is too large.  Batch size cannot exceed 200GB'});
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.create_qa_queue_record(DB_QUEUE, TABLE, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_batch_size)] Batch size checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_batch_size)] QA Halted - Unable to check batch size [catch error] ' + error.message);
    }
};

/**
 * Checks package names for correct naming convention
 * @param uuid
 * @param collection_folder
 * @return {Promise<boolean>}
 */
const check_package_names = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let is_package_name_checked = await QA_TASK.check_package_names(collection_folder);
        queue_record.package_names_results = JSON.stringify(is_package_name_checked);

        if (is_package_name_checked.package_name_results.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (check_package_names)] QA Halted - Package name errors found');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_package_names)] Package name(s) checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_package_names)] QA Halted - Unable to check package name(s) [catch error] ' + error.message);
    }
};

/**
 * Checks file names and fixes case issues and removes spaces
 * Checks if images are valid
 * @param uuid
 * @param collection_folder
 * @return {Promise<boolean>}
 */
const check_file_names = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let is_file_name_checked = await QA_TASK.check_file_names(collection_folder);
        queue_record.file_names_results = JSON.stringify(is_file_name_checked);

        if (is_file_name_checked.file_count_results.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (check_file_names)] QA Halted - File name errors found');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_file_names)] File name(s) checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_file_names)] QA Halted - Unable to check file name(s) [catch error] ' + error.message);
    }
};

/**
 * Checks if uri txt (metadata uri) files are in ingest packages
 * @param uuid
 * @param collection_folder
 * @return {Promise<void>}
 */
const check_uri_txt_files = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let is_uri_txt_checked = await QA_TASK.check_uri_txt(collection_folder);
        queue_record.uri_txt_results = JSON.stringify(is_uri_txt_checked);

        if (is_uri_txt_checked.uri_results.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (check_uri_txt_files)] QA Halted - Uri txt file errors found');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_uri_txt_files)] Uri txt file(s) checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_uri_txt_files)] QA Halted - Unable to generate uri list [catch error] ' + error.message);
    }
};

/**
 * Generates a list of ArchivesSpace URIs from uri.txt files found in ingest packages
 * @param uuid
 * @param collection_folder
 * @return {Promise<void>}
 */
const get_uri_txt = async (uuid, collection_folder) => {

    try {

        let queue_record = {};
        let uri_txt = await QA_TASK.get_uri_txt(collection_folder);
        queue_record.uri_txt_results = JSON.stringify(uri_txt);

        if (uri_txt.get_uri_results.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (get_uri_txt)] QA Halted - Unable to generate uri list');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (get_uri_txt)] Uri list generated');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (get_uri_txt)] QA Halted - Unable to generate uri list [catch error] ' + error.message);
    }
};

/**
 * Checks specific metadata fields
 * @param uuid
 * @return {Promise<boolean>}
 */
const check_metadata = async (uuid) => {

    try {

        let queue_record = {};
        let uris = await QA_TASK.get_metadata_uris(DB_QUEUE, TABLE, uuid);
        let is_metadata_checked = await QA_TASK.check_metadata(DB_QUEUE, TABLE, uuid, ARCHIVESSPACE_LIB, JSON.parse(uris.uri_txt_results));

        if (is_metadata_checked === false) {
            LOGGER.module().error('ERROR: [/qa/service module (check_metadata)] QA Halted - Unable to check metadata');
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (check_metadata)] Metadata checked');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (check_metadata)] QA Halted - Unable to check metadata [catch error] ' + error.message);
    }
};

/**
 * Checks if collection exists in repository, creates it if it does not.
 * @param uuid
 * @param collection_folder
 * @return {Promise<boolean>}
 */
const check_collection = async (uuid, collection_folder) => {

    let queue_record = {};
    let tmp = collection_folder.split('-');
    let collection_uri = tmp[tmp.length - 1];
    let collection = await COLLECTION_TASK.check_collection('/repositories/2/' + collection_uri.replace('_', '/'));

    if (collection.exists === false) {
        LOGGER.module().info('INFO: [/qa/service module (run_qa)] Collection does not exist');

        try {

            let endpoint = '/api/admin/v1/repo/object';
            let url = `${APP_CONFIG.api_url}${endpoint}?api_key=${TOKEN_CONFIG.api_key}`;
            let response = await HTTP.request({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    uri: '/repositories/2/' + collection_uri.replace('_', '/'),
                    is_member_of_collection: 'codu:root'
                }
            });

            if (response.status === 201) {
                LOGGER.module().info('INFO: [/qa/service module (run_qa)] Collection created');
                queue_record.collection_uuid = response.data[0].pid;
                queue_record.collection_results = 2; // 2 === collection created
                await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            } else {
                LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - unable to create collection');
                queue_record.collection_results = 3; // 3 === collection error
                queue_record.is_error = 1;
                queue_record.is_complete = 1;
                await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] QA Halted - unable to create collection ' + error.message);
            queue_record.collection_results = 3 // 3 === collection error
            queue_record.is_error = 1;
            queue_record.is_complete = 1;
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
            return false;
        }

    } else {
        LOGGER.module().info('INFO: [/qa/service module (run_qa)] Collection exists');
        queue_record.collection_uuid = collection.uuid;
        queue_record.collection_results = 1;
        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        return true;
    }
};

/**
 * moves collection folder from ready to ingest folder
 * @param qa_uuid
 * @param uuid
 * @param folder
 */
const move_to_ingest = async (qa_uuid, uuid, folder) => {

    try {

        let queue_record = {};
        let moved = await QA_TASK.move_to_ingest(uuid, folder);

        if (moved.result !== undefined && moved.errors.length > 0) {
            LOGGER.module().error('ERROR: [/qa/service module (move_to_ingest)] Unable to move package(s) to ingest folder ');
            queue_record.is_complete = 1;
            // queue_record.is_error = 1;
            queue_record.moved_to_ingest_results = JSON.stringify(moved);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, qa_uuid, queue_record);
            return false;
        }

        queue_record.moved_to_ingest_results = JSON.stringify(moved);
        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, qa_uuid, queue_record);
        LOGGER.module().info('INFO: [/qa/service module (move_to_ingest)] Package(s) moved to ingest folder');
        return true;

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (run_qa)] request to QA server failed - ' + error);
        let queue_record = {};
        queue_record.collection_results = 3 // 3 === collection error
        queue_record.is_error = 1;
        queue_record.is_complete = 1;
        await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, uuid, queue_record);
        return false;
    }
};

/**
 * moves packages to Archivematica sftp server
 * @param qa_uuid
 * @param uuid
 * @param folder
 * @param total_files
 * @param callback
 */
const move_to_sftp = function (qa_uuid, uuid, folder, total_files, callback) {

    (async () => {

        try {

            let queue_record = {};
            await sftp_upload_status(qa_uuid, uuid, total_files.file_count_results.result);
            await QA_TASK.move_to_sftp(uuid, folder);
            queue_record.moved_to_sftp_results = 'moving_packages_to_archivematica_sftp';
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, qa_uuid, queue_record);
            LOGGER.module().info('INFO: [/qa/service module (sftp_upload_status)]  Move to SFTP started...');

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (move_to_sftp)] move to sftp failed - ' + error.message);
        }

    })();

    callback(true);
};

/**
 * Checks sftp upload status
 * @param qa_uuid
 * @param uuid
 * @param total_batch_file_count
 */
const sftp_upload_status = async (qa_uuid, uuid, total_batch_file_count) => {

    let sftp_upload_status = setInterval(async () => {

        try {

            let queue_record = {};
            let response = await QA_TASK.sftp_upload_status(uuid, total_batch_file_count);
            queue_record.sftp_upload_status = JSON.stringify(response);
            await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, qa_uuid, queue_record);

            if (response === false) {
                clearInterval(sftp_upload_status);
                LOGGER.module().info('INFO: [/qa/service module (sftp_upload_status)]  SFTP response error - ' + response);
                return false;
            }

            if (response.data.message !== undefined && response.data.message === 'upload_complete') {
                clearInterval(sftp_upload_status);
                let gpn = setTimeout(async () => {
                    LOGGER.module().info('INFO: [/qa/service module (sftp_upload_status)]  - ' + response.data.message);
                    LOGGER.module().info('INFO: [/qa/service module (sftp_upload_status)]  Getting packages... ');
                    let packages = get_package_names(response.data);
                    queue_record.packages = packages.toString();
                    await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, qa_uuid, queue_record);
                    clearTimeout(gpn);
                }, 1000);

            } else {
                LOGGER.module().info('INFO: [/qa/service module (sftp_upload_status)]  - ' + response.data.message);
            }

        } catch (error) {
            clearInterval(sftp_upload_status);
            LOGGER.module().error('ERROR: [/qa/service module (sftp_upload_status)] unable to get sftp upload status - ' + error.message);
        }

    }, 30000);
};

/**
 * Gets package names
 * @param sftp_upload_data
 */
const get_package_names = (sftp_upload_data) => {

    try {

        let packages = [];
        let paths = sftp_upload_data.data[0];

        for (let i = 0; i < paths.length; i++) {

            let tmp = paths[i].split('/');

            if (tmp[tmp.length - 1] === 'uri.txt') {
                packages.push(tmp[tmp.length - 2]);
            }
        }

        return packages

    } catch (error) {
        LOGGER.module().error('ERROR: [/qa/service module (get_package_names)] unable to get package names' + error.message);
    }
};

/**
 * initiates ingest process
 * @param collection_uuid
 */
const start_ingest = (collection_uuid) => {

    (async () => {

        try {

            // queue packages here for ingest
            const data = {
                collection: collection_uuid,
                user: 'import_user'
            };

            LIB.save_transfer_records(data, (result) => {
                LOGGER.module().info('INFO: [/qa/service (start_ingest)] Packages have been queued for ingest ' + result.recordCount);
                return true;
            });

            let si = setTimeout(async () => {

                let data = {
                    collection: collection_uuid
                };

                const URL = `${APP_CONFIG.api_url}/api/admin/v1/import/start_transfer?api_key=${TOKEN_CONFIG.api_key}`;
                let response = await QA_TASK.start_ingest(URL, data);

                if (response === true) {
                    LOGGER.module().info('INFO: [/qa/service (start_ingest)] Ingest started');
                }

                clearTimeout(si);

            }, 5000);

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service task (start_ingest)] ingest start failed - ' + error.message);
            reject(false);
        }

    })();
}

/**
 * Executes QA processes on designated collection folder
 * @param folder
 * @param callback
 */
exports.run_qa = (folder, callback) => {

    (async () => {

        try {

            const QA_UUID = HELPER.create_uuid();
            const COLLECTION_FOLDER = folder;
            let result;
            let total_files;
            let queue_record = {};
            let run_qa_timer;

            if (set_collection_folder(COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await create_qa_record(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_folder_name(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_batch_size(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_package_names(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_uri_txt_files(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_file_names(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await get_uri_txt(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            if (await check_metadata(QA_UUID) === false) {
                return false;
            }

            if (await check_collection(QA_UUID, COLLECTION_FOLDER) === false) {
                return false;
            }

            result = await QA_TASK.qa_status(DB_QUEUE, TABLE);

            if (await move_to_ingest(QA_UUID, result.collection_uuid, COLLECTION_FOLDER) === false) {
                return false;
            }

            total_files = JSON.parse(result.file_names_results);

            move_to_sftp(QA_UUID, result.collection_uuid, COLLECTION_FOLDER, total_files, (result) => {
                LOGGER.module().info('INFO: [/qa/service module (run_qa)] Moving packages to SFTP...');
            });

            run_qa_timer = setInterval(async () => {

                let result = await QA_TASK.qa_status(DB_QUEUE, TABLE);

                LOGGER.module().info('INFO: [/qa/service module (run_qa)] Checking for packages...');
                console.log(result);
                if (result.is_error === 1) {
                    clearInterval(run_qa_timer);
                    LOGGER.module().info('INFO: [/qa/service module (run_qa)] QA Error encountered');
                    return false;
                }

                if (result.packages !== null) {
                    clearInterval(run_qa_timer);
                    LOGGER.module().info('INFO: [/qa/service module (run_qa)] SFTP upload complete');
                    queue_record.is_complete = 1;
                    await QA_TASK.save_to_qa_queue(DB_QUEUE, TABLE, QA_UUID, queue_record);
                    LOGGER.module().info('INFO: [/qa/service module (run_qa)] QA Complete');
                    let si = setTimeout(() => {
                        LOGGER.module().info('INFO: [/qa/service module (run_qa)] Starting package ingest');
                        start_ingest(result.collection_uuid);
                        clearTimeout(si);
                        let cq = setTimeout(async () => {
                            await QA_TASK.clear_qa_queue(DB_QUEUE, TABLE, result.collection_uuid);
                            clearTimeout(cq);
                        }, 10000);
                    }, 3000);
                }

            }, 10000);

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (run_qa)] request to QA server failed [catch error] - ' + error.message);
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
};
