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
 * Object contains repository tasks
 * @param DB
 * @param DB_TABLE
 * @type {Repository_tasks}
 */
const Repository_tasks = class {

    constructor(DB, DB_TABLES) {
        this.DB = DB;
        this.DB_TABLES = DB_TABLES;
    }

    /**
     * Gets DB record
     * @param uuid
     * @param type
     * @param is_published
     */
    async get_record(uuid, type, is_published) {


        try {

            let where_obj = {};
            where_obj.pid = uuid;
            where_obj.object_type = type;
            where_obj.is_active = 1;

            if (is_published !== null) {
                where_obj.is_published = is_published;
            }

            return await this.DB(this.DB_TABLES.repo.repo_records)
            .select('display_record')
            .where(where_obj);

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (get_record)] unable to get record ' + error.message);
        }
    }

    /**
     * Updates record
     * @param uuid
     * @param type
     * @param record
     * @param is_published
     */
    async update_record(uuid, type, record, is_published) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_records)
            .where({
                pid: uuid,
                object_type: type,
                is_active: 1
            })
            .update({
                is_published: is_published,
                display_record: JSON.stringify(record)
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_record)] unable to update record ' + error.message);
        }
    }

    /**
     * Updates child records
     * @param uuid
     * @param action (publish/suppress)
     */
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

    /**
     * Gets child records
     * @param uuid
     * @param action
     */
    async get_child_records(uuid, action) {

        try {

            let where_obj = {};
            where_obj.is_member_of_collection = uuid;
            where_obj.is_active = 1;

            if (action === 'publish') {
                where_obj.is_published = 0;
            }

            return await this.DB(this.DB_TABLES.repo.repo_records)
            .select('display_record')
            .where(where_obj);

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_child_records)] unable to get child records ' + error.message);
        }
    }

    /**
     *  Updates child record
     * @param is_member_of_collection
     * @param uuid
     * @param record
     * @param is_published
     */
    async update_child_record(is_member_of_collection, uuid, record, is_published) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_records)
            .where({
                is_member_of_collection: is_member_of_collection,
                pid: uuid,
                is_active: 1
            })
            .update({
                is_published: is_published,
                display_record: JSON.stringify(record)
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_child_records)] unable to update child record ' + error.message);
        }
    }
};

module.exports = Repository_tasks;
