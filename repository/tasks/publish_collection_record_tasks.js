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

const PUBLISH = require('../../repository/tasks/publish_record_tasks');
const INDEXER_RECORD_TASKS = require('../../indexer/tasks/indexer_index_record_tasks');
const LOGGER = require('../../libs/log4');
const INDEXER_INDEX_TASKS = require("../../indexer/tasks/indexer_index_tasks");

/**
 * Publishes collection record
 * @param uuid
 * @param DB
 * @param TABLE
 * @type {Publish_collection_record_tasks}
 */
const Publish_collection_record_tasks = class {

    constructor(UUID, DB, TABLE) {
        this.UUID = UUID;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Publishes single collection record
     */
    publish = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    const PUBLISH_TASK = new PUBLISH(this.UUID, this.DB, this.TABLE);
                    let is_published = await PUBLISH_TASK.publish_collection_record();

                    if (is_published === true) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (publish)] unable to publish collection record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((is_published) => {
            return is_published;
        }).catch(() => {
            return false;
        });
    };

    /**
     * Updates collection publish status
     * @param status (int) 1=0
     * @return boolean
     */
    update_collection_status = (status) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: this.UUID,
                    is_active: 1
                })
                .update({
                    is_published: status
                })
                .then((data) => {

                    if (data === 1) {
                        resolve(true);
                    }
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (update_collection_status)] unable to update collection publish status ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    };

    /**
     * Gets collection uuid
     * @returns string
     */
    get_collection_uuid = () => {

        let promise = new Promise((resolve, reject) => {

            return this.DB(this.TABLE)
                .select('is_member_of_collection')
                .where({
                    uuid: this.UUID,
                    is_active: 1
                })
                .then((data) => {
                    resolve(data[0].is_member_of_collection);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (get_collection_uuid)] Unable to get collection uuid ' + error.message);
                    reject(false);
                });
        });

        return promise.then((uuid) => {
            return uuid;
        }).catch(() => {
            return false;
        });
    }

    /**
     *  Checks collection publish status
     *  @param collection_uuid
     *  @return boolean
     */
    check_collection_publish_status = (collection_uuid) => {

        let promise = new Promise((resolve, reject) => {

            return this.DB(this.TABLE)
                .select('is_published')
                .where({
                    uuid: collection_uuid,
                    is_active: 1
                })
                .then((data) => {

                    if (data[0].is_published === 1) {
                        resolve(true);
                    }

                    resolve(false);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/repository/tasks (check_collection_publish_status)] Unable to check collection status ' + error.message);
                    reject(false);
                });
        });
        return promise.then((is_published) => {
            return is_published;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Publish_collection_record_tasks;

