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

const {v4: uuidv4} = require('uuid');
const VALIDATOR_CONFIG = require('../../config/index_records_validator_config')();
const INDEX_RECORD_LIB = require('../../libs/index_record_lib');
const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to create a repository collection record
 * @param DB
 * @param TABLE
 * @type {Create_collection_tasks}
 */
const Create_collection_tasks = class {

    constructor(DB, TABLE, ARCHIVESSPACE_LIB, HANDLES_LIB) {
        this.DB = DB;
        this.TABLE = TABLE;
        this.INDEX_RECORD = new INDEX_RECORD_LIB(this.DB, this.TABLE, VALIDATOR_CONFIG);
        this.ARCHIVESSPACE_LIB = ARCHIVESSPACE_LIB;
        this.HANDLES_LIB = HANDLES_LIB;
    }

    /**
     * Checks uri to determine if collection already exists
     * @param uri
     * @returns boolean
     */
    check_uri = (uri) => {

        let promise = new Promise((resolve, reject) => {

            let is_duplicate = false;

            this.DB(this.TABLE)
                .count('uri as uri')
                .where('uri', uri)
                .then((result) => {

                    if (result[0].uri > 0) {
                        is_duplicate = true;
                    }

                    resolve(is_duplicate);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks)] unable to check uri ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets archivesspace session token
     * @returns Promise string
     */
    get_session_token = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    resolve(await this.ARCHIVESSPACE_LIB.get_session_token());
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks)] unable to get ArchivesSpace session token ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((token) => {
            return token;
        }).catch((error) => {
            LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/get_session_token)] unable to get session token ' + error);
            return error;
        });
    }

    /**
     * Gets ArchivesSpace resource (collection) record
     * @param uri
     * @param token
     * @returns Promise string
     */
    get_resource_record = (uri, token) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    // TODO: check uri for resource uri section
                    resolve(JSON.stringify(await this.ARCHIVESSPACE_LIB.get_record(uri, token)));
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/get_resource_record)] unable to get resource record ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((record) => {
            return record;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Generates uuid
     * @returns Promise string
     */
    create_uuid = () => {

        let promise = new Promise((resolve, reject) => {

            try {
                resolve(uuidv4());
            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/get_uuid)] unable to generate uuid ' + error.message);
                reject(error);
            }

        });

        return promise.then((uuid) => {
            return uuid;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Creates handle
     * @param uuid
     * @returns Promise string
     */
    create_handle = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {
                try {
                    resolve(await this.HANDLES_LIB.create_handle(uuid));
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/create_handle)] handle error ' + error);
                    reject(error);
                }

            })();
        });

        return promise.then((handle) => {
            return handle;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Saves display record to database
     * @param record
     * @returns boolean
     */
    save_record = (record) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .insert(record)
                .then((result) => {

                    if (result.length === 1) {
                        resolve(true);
                    }
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/save_record)] unable to save collection record ' + error.message);
                    reject(false);
                });
        });

        return promise.then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    /**
     * Creates display record for repository database and search index
     * @param data object
     * returns Promise string
     */
    create_index_record = (data) => {

        try {
            return this.INDEX_RECORD.create_index_record(data);
        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/create_display_record)] ' + error.message);
            return error;
        }
    }

    /** TODO: import indexer task?
     * Indexes display record
     * @param uuid
     * @returns Promise
     */
    index_record = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {
                HELPER.index(uuid, (response) => {

                    if (response.error === true) {
                        LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record');
                        reject(new Error('Unable to index collection record'));
                    }

                    resolve(response);
                });
            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = Create_collection_tasks;
