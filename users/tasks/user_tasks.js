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
 * Object contains user tasks
 * @param DB
 * @param DB_TABLE
 * @type {User_tasks}
 */
const User_tasks = class {

    constructor(DB, DB_TABLES) {
        this.DB = DB;
        this.DB_TABLES = DB_TABLES;
    }

    /**
     * Gets all users
     */
    async get_users() {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .select(
                'tbl_users.id',
                'tbl_users.du_id',
                'tbl_users.email',
                'tbl_users.first_name',
                'tbl_users.last_name',
                'tbl_users.is_active',
                'tbl_users.created'
            );

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (get_users)] unable to get users ' + error.message);
        }
    }

    /**
     * Gets user by id
     * @param id
     */
    async get_user(id) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .select('id', 'du_id', 'email', 'first_name', 'last_name', 'is_active', 'created')
            .where({
                id: id
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (get_user)] unable to get user ' + error.message);
        }
    }

    /**
     *  Checks if user has permission to user app
     * @param username
     */
    async check_auth_user(username) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .select('id', 'du_id')
            .where({
                du_id: username,
                is_active: 1
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (check_auth_user)] unable to check auth user ' + error.message);
        }
    }

    /**
     * Gets user profile data
     * @param username
     */
    async get_auth_user_data(username) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .select('id', 'du_id', 'email', 'first_name', 'last_name')
            .where({
                du_id: username,
                is_active: 1
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (get_auth_user_data)] unable to get user data ' + error.message);
        }
    }

    /**
     * Updates user record
     * @param id
     * @param user
     */
    async update_user(id, user) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .where({
                id: id
            })
            .update(user);

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (update_user)] unable to update user record ' + error.message);
        }
    }

    /**
     * Saves user record
     * @param user
     */
    async save_user(user) {

        try {

            const username = await this.DB(this.DB_TABLES.repo.repo_user_records)
            .count('du_id as du_id')
            .where('du_id', user.du_id)

            if (username[0].du_id === 1) {
                return false;
            } else {

                user.email = user.email.toLowerCase();
                return await this.DB(this.DB_TABLES.repo.repo_user_records)
                .insert(user);
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (save_user)] unable to save user data ' + error.message);
        }
    }

    /**
     * Deletes user record
     * @param id
     */
    async delete_user(id) {

        try {

            return await this.DB(this.DB_TABLES.repo.repo_user_records)
            .where({
                id: id
            })
            .del();

        } catch (error) {
            LOGGER.module().error('ERROR: [/users/tasks (delete_user)] unable to delete user record ' + error.message);
        }
    }
};

module.exports = User_tasks;
