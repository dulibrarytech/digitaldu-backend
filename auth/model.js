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

'use strict';

const DB =require('../config/db_config')(),
    TABLE = 'tbl_users_test',
    AUTH_TASKS = require("../auth/tasks/auth_tasks"),
    REPOSITORY_ENDPOINTS = require('../repository/endpoints')(),
    USERS_ENDPOINTS = require('../users/endpoints')(),
    STATS_ENDPOINTS = require('../stats/endpoints')(),
    SEARCH_ENDPOINTS = require('../search/endpoints')(),
    LOGGER = require('../libs/log4');

/**
 * Checks auth user
 * @param username
 * @param callback
 */
exports.check_auth_user = function (username, callback) {

    (async () => {

        try {
            const TASKS = new AUTH_TASKS(DB, TABLE);
            const data = await TASKS.check_auth_user(username);
            callback(data);
        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/model (check_auth_user)] unable to check user auth data ' + error.message);
            callback(false);
        }

    })();
};

/**
 * Gets user auth data
 * @param id
 * @param callback
 */
exports.get_auth_user_data = function (id, callback) {

    (async () => {

        try {

            const TASKS = new AUTH_TASKS(DB, TABLE);
            const data = await TASKS.get_auth_user_data(id);
            let auth_data = {
                user_data: data,
                endpoints: {
                    repository: REPOSITORY_ENDPOINTS,
                    users: USERS_ENDPOINTS,
                    stats: STATS_ENDPOINTS,
                    search: SEARCH_ENDPOINTS
                }
            };

            let response = {
                status: 200,
                message: 'User data retrieved.',
                data: auth_data
            };

            if (data === false) {
                response = {
                    status: 500,
                    message: 'Unable to retrieve user data.',
                    data: []
                }
            }

            callback(response);

        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/model (get_auth_user_data)] unable to get user auth data ' + error.message);
            callback(false);
        }

    })();
};
