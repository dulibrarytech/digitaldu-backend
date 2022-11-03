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
const TEST_RECORDS = require('../../test/test_records')();
const CREATE_COLLECTION_TASKS = require('../tasks/create_collection_tasks');
const ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config')();
const ARCHIVESSPACE = require('../../libs/archivesspace');
const ARCHIVESSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
const HANDLE_CONFIG = require('../../test/handle_config')();
const HANDLES = require('../../libs/handles');
const DB = require('../../test/db')();
const HANDLES_LIB = new HANDLES(HANDLE_CONFIG);
const TABLE = 'tbl_objects_test';
const COLLECTION_TASKS = new CREATE_COLLECTION_TASKS(DB, TABLE, ARCHIVESSPACE_LIB, HANDLES_LIB);
const TEST_RESOURCE_URI = '/repositories/2/resources/519';
const TEST_ARCHIVAL_OBJECT_URI = '';
const TEST_SESSION_TOKEN = await ARCHIVESSPACE_LIB.get_session_token();
const TEST_RESOURCE_RECORD = await ARCHIVESSPACE_LIB.get_record(TEST_RESOURCE_URI, TEST_SESSION_TOKEN);

// INTEGRATION
require('dotenv').load();
const EXPRESS = require('express');
const REQUEST = require('supertest');
const ENDPOINTS = require('../endpoints');
const TOKEN_CONFIG = require('../../test/token_config')();
const APP = EXPRESS();
const API_KEY = TOKEN_CONFIG.api_key;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

it.concurrent('Repository create collection check_uri task (Unit Test)', async function () {
    let uri = TEST_RECORDS.child_records[1].uri;
    await expect(COLLECTION_TASKS.check_uri(uri)).resolves.toBeTruthy();
}, 10000);

it.concurrent('Repository ArchivesSpace get_session_token task (Integration Test)', async function () {
    await expect(COLLECTION_TASKS.get_session_token()).resolves.toBeTypeOf('string');
}, 10000);

it.concurrent('Repository ArchivesSpace get_resource_record task (Integration Test)', async function () {
    await expect(COLLECTION_TASKS.get_resource_record(TEST_RESOURCE_URI, TEST_SESSION_TOKEN)).resolves.toBeTypeOf('string');// toBeDefined();
}, 10000);

it.concurrent('Repository create_uuid task (Unit Test)', async function () {
    await expect(COLLECTION_TASKS.create_uuid()).resolves.toBeTypeOf('string');
}, 10000);

// TODO: add clean up function
it.concurrent('Repository create_handle task (Integration Test)', async function () {
    let uuid = 'test-du-repo-2022-task';
    console.log(await COLLECTION_TASKS.create_handle(uuid));
    // await expect(LIB.create_handle(uuid)).resolves.toBeTypeOf('string');
}, 10000);

// TODO
it.concurrent('Repository create display record task (Integration Test)', function () {
    let obj = {};
    obj.is_member_of_collection = 'root';
    obj.uri = TEST_RESOURCE_URI;
    obj.token = TEST_SESSION_TOKEN;
    obj.metadata = JSON.stringify(TEST_RESOURCE_RECORD.metadata);
    obj.uuid = '589f9eb5-6bfb-403c-b836-7f067a167249';
    obj.handle = 'https://test-handle/test-du-repo-2022-task';
    // console.log(obj);
    // TODO: validator path needs to be adjusted
    console.log('create dr: ', COLLECTION_TASKS.create_index_record(obj));
    // expect(COLLECTION_TASKS.create_display_record(record)).toBeTypeOf('string');
}, 10000);

/*
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
        await expect(COLLECTION_TASKS.save_record(record)).resolves.toBeTruthy();
    } catch(error) {
        console.log(error);
    }

}, 10000);
*/

/* TODO
it('Repository API Endpoint (E2E) ' + ENDPOINTS().repository.repo_ping.endpoint, async function() {
    let response = await REQUEST(APP)
        .get(ENDPOINTS().repository.repo_ping.endpoint + '?api_key=' + API_KEY);
    console.log('ping: ', response.status);
    expect(response.status).toBe(200);
}, 10000);
*/

/*
it.concurrent('Repository API Endpoint ' + ENDPOINTS().repository.repo_record.endpoint + ' (E2E)', async function() {
    let uuid = 'root'; // TEST_RECORDS.child_records[2].uuid;
    let response = await REQUEST(APP)
        .get(ENDPOINTS().repository.repo_record.endpoint + '?api_key=' + API_KEY + '&uuid=' + uuid);
    expect(response.status).toBe(200);
}, 10000);

it.concurrent('Repository API Endpoint ' + ENDPOINTS().repository.repo_records.endpoint + ' (E2E)', async function() {
    let uuid = TEST_RECORDS.child_records[2].uuid;
    let response = await REQUEST(APP)
        .get(ENDPOINTS().repository.repo_records.endpoint + '?api_key=' + API_KEY + '&uuid=' + uuid);
    expect(response.status).toBe(200);
}, 10000);

 */
