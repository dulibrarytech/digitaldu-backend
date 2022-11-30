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

const DB = require('../../test/db')();
const TABLE = 'tbl_objects_test';
const UUID = '7bfde7d5-25ce-42b2-8d35-4fe43c2adc1a';
const PUBLISH_COLLECTION_RECORD_TASKS = require('../../repository/tasks/publish_collection_record_tasks');
const COLLECTION_TASKS = new PUBLISH_COLLECTION_RECORD_TASKS(UUID, DB, TABLE);

it.concurrent('Repository publish collection update_collection_status task (Integration Test)', async function () {
    await expect(COLLECTION_TASKS.update_collection_status(1)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository publish collection get_collection_uuid task (Integration Test)', async function () {
    await expect(COLLECTION_TASKS.get_collection_uuid()).resolves.toBeTypeOf('string');
}, 10000);

it.concurrent('Repository publish collection check_collection_publish_status task (Integration Test)', async function () {
    const COLLECTION_UUID = 'a5efb5d1-0484-429c-95a5-15c12ff40ca0';
    await expect(COLLECTION_TASKS.check_collection_publish_status(COLLECTION_UUID)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository publish collection publish task (Integration Test)', async function () {
    await expect(COLLECTION_TASKS.publish()).resolves.toBeTruthy();
}, 10000);
