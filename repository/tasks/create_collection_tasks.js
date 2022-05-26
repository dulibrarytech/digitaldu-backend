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

const UUID = require('node-uuid');
const ARCHIVESSPACE = require("../../libs/archivesspace");
const HANDLES = require('../../libs/handles');
const DR = require('../../libs/display-record');
const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to create a repository collection record
 * @param DB
 * @param TABLE
 * @type {Create_collection_tasks}
 */
const Create_collection_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
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
                    reject(new Error('Unable to check uri ' + error.message));
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

            // TODO: convert to an object
            ARCHIVESSPACE.get_session_token((response) => {

                try {

                    let token = JSON.parse(response.data);

                    if (response.error === true) {
                        reject(new Error('Unable to get session token'));
                    } else {
                        console.log(token.session);
                        resolve(token.session);
                    }

                } catch (error) {
                    reject(new Error('Unable to get session token'));
                }
            });
        });

        return promise.then((token) => {
            return token;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Gets archivesspace resource (collection) record
     * @param uri
     * @param token
     * @returns Promise string
     */
    get_resource_record = (uri, token) => {

        let promise = new Promise((resolve, reject) => {

            ARCHIVESSPACE.get_resource_record(uri, token, (response) => {

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/get_resource_record)] unable to get resource record');
                    reject(new Error('Unable to get resource record'));
                } else {
                    resolve(JSON.stringify(response.metadata.data));
                }

            });
        });

        return promise.then((metadata) => {
            return metadata;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Generates uuid
     * @param uuidDomain
     * @returns Promise string
     */
    get_uuid = (uuidDomain) => {

        let promise = new Promise((resolve, reject) => {

            try {
                resolve(UUID(uuidDomain, UUID.DNS));
            } catch (error) {
                LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/get_uuid)] unable to generate uuid ' + error.message);
                reject(new Error('Unable to generate uuid'));
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

            HANDLES.create_handle(uuid, (handle) => {

                if (handle.error !== undefined && handle.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/create_handle)] handle error');
                    reject(new Error('Unable to create handle: ' + handle.message));
                    return false;
                }

                resolve(handle);
            });

        });

        return promise.then((handle) => {
            return handle;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * Creates display record for repository database and search index
     * @param obj
     * returns Promise string
     */
    create_display_record = (obj) => {

        let promise = new Promise((resolve, reject) => {

            DR.create_display_record(obj, (display_record) => {

                if (typeof display_record === 'object') {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/create_display_record)]');
                    reject(new Error('Unable to create display record'));
                    return false;
                }

                resolve(display_record);
            });

        });

        return promise.then((display_record) => {
            return display_record;
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
                    resolve(result);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_collection_tasks/save_record)] unable to save collection record ' + error.message);
                    reject(error);
                });
        });

        return promise.then((result) => {
            if (result.length === 1) {
                return true
            }
        }).catch((error) => {
                return error;
            });
    }

    /**
     * Indexes display record
     * @param uuid
     * @returns Promise
     */
    index_record = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            HELPER.index(uuid, (response) => {

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record');
                    reject(new Error('Unable to index collection record'));
                }

                resolve(response);
            });
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = Create_collection_tasks;
