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

'use strict';

const USER_TASKS = require('../users/tasks/user_tasks');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const LOGGER = require('../libs/log4');

/**
 * Gets all users
 * @param callback
 */
exports.get_users = function (callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const users = await USER_TASK.get_users();

            callback({
                status: 200,
                data: users,
                message: 'Users retrieved.'
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model (get_users)] unable to get users ' + error.message);
    }
};

/**
 * Gets one user
 * @param id
 * @param callback
 */
exports.get_user = function (id, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const user = await USER_TASK.get_user(id);

            if (user.length === 1 && user[0].id === parseInt(id)) {
                callback({
                    status: 200,
                    data: user,
                    message: 'User retrieved.'
                });
            } else {
                callback({
                    status: 200,
                    data: [],
                    message: 'Unable to get user.'
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model (get_user)] unable to get user by id ' + error.message);
    }
};

/**
 * Checks user access
 * @param username
 * @param callback
 */
exports.check_auth_user = function (username, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const auth_check = await USER_TASK.check_auth_user(username);

            if (auth_check.length === 1 && auth_check[0].du_id === username) {
                callback({
                    auth: true,
                    data: auth_check[0].id
                });
            } else {
                callback({
                    auth: false,
                    data: []
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model (get_user)] unable to get user by id ' + error.message);
    }
};

/**
 * Gets user data
 * @param username
 * @param callback
 */
exports.get_auth_user_data = function (username, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const auth_data = await USER_TASK.get_auth_user_data(username);

            if (auth_data.length === 1) {
                callback({
                    data: auth_data
                });
            } else {
                callback({
                    data: []
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model module (get_auth_user_data)] unable to get user data ' + error.message);
    }
};

/**
 * Updates user data
 * @param id
 * @param user
 * @param callback
 */
exports.update_user = function (id, user, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const is_updated = await USER_TASK.update_user(id, user);

            if (is_updated === 1) {
                callback({
                    status: 201,
                    message: 'User updated.'
                });
            } else {
                callback({
                    status: 200,
                    message: 'Unable to update user record.'
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model module (update_user)] unable to update user record ' + error.message);
    }
};

/**
 * Saves user data
 * @param user
 * @param callback
 */
exports.save_user = function (user, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const is_saved = await USER_TASK.save_user(user);

            if (is_saved === false) {
                callback({
                    status: 200,
                    message: 'User is already in the system.'
                });
            } else {
                callback({
                    status: 201,
                    message: 'User record saved'
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model (save_user)] unable to save user data ' + error.message);
    }


    return false;
};

/**
 * Deletes user data
 * @param id
 * @param callback
 */
exports.delete_user = function (id, callback) {

    try {

        (async function () {

            const USER_TASK = new USER_TASKS(DB, DB_TABLES);
            const is_deleted = await USER_TASK.delete_user(id);

            if (is_deleted === false) {
                callback({
                    status: 200,
                    message: 'Unable to delete user.'
                });
            } else {
                callback({
                    status: 204,
                    message: 'User deleted.'
                });
            }

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/users/model module (delete_user)] unable to delete user record ' + error.message);
    }
};
