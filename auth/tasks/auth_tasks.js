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
 * @type {Auth_tasks}
 */
const Auth_tasks = class {

    constructor(DB, DB_TABLES) {
        this.DB = DB;
        this.DB_TABLES = DB_TABLES;
    }

    /**
     * Saves token to user record
     * @param username
     * @param token
     */
    async save_token(username, token) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .where({
                du_id: username,
                is_active: 1
            })
            .update({
                token: token
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_record)] unable to save token to user record ' + error.message);
        }
    }

    /**
     * Deletes refresh token
     * @param id
     */
    async delete_token(id) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .where({
                id: id,
                is_active: 1
            })
            .update({
                token: 0
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/repository_tasks (update_record)] unable to save token to user record ' + error.message);
        }
    }

    /**
     * gets token
     * @param id
     */
    async get_token(id) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .select('du_id', 'token')
            .where({
                id: id,
                is_active: 1
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/tasks (get_token)] unable to get token ' + error.message);
        }
    }
};

module.exports = Auth_tasks;
