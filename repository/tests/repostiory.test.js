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
const TABLE = 'tbl_objects_test';
const CREATE_COLLECTION_TASKS = require('../tasks/create_collection_tasks');
const ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config')();
const ARCHIVESSPACE_LIB = require('../../libs/archivesspace');
const ASPACE_LIB = new ARCHIVESSPACE_LIB(
        ARCHIVESSPACE_CONFIG.archivesspace_host,
        ARCHIVESSPACE_CONFIG.archivesspace_user,
        ARCHIVESSPACE_CONFIG.archivesspace_password,
        ARCHIVESSPACE_CONFIG.archivesspace_repository_id);
const APP = EXPRESS();
let result = await ASPACE_LIB.get_session_token();
let json = JSON.parse(result.data);
let session = json.session;
const LIB = new CREATE_COLLECTION_TASKS(DB, TABLE);
const API_KEY = 'M7dHS21r47RsgyxSd7XJaEAgf7Miha01';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

it.concurrent('Repository create collection task', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.check_uri(uri)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository get Archivesspace session token task (Integration Test)', async function () {
    await expect(LIB.get_session_token()).resolves.toBeTypeOf('string');
}, 10000);

it.concurrent('Repository get Archivesspace get resource record task (Integration Test)', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(LIB.get_resource_record(uri, session)).resolves.toBeTypeOf('object');
}, 10000);

it.concurrent('Repository create UUID task', async function () {
    await expect(LIB.create_uuid()).resolves.toBeTypeOf('string');
}, 10000);

it.concurrent('Repository create handle task (Integration Test)', async function () {
    let uuid = 'test-du-repo-2022-task'
    await expect(LIB.create_handle(uuid)).resolves.toBeTypeOf('string');
}, 10000);

it.concurrent('Repository create display record task (Integration Test)', function () {
    let record = TEST_RECORDS.child_records[1];
    let metadata;
    metadata = JSON.stringify(record.metadata);
    record.metadata = metadata;
    expect(LIB.create_display_record(record)).toBeTypeOf('string');
}, 10000);

it.concurrent('Repository save record task (Integration Test)', async function () {

    try {
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
    } catch(error) {
        console.log(error);
    }

}, 10000);

/* TODO
it('Repository API Endpoint (E2E) ' + ENDPOINTS().repository.repo_ping.endpoint, async function() {
    let response = await REQUEST(APP)
        .get(ENDPOINTS().repository.repo_ping.endpoint + '?api_key=' + API_KEY);
    console.log('ping: ', response.status);
    expect(response.status).toBe(200);
}, 10000);
*/

it.concurrent('Repository API Endpoint (E2E) ' + ENDPOINTS().repository.repo_records.endpoint, async function() {
    let uuid = TEST_RECORDS.child_records[2].uuid;
    let response = await REQUEST(APP)
        .get(ENDPOINTS().repository.repo_records.endpoint + '?api_key=' + API_KEY + '&uuid=' + uuid);
    expect(response.status).toBe(200);
}, 10000);


