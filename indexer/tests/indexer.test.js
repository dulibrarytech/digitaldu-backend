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

// INTEGRATION
require('dotenv').load();
/*
const EXPRESS = require('express');
const REQUEST = require('supertest');
const ENDPOINTS = require('../endpoints');
const TOKEN_CONFIG = require('../../test/token_config')();
const APP = EXPRESS();
const API_KEY = TOKEN_CONFIG.api_key;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
 */

const { Client } = require('@elastic/elasticsearch');
const TEST_RECORDS = require('../../test/test_records')();
const DB = require('../../test/db')();
const TABLE = 'tbl_objects_test';
const INDEXER_INDEX_TASKS = require('../tasks/indexer_index_tasks');
const ES_CONFIG = require('../../test/elasticsearch_config')();
const CLIENT = new Client({
    node: ES_CONFIG.elasticsearch_host
});

const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, TABLE, CLIENT, ES_CONFIG)

it('Index Tasks index_record (Unit)', async function () {
    const uuid = TEST_RECORDS.test_index_record.uuid
    const is_published = true;
    const record = {};
    record.index_record = JSON.stringify(TEST_RECORDS.test_index_record);
    await expect(INDEX_TASKS.index_record(uuid, is_published, record)).resolves.toBeTypeOf('object');
}, 10000);

it('Index Tasks reset_indexed_flags (Unit)', async function () {
    await expect(INDEX_TASKS.reset_indexed_flags()).resolves.toBeTruthy();
}, 10000);

it('Index Tasks get_record_uuid (Unit)', async function () {
    await expect(INDEX_TASKS.get_record_uuid({
        is_indexed: 0,
        is_active: 1
    })).resolves.toBe('a5efb5d1-0484-429c-95a5-15c12ff40ca0');
}, 10000);

it('Index Tasks update_indexing_status (Unit)', async function () {
    const uuid = 'a5efb5d1-0484-429c-95a5-15c12ff40ca0';
    await expect(INDEX_TASKS.update_indexing_status(uuid)).resolves.toBeTruthy();
}, 10000);

it('Index Tasks publish (Unit)', async function () {
    let match_phrase = {
        'is_member_of_collection': TEST_RECORDS.test_index_record.uuid
    };
    let query = {};
    let bool = {};
    bool.must = {};
    bool.must.match_phrase = match_phrase;
    query.bool = bool;
    await expect(INDEX_TASKS.publish(query)).resolves.toBeTypeOf('object');
}, 10000);

it('Index Tasks suppress (Unit)', async function () {
    const uuid = TEST_RECORDS.test_index_record.uuid;
    await expect(INDEX_TASKS.suppress(uuid)).resolves.toBeDefined();
}, 10000);

it('Index Tasks delete (Unit)', async function () {
    const uuid = TEST_RECORDS.test_index_record.uuid;
    await expect(INDEX_TASKS.delete(uuid)).resolves.toBeTruthy();
}, 10000);
