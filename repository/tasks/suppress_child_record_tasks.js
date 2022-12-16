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

const DISPLAY_RECORD_TASKS = require('../../repository/tasks/index_record_tasks');
const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to suppress a repository child record
 * @param uuid
 * @param DB
 * @param TABLE
 * @type {Suppress_child_record_tasks}
 */
const Suppress_child_record_tasks = class {

    constructor(uuid, DB, TABLE) {
        this.uuid = uuid;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Updates db collection child record's publish status
     * @param type
     * @param status
     * @return boolean
     */
    update_child_record_status = (type, status) => {

        let where_obj = {};
            where_obj.is_active = 1;

            if (type === 'collection') {
                where_obj.is_member_of_collection = this.uuid;
            } else if (type === 'object') {
                where_obj.uuid = this.uuid;
            }

        this.DB(this.TABLE)
            .where(where_obj)
            .update({
                is_published: status
            })
            .then(() => {
                return true;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (update_child_records_status)] Unable to update display record ' + error.message);
            });
    }

    /**
     * Suppress collection child records
     */
    suppress_child_records = (type) => {

        let TASK;
        let where_obj = {};
            where_obj.is_active = 1;

            if (type === 'collection') {
                where_obj.is_member_of_collection = this.uuid;
            } else if (type === 'object') {
                where_obj.uuid = this.uuid;
            }

        return this.DB(this.TABLE)
            .select('uuid')
            .where(where_obj)
            .then((data) => {

                let timer = setInterval(() => {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.uuid === null) {
                            return false;
                        }

                        TASK = new DISPLAY_RECORD_TASKS(record.uuid, this.DB, this.TABLE);
                        TASK.update();

                        // remove child records from public index
                        HELPER.del(record.uuid, (result) => {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection_docs)] unable to remove published record from index.');
                            }

                            return false;
                        });

                    } else {
                        clearInterval(timer);
                        return false;
                    }

                }, 100);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error.message);
            });
    }
};

module.exports = Suppress_child_record_tasks;
