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
                id: record.pid,
                body: record,
                refresh: true
            });

            if (response.result === 'created' || response.result === 'updated') {
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

            if (response.found === true) {
                return response._source;
            } else {
                return {
                    message: 'Record Not Found'
                }
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

            if (response.result === 'deleted') {
                return true;
            } else {
                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (delete_record)] unable to delete record ' + error.message);
            return false;
        }
    }

    /**
     * Gets DB record for full indexing
     * @param DB_TABLES
     */
    async get_record(DB_TABLES) {

        try {

            return await this.DB(DB_TABLES.repo.repo_records)
            .select('pid')
            .where({
                is_indexed: 0,
                is_active: 1
            })
            .whereNot({
                display_record: null
            })
            .orderBy('id', 'desc')
            .limit(1);

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_record)] unable to get record for indexing ' + error.message);
        }
    }

    /**
     * Gets DB record for indexing
     * @param DB_TABLES
     * @param uuid
     */
    async get_object_record(DB_TABLES, uuid) {

        try {

            return await this.DB(DB_TABLES.repo.repo_records)
            .select('pid')
            .where({
                pid: uuid,
                is_indexed: 0,
                is_active: 1
            })
            .whereNot({
                display_record: null
            })
            .orderBy('id', 'desc')
            .limit(1);

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_record)] unable to get record for indexing ' + error.message);
        }
    }

    /**
     * Gets DB record for single record index
     * @param uuid
     */
    async get_index_record(uuid) {

        try {

            const data = await this.DB(this.TABLE)
            .select('display_record')
            .where({
                pid: uuid,
                is_active: 1
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
     * Gets records by collection
     * @param DB_TABLES
     * @param uuid
     */
    async get_collection_records(DB_TABLES, uuid) {

        try {

            return await this.DB(DB_TABLES.repo.repo_records)
            .select('pid')
            .where({
                is_member_of_collection: uuid,
                is_indexed: 0,
                is_active: 1
            })
            .whereNot({
                display_record: null
            })
            .orderBy('id', 'desc')
            .limit(1);

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/indexer_index_tasks (get_record)] unable to get record for indexing ' + error.message);
        }
    }

    /**
     * Updates is_indexed status flag after a successful record index
     * @param uuid
     */
    async update_indexing_status(uuid) {

        try {

            let result = await this.DB(this.TABLE)
            .where({
                pid: uuid
            })
            .update({
                is_indexed: 1
            });
            console.log('update status ', result);
            if (result === 1) {
                return true;
            } else {
                return false;
            }

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
                is_active: 1
            })
            .update({
                is_indexed: 0
            });

            return true;

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/tasks (reset_indexed_flags)] unable to reset is_indexed fields ' + error.message);
        }
    }
};

module.exports = Indexer_index_tasks;
