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

const INDEX_RECORD_TASKS = require('../tasks/index_record_tasks');
const DB = require('../../test/db')();
const TABLE = 'tbl_objects_test';
const UUID = '7bfde7d5-25ce-42b2-8d35-4fe43c2adc1a';
const RECORD_TASKS = new INDEX_RECORD_TASKS(UUID, DB, TABLE);

it.concurrent('Repository index record update task (Integration Test)', async function () {
    await expect(RECORD_TASKS.update()).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository get_index_record_data task (Integration Test)', async function () {
    await expect(RECORD_TASKS.get_index_record_data()).resolves.toBeDefined();
}, 10000);

it.concurrent('Repository create_index_record task (Integration Test)', async function () {
    const RECORD_TASKS = new INDEX_RECORD_TASKS(UUID, DB, TABLE);
    const INDEX_RECORD = await RECORD_TASKS.get_index_record_data();
    await expect(RECORD_TASKS.create_index_record(INDEX_RECORD)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository update_index_record task (Integration Test)', async function () {
    const INDEX_RECORD_DATA = await RECORD_TASKS.get_index_record_data();
    const INDEX_RECORD = await RECORD_TASKS.create_index_record(INDEX_RECORD_DATA);
    await expect(RECORD_TASKS.update_index_record(UUID, INDEX_RECORD)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository reindex_index_record task (Integration Test)', async function () {
    await expect(RECORD_TASKS.reindex_index_record(UUID)).resolves.toBeTypeOf('object');
}, 10000);
