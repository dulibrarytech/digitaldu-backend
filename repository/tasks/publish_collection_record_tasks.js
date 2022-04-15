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

const TASK = require('../../repository/tasks/publish_record_tasks');
const LOGGER = require('../../libs/log4');

/**
 * Publishes collection record
 * @param uuid
 * @param DB
 * @param TABLE
 * @type {Publish_collection_record_tasks}
 */
const Publish_collection_record_tasks = class {

    constructor(uuid, DB, TABLE) {
        this.uuid = uuid;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Publishes record
     */
    publish = () => {
        (async () => {
            const task = new TASK(this.uuid);
            await task.publish_record();
        })();
    };

    /**
     * Updates collection publish status
     * @param status
     * @return boolean
     */
    update_collection_status = (status) => {

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .update({
                is_published: status
            })
            .then((data) => {

                if (data === 1) {
                    return true;
                }
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (update_collection_status)] unable to update collection publish status ' + error.message);
            });
    };

    /**
     * Gets collection uuid
     * @returns string
     */
    get_collection_uuid = () => {

        return this.DB(this.TABLE)
            .select('is_member_of_collection')
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .then((data) => {
                return data[0].is_member_of_collection;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (get_collection_uuid)] Unable to get collection uuid ' + error.message);
            });
    }

    /**
     *  Checks collection publish status
     *  @param collection_uuid
     *  @return boolean
     */
    check_collection_publish_status = (collection_uuid) => {

        return this.DB(this.TABLE)
            .select('is_published')
            .where({
                uuid: collection_uuid,
                is_active: 1
            })
            .then((data) => {

                let is_published = false;

                if (data[0].is_published === 1) {
                    is_published = true;
                }

                return is_published;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (check_collection_publish_status)] Unable to check collection status ' + error.message);
            });
    }
};

module.exports = Publish_collection_record_tasks;

