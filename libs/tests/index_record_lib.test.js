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

const DB = require('../../test/db')();
const REPO_OBJECTS = 'tbl_objects_test';
const VALIDATOR_CONFIG = require('../../config/index_records_validator_config')();
const INDEX_RECORD_LIB = require('../index_record_lib');
const TEST_UUID = '85de3a64-e307-41a8-8aa7-7e0ad37a6aae';
const TEST_RECORDS = require('../../test/test_records')();
const LIB = new INDEX_RECORD_LIB(DB, REPO_OBJECTS, VALIDATOR_CONFIG);
const TEST_DATA = await LIB.get_index_record_data(TEST_UUID);

it('Get index record data (Unit Test)', async function () {
    await expect(LIB.get_index_record_data(TEST_UUID)).resolves.toBeDefined();
}, 10000);

it('Create index record (Unit Test)', function () {
    expect(LIB.create_index_record(TEST_DATA)).toBeDefined();
}, 10000);

it('Flag record (Unit Test)', async function () {
    await expect(LIB.flag_record(TEST_UUID)).resolves.toBeTruthy();
}, 10000);

it('Update index record (Unit Test)', async function () {
    let index_record = TEST_RECORDS.test_index_record;
    await expect(LIB.update_index_record(index_record.uuid, index_record)).resolves.toBeTruthy();
}, 10000);
