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

import {it, expect} from 'vitest';
const TEST_RECORDS = require('../../test/test_records')();
const CHECK_COLLECTION_TASKS = require('../tasks/check_collection_tasks');
const DB = require('../../test/db')();
const TABLE = 'tbl_objects_test';
const COLLECTION_TASKS = new CHECK_COLLECTION_TASKS(DB, TABLE);
const TEST_RESOURCE_URI = '/repositories/2/resources/519';

it.concurrent('QA check collection check_collection task (Unit Test)', async function () {
    await expect(COLLECTION_TASKS.check_collection(TEST_RESOURCE_URI)).resolves.toBeTypeOf('boolean');
}, 10000);
