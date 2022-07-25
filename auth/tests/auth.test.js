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

import {it, expect} from 'vitest';
require('dotenv').load();
const REQUEST = require('supertest');
const ENDPOINTS = require('../endpoints');
const EXPRESS = require('../../config/express');
const APP = EXPRESS();
const TEST_USER_RECORDS = require('../../test/test_user_records')();
const DB = require('../../test/db')();
const AUTH_TASKS = require('../tasks/auth_tasks');
const TOKEN_CONFIG = require('../../test/token_config')();
const TABLE = 'tbl_users_test';
const LIB = new AUTH_TASKS(DB, TABLE);
const API_KEY = TOKEN_CONFIG.api_key;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

it('Auth Tasks check_auth_user (Unit Test)', async function () {
    const username = TEST_USER_RECORDS.username;
    let data = { auth: true, data: 1 };
    await expect(LIB.check_auth_user(username)).resolves.toMatchObject(data);
}, 10000);

it('Auth Tasks get_auth_user_data (Unit Test)', async function () {

    const data = {
        data: [
            {
                id: TEST_USER_RECORDS.user_record.id,
                du_id: TEST_USER_RECORDS.username,
                email: TEST_USER_RECORDS.user_record.email,
                first_name: TEST_USER_RECORDS.user_record.first_name,
                last_name: TEST_USER_RECORDS.user_record.last_name
            }
        ]
    };

    await expect(LIB.get_auth_user_data(TEST_USER_RECORDS.user_record.id)).resolves.toMatchObject(data);
}, 10000);

it('Auth API Endpoint authenticate user ' + ENDPOINTS().auth.authentication.endpoint + ' (E2E)', async function() {
    let user = TEST_USER_RECORDS.auth;
    let response = await REQUEST(APP)
        .post(ENDPOINTS().auth.authentication.endpoint)
        .send(user);
    expect(response.status).toBe(200);
}, 10000);

it('Auth API Endpoint get_auth_user_data ' + ENDPOINTS().auth.authentication.endpoint + ' (E2E)', async function() {
    let user = TEST_USER_RECORDS.user_record;
    let id = user.id;
    let response = await REQUEST(APP)
        .get(ENDPOINTS().auth.authentication.endpoint + '?id=' + id + '&api_key=' + API_KEY);
    expect(response.status).toBe(200);
}, 10000);
