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

const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');
const TASK = require("../../repository/tasks/publish_record_tasks");

/**
 * Object contains tasks used to publish collection child repository record(s)
 * @param uuid
 * @param DB
 * @param TABLE
 * @constructor
 */
exports.Publish_child_record_tasks = function (uuid, DB, TABLE) {

    this.uuid = uuid;
    this.DB = DB;
    this.TABLE = TABLE;

    /**
     * Publishes record
     */
    this.publish = () => {
        (async () => {
            const task = new TASK.Publish_record_tasks(this.uuid);
            await task.publish_record();
        })();
    };

    /**
     * Updates db collection child record's publish status
     * @param status
     * @return boolean
     */
    this.update_child_records_status = (status) => {

        let where_obj = {
            is_member_of_collection: this.uuid,
            is_active: 1
        };

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
     * indexes collection child records
     * @return boolean
     */
    this.reindex_child_records = () => {

        this.DB(this.TABLE)
            .select('uuid')
            .where({
                is_member_of_collection: this.uuid,
                is_active: 1
            })
            .then((data) => {

                let timer = setInterval(() => {

                    if (data.length === 0) {
                        clearInterval(timer);
                        return false;
                    } else {

                        let record = data.pop();

                        if (record.uuid === null) {
                            return false;
                        }

                        HELPER.index(record.uuid, (result) => {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/tasks (reindex_child_records/HELPER.index)] Unable to index child record(s)');
                            }
                        });
                    }

                }, 150);

                return null;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (reindex_child_records)] Unable to get record uuid ' + error.message);
            });
    }

    /**
     * Moves copy of record or records from admin to public index
     * @return Promise
     */
    this.publish_child_records = () => {

        let promise = new Promise((resolve, reject) => {

            let match_phrase = {
                'is_member_of_collection': this.uuid
            };

            HELPER.publish_record(match_phrase, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (publish_child_records/HELPER.publish_record)] Unable to publish child record(s)');
                    reject(new Error('ERROR: [/repository/tasks (publish_child_records/HELPER.publish_record)] Unable to publish child record(s)'));
                }

                resolve(result);
            });
        });

        return promise.then((result) => {
            return result;
        });
    };

    /**
     * Checks if the child record's collection is published
     * @param is_collection_published
     * @returns boolean
     */
    this.update_child_record = (is_collection_published) => {

        if (is_collection_published === false) {
            return false;
        }

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(() => {
                return true;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/tasks (update_child_record)] Unable to update child record publish status ' + error.message);
            });
    }
};
