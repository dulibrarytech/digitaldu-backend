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

'use strict';

const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const TABLE = DB_TABLES.repo.repo_users;
const AUTH_TASKS = require('../auth/tasks/auth_tasks');
const REPOSITORY_ENDPOINTS = require('../repository/endpoints')();
const USERS_ENDPOINTS = require('../users/endpoints')();
const STATS_ENDPOINTS = require('../stats/endpoints')();
const SEARCH_ENDPOINTS = require('../search/endpoints')();
const QA_ENDPOINTS = require('../qa/endpoints')();
const LOGGER = require('../libs/log4');

/**
 * Auth Model
 * @type {Auth_model}
 */
const Auth_model = class {

    constructor() {};

    /**
     * Checks user is registered to login to app
     * @param username
     */
    async check_auth_user(username) {

        try {
            const TASKS = new AUTH_TASKS(DB, TABLE);
            return await TASKS.check_auth_user(username);
        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/model (check_auth_user)] unable to check user auth data ' + error.message);
        }
    }

    /**
     * Gets user profile data and repository app API endpoints
     * @param id
     */
    async get_auth_user_data(id) {

        try {
            const TASKS = new AUTH_TASKS(DB, TABLE);
            const data = await TASKS.get_auth_user_data(id);
            let auth_data = {
                user_data: data,
                endpoints: {
                    repository: REPOSITORY_ENDPOINTS,
                    users: USERS_ENDPOINTS,
                    stats: STATS_ENDPOINTS,
                    search: SEARCH_ENDPOINTS,
                    qa: QA_ENDPOINTS
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

            return response;

        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/model (get_auth_user_data)] unable to get user auth data ' + error.message);
        }
    };
}

module.exports = Auth_model;
