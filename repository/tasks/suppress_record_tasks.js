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

const LOGGER = require("../../libs/log4");
const DR = require("../../libs/display-record");
const HELPER = require("../../repository/helper");

/**
 * Object contains tasks used to suppress a repository record
 * @param uuid
 * @param DB
 * @param TABLE
 * @constructor
 */
exports.Suppress_record_tasks = (uuid, DB, TABLE) => {

    this.uuid = uuid;
    this.DB = DB;
    this.TABLE = TABLE;

    // suppress collection record - (removes record from public index)
    this.suppress_collection_record = () => {

        let promise = new Promise((resolve, reject) => {

            HELPER.del(this.uuid, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (suppress_collection)] Unable to suppress collection record');
                    reject(new Error('ERROR: [/repository/tasks (suppress_collection)] Unable to suppress collection record'));
                }

                resolve(result);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Suppress collection child records
     */
    this.suppress_child_records = () => {

        return this.DB(this.TABLE)
            .select('uuid')
            .where({
                is_member_of_collection: this.uuid,
                is_published: 1,
                is_active: 1
            })
            .then((data) => {

                let timer = setInterval(() => {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.uuid === null) {
                            return false;
                        }

                        // remove child records from public index
                        HELPER.del(record.uuid, (result) => {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection_docs)] unable to remove published record from index.');
                            }

                            return false;
                        });

                        /*
                        // update admin objects to unpublished status
                        update_fragment(record.sip_uuid, 0, function (result) {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/unpublish_collection_docs)] unable to update published status.');
                                obj.status = 'failed';
                            }

                            return false;
                        });

                        let pidObj = {};
                        pidObj.pid = record.sip_uuid;

                        update_display_record(pidObj, function () {
                        });

                         */

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 250);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                callback(null, obj);
            });
    }
};
