/**

 Copyright 2024 University of Denver

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

const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to index record(s)
 * @param DB
 * @param TABLE
 * @param CLIENT
 * @param INDEX
 * @type {Indexer_index_tasks}
 */
const Indexer_index_tasks = class {

    constructor(DB, TABLE, CLIENT, INDEX) {
        this.DB = DB;
        this.TABLE = TABLE;
        this.CLIENT = CLIENT;
        this.INDEX = INDEX;
    }

    /**
     * Indexes record
     * @param record
     */
    async index_record(record) {

        try {

            let response = await this.CLIENT.index({
                index: this.INDEX,
                id: record.uuid,
                body: record,
                refresh: true
            });

            if (response.statusCode === 201 || response.statusCode === 200) {
                return true;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (index_record)] unable to index record ' + error.message);
            return false;
        }
    }

    /**
     * Gets record by id from index
     * @param uuid
     */
    async get_indexed_record(uuid) {

        try {

            const response = await this.CLIENT.get({
                index: this.INDEX,
                id: uuid,
            });

            if (response.statusCode === 200) {
                return response;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_indexed_record)] unable to get indexed record ' + error.message);
            return false;
        }
    }

    /**
     * Deletes record from index
     * @param uuid
     */
    async delete_record(uuid) {

        try {

            let response = await this.CLIENT.delete({
                index: this.INDEX,
                id: uuid,
                refresh: true
            });

            if (response.statusCode === 200) {
                return true;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (delete_record)] unable to index record ' + error.message);
            return false;
        }
    }

    /**
     * Gets DB record for full indexing
     */
    async get_record() {

        try {

            const data = await this.DB(this.TABLE)
            .select('*')
            .where({
                is_published: 1,
                is_deleted: 0,
                is_indexed: 0
            })
            .limit(1);

            if (data === undefined || data.length === 0) {
                return 0;
            }

            return data[0];

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_record)] unable to get record ' + error.message);
        }
    }

    /**
     * Gets DB record for single record index
     * @param uuid
     */
    async get_index_record(uuid) {

        try {

            const data = await this.DB(this.TABLE)
            .select('*')
            .where({
                uuid: uuid,
                is_published: 1,
                is_deleted: 0
            })
            .limit(1);

            if (data === undefined || data.length === 0) {
                return 0;
            }

            return data[0];

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_index_record)] unable to get record ' + error.message);
        }
    }

    /**
     * Updates is_indexed status flag after a successful record index
     * @param uuid
     */
    async update_indexing_status(uuid) {

        try {

            await this.DB(this.TABLE)
            .where({
                uuid: uuid
            })
            .update({
                is_indexed: 1
            });

            return true;

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/model module (index_records)] unable to update is_indexed field ' + error.message);
        }
    }

    /**
     * Resets is_indexed DB flags
     * returns Promise string
     */
    async reset_indexed_flags() {

        try {

            await this.DB(this.TABLE)
            .where({
                is_indexed: 1,
                is_deleted: 0
            })
            .update({
                is_indexed: 0
            });

            return true;

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/model module (index_records)] unable to reset is_indexed fields ' + error.message);
        }
    }
};

module.exports = Indexer_index_tasks;
