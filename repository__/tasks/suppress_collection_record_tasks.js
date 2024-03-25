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

const HELPER = require('../helper');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to suppress a repository collection record
 * @param uuid
 * @param DB
 * @param TABLE
 * @type {Suppress_collection_record_tasks}
 */
const Suppress_collection_record_tasks = class {

    constructor(uuid, DB, TABLE) {
        this.uuid = uuid;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * suppress collection record - (removes record from public index)
     * @return Promise
     */
    suppress_collection_record = () => {

        let promise = new Promise((resolve, reject) => {

            HELPER.del(this.uuid, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (suppress_collection_record)] Unable to suppress collection record');
                }

                return resolve(result);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }

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
     * Reindexes collection record
     */
    reindex_collection_record = () => {

        this.DB(this.TABLE)
            .select('uuid')
            .where({
                uuid: this.uuid,
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

                }, 50);

                return null;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (reindex_child_records)] Unable to get record uuid ' + error.message);
            });
    }
}

module.exports = Suppress_collection_record_tasks;
