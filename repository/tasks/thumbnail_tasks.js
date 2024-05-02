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

const DB = require('../../config/db_config')();
const DB_TABLES = require('../../config/db_tables_config')();
const ES_TASKS = require('../../libs/elasticsearch');
const INDEX_TASKS = require('../../indexer/tasks/indexer_index_tasks');
const VALIDATOR = require('validator');
const LOGGER = require('../../libs/log4');

/**
 * Object contains upload thumbnail tasks
 * @type {Thumbnail_tasks}
 */
const Thumbnail_tasks = class {

    constructor(uuid, thumbnail) {
        this.uuid = uuid;
        this.thumbnail = thumbnail;
    }

    /**
     * Updates object thumbnail
     */
    async update_thumbnail() {

        try {

            const is_updated = await DB(DB_TABLES.repo.repo_records)
            .where({
                pid: this.uuid,
                is_active: 1
            })
            .update({
                thumbnail: this.thumbnail
            })

            if (is_updated === 1) {

                let record = await this.get_index_record();
                let index_record = JSON.parse(record[0].display_record);
                index_record.thumbnail = VALIDATOR.unescape(this.thumbnail);
                let is_updated = await this.update_index_record(index_record);

                if (is_updated === 1) {
                    await this.reindex_record();
                }

            } else {
                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/uploads/tasks (update_thumbnail)] unable to update thumbnail ' + error.message);
        }
    }

    /**
     * Gets index (display) record
     */
    async get_index_record() {

        try {

            return await DB(DB_TABLES.repo.repo_records)
            .select('display_record')
            .where({
                pid: this.uuid
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/tasks (get_index_record)] unable to get index record (display record) ' + error.message);
        }
    }

    /**
     * Updates index (display) record
     * @param index_record
     */
    async update_index_record(index_record) {

        try {

            return await DB(DB_TABLES.repo.repo_records)
            .where({
                pid: this.uuid
            })
            .update({
                display_record: JSON.stringify(index_record)
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/tasks (update_index_record)] unable to update index record (display record) ' + error.message);
        }
    }

    /**
     * Reindexes record
     */
    async reindex_record() {

        const ES = new ES_TASKS();
        const OBJ = ES.get_es();
        const TASK_BACKEND = new INDEX_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
        let indexed_record = await TASK_BACKEND.get_indexed_record(this.uuid);
        indexed_record.thumbnail = VALIDATOR.unescape(this.thumbnail);
        await TASK_BACKEND.index_record(indexed_record);

        if (indexed_record.is_published === 1) {
            const TASK_FRONTEND = new INDEX_TASKS(DB, DB_TABLES, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
            await TASK_FRONTEND.index_record(indexed_record);
        }
    }
};

module.exports = Thumbnail_tasks;
