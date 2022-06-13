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
const ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config')();
// const APP_CONFIG = require('');
const ARCHIVESSPACE_LIB = require('../../libs/archivesspace');
const ASPACE_LIB = new ARCHIVESSPACE_LIB(
        ARCHIVESSPACE_CONFIG.archivesspace_host,
        ARCHIVESSPACE_CONFIG.archivesspace_user,
        ARCHIVESSPACE_CONFIG.archivesspace_password,
        ARCHIVESSPACE_CONFIG.archivesspace_repository_id);

let result = await ASPACE_LIB.get_session_token();
let json = JSON.parse(result.data);
let session = json.session;
const LIB = new CREATE_COLLECTION_TASKS(DB, TABLE);

it('Repository create collection task', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.check_uri(uri)).resolves.toBeTruthy();
}, 10000);

it('Repository get Archivesspace session token task (Integration Test)', async function () {
    await expect(LIB.get_session_token()).resolves.toBeTypeOf('string');
}, 10000);

it('Repository get Archivesspace get resource record task (Integration Test)', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.get_resource_record(uri, session)).resolves.toBeTypeOf('object');
}, 10000);

it('Repository create UUID task', async function () {
    await expect(LIB.create_uuid()).resolves.toBeTypeOf('string');
}, 10000);

it('Repository create handle task (Integration Test)', async function () {
    let uuid = 'test-du-repo-2022-task'
    await expect(LIB.create_handle(uuid)).resolves.toBeTypeOf('string');
}, 10000);

it('Repository create display record task (Integration Test)', function () {
    let record = TEST_RECORDS.child_records[1];
    let metadata;
    metadata = JSON.stringify(record.metadata);
    record.metadata = metadata;
    expect(LIB.create_display_record(record)).toBeTypeOf('string');
}, 10000);

it('Repository save record task (Integration Test)', async function () {
    let record = {};
    record.is_member_of_collection = TEST_RECORDS.child_records[2].is_member_of_collection;
    record.uri = TEST_RECORDS.child_records[2].uri;
    record.metadata = TEST_RECORDS.child_records[2].metadata;
    record.uuid = TEST_RECORDS.child_records[2].uuid;
    record.handle = TEST_RECORDS.child_records[2].handle;
    record.display_record = TEST_RECORDS.child_records[2].display_record;
    record.metadata = JSON.stringify(record.metadata);
    record.display_record = JSON.stringify(record.display_record);
    await expect(LIB.save_record(record)).resolves.toBeTruthy();
}, 10000);

it('Repository index record task (Integration Test)', async function () {
    let uuid = TEST_RECORDS.child_records[2].uuid;
    console.log('INDEX RESULT: ', LIB.index_record(uuid));
    // await expect(LIB.index_record(uuid)).resolves.toBeTypeOf('string');
}, 10000);
