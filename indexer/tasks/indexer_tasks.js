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

const DISPLAY_RECORD_LIB = require('../../libs/display_record');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to index record(s)
 * @param DB
 * @param TABLE
 * @type {Indexer_tasks}
 */
const Indexer_tasks = class {

    constructor(uuid, DB, TABLE) {
        this.uuid = uuid;
        this.DB = DB;
        this.TABLE = TABLE;
        this.DRL = new DISPLAY_RECORD_LIB(this.DB, this.TABLE);
    }

    /**
     * Retrieves display record data by uuid
     */
    get_index_display_record_data = () => {

        let promise = new Promise((resolve, reject) => {

            try {

                (async () => {
                    resolve(await this.DRL.get_db_display_record_data(this.uuid));
                })();

            } catch (error) {
                reject(error);
            }

        });

        return promise.then((data) => {
            return data;
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
        });
    }
};

module.exports = Indexer_tasks;
