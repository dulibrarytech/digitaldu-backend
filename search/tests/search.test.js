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
const EXPRESS = require('express');
const REQUEST = require('supertest');
const ENDPOINTS = require('../endpoints');
const TOKEN_CONFIG = require('../../test/token_config')();
const APP = EXPRESS();
const API_KEY = TOKEN_CONFIG.api_key;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const SEARCH_TASKS = require('../tasks/search_tasks');
const ES = require('elasticsearch');
const CONFIG = require('../../test/elasticsearch_config')();
const CLIENT = new ES.Client({
        host: CONFIG.elasticsearch_host
    });
const LIB = new SEARCH_TASKS(CLIENT, CONFIG);

it('Search Tasks search (Unit)', async function () {
    let q = 'dogs';
    let page = 1;
    let total_on_page = undefined;
    await expect(LIB.search(q, page, total_on_page)).resolves.toBeDefined();
}, 10000);

it('Search Tasks get_records (Unit)', async function () {
    let is_member_of_collection = 'codu:root';
    let page = 1;
    let total_on_page;
    let sort;
    await expect(LIB.get_records(is_member_of_collection, page, total_on_page, sort)).resolves.toBeDefined();
}, 10000);

it('Search Tasks get_suppressed_records (Unit)', async function () {
    let uuid = 'codu:root';
    // console.log(await LIB.get_suppressed_records(uuid));
    await expect(LIB.get_suppressed_records(uuid)).resolves.toBeDefined();
}, 10000);
