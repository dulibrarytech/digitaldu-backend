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

const ASPACE_CONFIG = require('../../config/archivesspace_config')();
const INDEX_RECORD_LIB = require('../../libs/index_record_lib');
const ASPACE_LIB = require('../../libs/archivesspace');
const LOGGER = require('../../libs/log4');

const Utils_normalize_records_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
    }

    get_session_token = () => {

        let promise = new Promise((resolve, reject) => {

            try {

                (async () => {
                    let ASPACE = new ASPACE_LIB(ASPACE_CONFIG);
                    let session = ASPACE.get_session_token();
                    resolve(session);
                })();

            } catch (error) {
                LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (get_session_token)] unable to get token ' + error.message);
                reject(error);
            }
        });

        return promise.then((response) => {
            return response;
        });

    }

    /**
     * Gets URI
     * @param where_obj
     * @return {Promise<unknown>}
     */
    get_record_uri = (where_obj) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('uuid', 'uri')
                .where(where_obj)
                .whereNot({
                    index_record: null
                })
                .limit(1)
                .orderBy('id', 'desc')
                .then((data) => {

                    if (data === undefined || data.length === 0) {
                        resolve(0);
                    }

                    resolve(data);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (get_record_uuid)] unable to get record uri ' + error.message);
                    reject(false);
                });
        });

        return promise.then((record) => {
            return record;
        });
    }

    /**
     * Gets aspace record
     * @param uri
     */
    get_aspace_record = (uri, token) => {

        let promise = new Promise((resolve, reject) => {

            try {

                (async () => {
                    let ASPACE = new ASPACE_LIB(ASPACE_CONFIG);
                    let record = ASPACE.get_record(uri, token);
                    resolve(record);
                })();

            } catch (error) {
                LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (get_session_token)] unable to get token ' + error.message);
                reject(error);
            }
        });

        return promise.then((response) => {
            return response;
        });
    };

    /**
     * Gets uuid
     */
    get_record_uuid = (where_obj) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('uuid')
                .where(where_obj)
                .whereNot({
                    index_record: null
                })
                .limit(1)
                .orderBy('id', 'desc')
                .then((data) => {

                    if (data === undefined || data.length === 0) {
                        resolve(0);
                    }

                    resolve(data[0].uuid);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (get_record_uuid)] unable to get record uuid ' + error.message);
                    reject(false);
                });
        });

        return promise.then((record) => {
            return record;
        });
    }

    /**
     * Update collection data
     * @param uuid
     * @param uri
     * @param metadata
     * @return {Promise<unknown>}
     */
    update_collection_data = (uuid, uri, metadata) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    uri: uri,
                    metadata: JSON.stringify(metadata)
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to save call number');
                        reject(false);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to save call number ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     *
     * @param uuid
     * @param call_number
     * @returns {Promise<unknown>}
     */
    save_call_number = (uuid, call_number) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    call_number: call_number
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to save call number');
                        reject(false);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to save call number ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     *
     * @param uuid
     * @param handle
     * @returns {Promise<unknown>}
     */
    update_handle = (uuid, handle) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    handle: handle
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to update handle');
                        reject(false);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_call_number)] unable to update handle ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Updates the display record
     * @param where_obj
     * @param index_record
     */
    update_index_record = (where_obj, index_record) => {

        let promise = new Promise((resolve, reject) => {

            try {

                (async () => {
                    let TASK = new INDEX_RECORD_LIB(this.DB, this.TABLE);
                    resolve(TASK.update_index_record(where_obj, index_record));
                })();

            } catch (error) {
                LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (update_index_record)] unable to update index record ' + error.message);
                reject(error);
            }
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    };

    /**
     *
     * @param where_obj
     * @param compound_parts
     * @returns {Promise<unknown>}
     */
    save_parts = (where_obj, compound_parts) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where(where_obj)
                .update({
                    compound_parts: compound_parts
                })
                .then((data) => {
                    if (data === 1) {
                        LOGGER.module().info('INFO: [/utils/utils_normalize_records_tasks (save_parts)] compound parts updated');
                        resolve(true);
                    }

                    reject(false);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (save_parts)] unable to update compound parts ' + error.message);
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
     *
     * @param uuid
     * @returns {Promise<unknown>}
     */
    update_status = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    is_updated: 1
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    } else {
                        LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (update status)] unable to update status');
                        reject(false);
                    }

                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (update status)] unable to update status ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Resets is_updated db flags
     * @returns {Promise<unknown>}
     */
    reset_updated_flags = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    is_updated: 1,
                    is_active: 1
                })
                .update({
                    is_updated: 0,
                    is_active: 1
                })
                .then((data) => {
                    resolve(true);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/utils/utils_normalize_records_tasks (reset_updated_flags)] unable to reset is_updated db fields ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        });
    }
};

module.exports = Utils_normalize_records_tasks;
