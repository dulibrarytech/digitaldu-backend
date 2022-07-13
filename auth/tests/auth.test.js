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

import {it, expect, beforeAll} from 'vitest';
require('dotenv').load();
const REQUEST = require('supertest');
const ENDPOINTS = require('../endpoints');
const EXPRESS = require('../../config/express');
const TEST_RECORDS = require('../../test/test_records')();
const DB = require('../../test/db')();
const TABLE = 'tbl_users_test';
const APP = EXPRESS();
const API_KEY = 'M7dHS21r47RsgyxSd7XJaEAgf7Miha01';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

it.concurrent('Auth authenticate task (E2E)', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.check_uri(uri)).resolves.toBeTruthy();
}, 10000);
