/**

 Copyright 2023 University of Denver

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

const INDEX_RECORD_LIB = require('../../libs/index_record_lib');
const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to index record(s)
 * @param DB
 * @param TABLE
 * @type {Indexer_display_record_tasks}
 */
const Indexer_display_record_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
        this.IRL = new INDEX_RECORD_LIB(this.DB, this.TABLE);
    }

    /**
     * Retrieves index display record data by uuid
     * @param uuid
     */
    async get_index_display_record_data(uuid) {

        try {
            await this.IRL.get_index_record_data(uuid);
        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_display_record_tasks (get_index_display_record_data)] unable to get index db record ' + error.message);
        }
    }
};

module.exports = Indexer_display_record_tasks;
