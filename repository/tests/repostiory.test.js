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

const TEST_RECORDS = require('../../test/test_records')();
const DB = require('../../test/db')();
const TABLE = 'tbl_objects_test';
const CREATE_COLLECTION_TASKS = require('../tasks/create_collection_tasks');

it('Repository create collection task', async function () {
    const LIB = new CREATE_COLLECTION_TASKS(DB, TABLE);
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.check_uri(uri)).resolves.toBeTruthy();
}, 10000);