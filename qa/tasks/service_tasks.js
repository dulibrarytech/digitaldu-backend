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

const HTTP = require('axios');
const KA = require('http');
const LOGGER = require('../../libs/log4');
const QA_ENDPOINT_PATH = '/api/v2/qa/';
const TIMEOUT = 60000 * 25;

/**
 * Object contains tasks used to run QA processes on batch ingests
 * @param CONFIG
 * @type {Check_collection_tasks}
 */
const Service_tasks = class {

    constructor(CONFIG) {
        this.CONFIG = CONFIG;
    }

    /** // TODO: get endpoints from QA service?
     * Gets list of ready folders
     * @returns Object/Boolean
     */
    get_folder_list() {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'list-ready-folders?api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (get_list_ready)] request to QA server failed - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Sets folder name in QA service
     * @returns Object
     */
    set_folder_name(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'set-collection-folder?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (set_folder_name)] Unable to set folder name - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Checks folder name in QA service
     * @returns Object/boolean
     */
    check_folder_name(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'check-collection-folder?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (set_folder_name)] Unable to check folder name - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Checks package names in QA service
     * @returns Object/boolean
     */
    check_package_names(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'check-package-names?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        httpAgent: new KA.Agent({
                            keepAlive: true,
                            maxSockets: 1,
                            keepAliveMsecs: 3000
                        }),
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (check_package_names)] Unable to check package names - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Checks file names in QA service
     * @returns Object/boolean
     */
    check_file_names(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'check-file-names?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        httpAgent: new KA.Agent({
                            keepAlive: true,
                            maxSockets: 1,
                            keepAliveMsecs: 3000
                        }),
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (check_file_names)] Unable to check file names - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Checks uri.txt in QA service
     * @returns Object/boolean
     */
    check_uri_txt(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'check-uri-txt?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (check_uri_txt)] Unable to check uri.txt - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets metadata uris
     * @returns Object/boolean
     */
    get_metadata_uris(DB, TABLE, uuid) {

        let promise = new Promise((resolve, reject) => {

            DB(TABLE)
            .select('uri_txt_results')
            .where({
                uuid: uuid,
                is_complete: 0
            })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data[0]);
                } else {
                    reject(false);
                }
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/qa/service module (get_metadata_uris)] Unable to uris - ' + error.message);
                reject(false);
            });
        });

        return promise.then((results) => {
            return results;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets metadata uris
     * @returns Object/boolean
     */
    check_metadata(DBQ, TABLE, UUID, ARCHIVESSPACE_LIB, uris) {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let uri_arr = uris.get_uri_results.result;
                    let token = await ARCHIVESSPACE_LIB.get_session_token();
                    let queue_record = {};
                    let errors = [];
                    let error_obj = {};
                    let timer = setInterval(async () => {

                        if (uri_arr.length === 0) {

                            clearInterval(timer);

                            try {

                                let result = await ARCHIVESSPACE_LIB.destroy_session_token(token);

                                if (result.data.status === 'session_logged_out') {
                                    LOGGER.module().info('INFO: [/qa/service_tasks (check_metadata)] ArchivesSpace session terminated');
                                }

                                if (errors.length > 0) {
                                    queue_record.is_error = 1;
                                    queue_record.metadata_check_results = JSON.stringify(errors);
                                }

                                queue_record.metadata_check = 'COMPLETE';
                                await this.save_to_qa_queue(DBQ, TABLE, UUID, queue_record);
                                resolve(true);

                            } catch (error) {
                                LOGGER.module().error('ERROR: [/qa/service_tasks (check_metadata)] Unable to check metadata - ' + error.message);
                                reject(false);
                            }

                            return false;
                        }

                        let uri = uri_arr.pop();

                        if (uri === undefined) {
                            return false;
                        }

                        queue_record.metadata_check = `Checking record ${uri} ...`;
                        await this.save_to_qa_queue(DBQ, TABLE, UUID, queue_record);

                        let record = await ARCHIVESSPACE_LIB.get_record(uri, token)

                        if (record.metadata.title === undefined || record.metadata.title.length === 0) {
                            error_obj.uuid_error = uri;
                            error_obj.field_error = 'Title is missing'
                            errors.push(error_obj);
                        }

                        if (record.metadata.uri === undefined || record.metadata.uri.length === 0) {
                            error_obj.uuid_error = uri;
                            error_obj.field_error = 'URI is missing';
                            errors.push(error_obj);
                        }

                        if (record.metadata.identifiers === undefined || record.metadata.identifiers.length === 0) {
                            error_obj.uuid_error = uri;
                            error_obj.field_error = 'Identifier is missing';
                            errors.push(error_obj);
                        }

                        if (record.metadata.notes === undefined || record.metadata.notes.length === 0) {
                            error_obj.uuid_error = uri;
                            error_obj.field_error = 'Notes is missing';
                            errors.push(error_obj);
                        } else {

                            for (let i = 0; i < record.metadata.notes.length; i++) {

                                if (record.metadata.notes[i].type === 'abstract' && record.metadata.notes[i].content.length === 0) {
                                    error_obj.uuid_error = uri;
                                    error_obj.field_error = 'Abstract is missing';
                                    errors.push(error_obj);
                                }

                                if (record.metadata.notes[i].type === 'userestrict' && record.metadata.notes[i].content.length === 0) {
                                    error_obj.uuid_error = uri;
                                    error_obj.field_error = 'Rights statement is missing';
                                    errors.push(error_obj);
                                }
                            }
                        }

                        if (record.metadata.dates !== undefined) {

                            for (let i = 0; i < record.metadata.dates.length; i++) {

                                if (record.metadata.dates[i].expression === undefined || record.metadata.dates[i].expression.length === 0) {
                                    error_obj.uuid_error = uri;
                                    error_obj.field_error = 'Date expression is missing';
                                    errors.push(error_obj);
                                }
                            }
                        }

                        if (record.metadata.is_compound === true) {
                            if (record.metadata.parts === undefined || record.metadata.parts.length < 2) {
                                error_obj.uuid_error = uri;
                                error_obj.field_error = 'Compound objects are missing';
                                errors.push(error_obj);
                            }
                        }

                        if (record.metadata.parts === undefined || record.metadata.parts.length === 0) {
                            error_obj.uuid_error = uri;
                            error_obj.field_error = 'Parts is missing';
                            errors.push(error_obj);
                        } else {

                            for (let i = 0; i < record.metadata.parts.length; i++) {

                                if (record.metadata.parts[i].type === null || record.metadata.parts[i].type.length === 0) {
                                    error_obj.uuid_error = uri;
                                    error_obj.field_error = 'Mime-type is missing (' + record.metadata.parts[i].title + ')';
                                    errors.push(error_obj);
                                }
                            }
                        }

                        queue_record.metadata_check_results = JSON.stringify(errors);
                        await this.save_to_qa_queue(DBQ, TABLE, UUID, queue_record);
                        error_obj = {};

                    }, 8000);

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (check_metadata)] Unable to check metadata - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets uri.txt in QA service
     * @returns Object/boolean
     */
    get_uri_txt(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'get-uri-txt?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (get_uri_txt)] Unable to get uri.txt - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets total batch size in QA service
     * @returns Object/boolean
     */
    get_total_batch_size(folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = this.CONFIG.qa_service + QA_ENDPOINT_PATH + 'get-total-batch-size?folder=' + folder + '&api_key=' + this.CONFIG.qa_service_api_key;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service module (get_total_batch_size)] Unable to get total batch size - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Moves packages to ingest folder in QA service
     * @param uuid
     * @param folder
     * @returns Object/boolean
     */
    move_to_ingest(uuid, folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = `${this.CONFIG.qa_service}${QA_ENDPOINT_PATH}move-to-ingest?uuid=${uuid}&folder=${folder}&api_key=${this.CONFIG.qa_service_api_key}`;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        httpAgent: new KA.Agent({
                            keepAlive: true,
                            maxSockets: 1,
                            keepAliveMsecs: 3000
                        }),
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/task module (move_to_ingest)] Unable to move packages to ingest folder - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Moves packages to ingested folder
     * @param uuid
     * @return {Promise<unknown>}
     */
    move_to_ingested(uuid) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = `${this.CONFIG.qa_service}${QA_ENDPOINT_PATH}move-to-ingested?uuid=${uuid}&folder=collection&api_key=${this.CONFIG.qa_service_api_key}`;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        httpAgent: new KA.Agent({
                            keepAlive: true,
                            maxSockets: 1,
                            keepAliveMsecs: 3000
                        }),
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/task module (move_to_ingest)] Unable to move packages to ingest folder - ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    // TODO: clear qa queue

    /**
     * Moves packages to Archivematica SFTP in QA service
     * @param uuid
     * @param folder
     * @returns Object/boolean
     */
    move_to_sftp(uuid, folder) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = `${this.CONFIG.qa_service}${QA_ENDPOINT_PATH}move-to-sftp?uuid=${uuid}&folder=${folder}&api_key=${this.CONFIG.qa_service_api_key}`;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    resolve(true);

                    /* TODO:
                    if (response.status === 200) {
                        resolve({
                            response: response.data,
                            is_moved: true
                        });
                    }
                     */

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service task (move_to_sftp)] move to sftp error occurred - ' + error.message);
                    // reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets sftp upload status
     * @param uuid
     * @param total_batch_file_count
     */
    sftp_upload_status(uuid, total_batch_file_count) {

        let promise = new Promise((resolve, reject) => {

            const QA_URL = `${this.CONFIG.qa_service}${QA_ENDPOINT_PATH}upload-status?uuid=${uuid}&total_batch_file_count=${total_batch_file_count}&api_key=${this.CONFIG.qa_service_api_key}`;

            (async () => {

                try {

                    let response = await HTTP.get(QA_URL, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            data: response.data
                        });

                    } else {
                        reject(false);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/service task (upload_status)] request to QA server failed - ' + error.message);
                    reject(false);
                }

            })();

        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Generates QA record
     * @returns Promise string
     */
    create_qa_queue_record(DBQ, TABLE, record) {

        let promise = new Promise((resolve, reject) => {

            try {

                DBQ(TABLE)
                .insert(record)
                .then((data) => {
                    LOGGER.module().info('INFO: [/qa/tasks (create_qa_queue_record)] QA queue record id ' + data.toString());
                    resolve(true);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/qa/tasks (create_qa_queue_record)] unable to create QA queue record ' + error.message);
                    reject(false);
                });

            } catch (error) {
                LOGGER.module().error('ERROR: [/qa/tasks (create_qa_queue_record)] unable to create QA queue record ' + error.message);
                reject(false);
            }

        });

        return promise.then((uuid) => {
            return uuid;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Logs QA data to queue
     * @param DBQ
     * @param TABLE
     * @param uuid
     * @param log_record
     * @return {Promise<unknown>}
     */
    save_to_qa_queue(DBQ, TABLE, uuid, log_record) {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    DBQ(TABLE)
                    .where({
                        uuid: uuid
                    })
                    .update(log_record)
                    .then((data) => {

                        if (data === 1) {
                            resolve(true);
                        } else {
                            LOGGER.module().error('ERROR: [/qa/tasks (log_qa)] more than one record was updated');
                            reject(false);
                        }

                    })
                    .catch((error) => {
                        LOGGER.module().error('ERROR: [/qa/tasks (log_qa)] unable to update qa log record ' + error.message);
                        reject(false);
                    });

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/tasks (log_qa)] request to QA server failed ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets queue record for current QA process
     * @return {Promise<unknown>}
     */
    qa_status(DBQ, TABLE) {

        let promise = new Promise((resolve, reject) => {

            DBQ(TABLE)
            .orderBy('id', 'desc')
            .limit(1)
            .then((data) => {

                if (data.length === 1) {

                    resolve({
                        data: resolve(data[0])
                    });

                }
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/qa/tasks (qa_status)] unable to QA status ' + error.message);
                reject(false);
            });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Starts ingest process
     * @param url
     * @param data
     */
    start_ingest(url, data) {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let response = await HTTP.post(url, data, {
                        timeout: TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 200) {

                        resolve({
                            data: response.data
                        });

                    } else {
                        reject(false);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/qa/tasks (start_ingest)] unable to start ingest process ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = Service_tasks;
