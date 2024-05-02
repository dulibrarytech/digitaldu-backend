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
const REPOSITORY_TASKS = require('../../repository/tasks/repository_tasks');
const LOGGER = require('../../libs/log4');

/**
 * Object contains upload thumbnail tasks
 * @type {Upload_thumbnail_tasks}
 */
const Upload_thumbnail_tasks = class {

    constructor(uuid, thumbnail_url) {
        this.uuid = uuid;
        this.thumbnail_url = thumbnail_url;
        this.repository_tasks = new REPOSITORY_TASKS(DB, DB_TABLES);
    }

    // TODO: update record

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
                thumbnail: this.thumbnail_url
            })

            if (is_updated === 1) {

                let record = await this.get_index_record();
                let json = JSON.parse(record);
                console.log(json);


            } else {
                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/uploads/tasks (update_thumbnail)] unable to update thumbnail ' + error.message);
        }
    }

    // TODO: update index record
    async get_index_record() {

        try {

            return await DB(DB_TABLES.repo.repo_records)
            .select('display_record')
            .where({
                pid: this.uuid
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/uploads/tasks (get_index_record)] unable to get index record (display record) ' + error.message);
        }
    }

    update_index_record() {
        // TODO: select index record

    }

    // TODO: reindex


    /**
     * Updates child records
     * @param uuid
     * @param action (publish/suppress)
     */
    /*
    async update_child_records(uuid, action) {

        try {

            let where_obj = {};
            let is_published_update;
            where_obj.is_member_of_collection = uuid;
            where_obj.is_active = 1;

            if (action === 'suppress') {
                where_obj.is_published = 1;
                is_published_update = 0;
            } else if (action === 'publish') {
                where_obj.is_published = 0;
                is_published_update = 1;
            }

            return await this.DB(this.DB_TABLES.repo.repo_records)
            .where(where_obj)
            .update({
                is_published: is_published_update
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_child_records)] unable to update child records ' + error.message);
        }
    }

     */
};

module.exports = Upload_thumbnail_tasks;
