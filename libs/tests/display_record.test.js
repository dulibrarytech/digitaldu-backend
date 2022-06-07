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

const DB = require('../../test/db')(),
    REPO_OBJECTS = 'tbl_objects_test',
    DISPLAY_RECORD_LIB = require('../display_record'),
    LIB = new DISPLAY_RECORD_LIB(DB, REPO_OBJECTS),
    TEST_RECORDS = require('../../test/test_records')();

it('Create display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let metadata;
    metadata = JSON.stringify(record.metadata);
    record.metadata = metadata;
    expect(LIB.create_display_record(record)).toBeTypeOf('string');
}, 10000);

it('Update display record', async function () {
    let record = TEST_RECORDS.child_records[1];
    let display_record = JSON.stringify(record.display_record);
    let where_obj = {
        is_member_of_collection: record.is_member_of_collection,
        uuid: record.uuid,
        is_active: 1
    };

    await expect(LIB.update_display_record(where_obj, display_record)).resolves.toBeTruthy();
}, 10000);

it('Get DB display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_db_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);

it('Get index display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_index_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);

it('Get display record data', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);
