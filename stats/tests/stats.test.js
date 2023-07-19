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

import {it, expect, beforeAll} from 'vitest';
const ARCHIVEMATICA = require('../../libs/archivematica');
const ARCHIVEMATICA_CONFIG = require('../../test/archivematica_config')();
const ARCHIVEMATICALIB = new ARCHIVEMATICA(ARCHIVEMATICA_CONFIG);
const DB = require('../../test/db')();
const STATS_TASKS = require('../tasks/stats_tasks');
const TABLE = 'tbl_objects_test';
const LIB = new STATS_TASKS(DB, TABLE);

it.concurrent('Stats Tasks get_total_published_collections (Unit)', async function () {
    await expect(LIB.get_total_published_collections()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_published_objects (Unit)', async function () {
    await expect(LIB.get_total_published_objects()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_collections (Unit)', async function () {
    await expect(LIB.get_total_collections()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_objects (Unit)', async function () {
    await expect(LIB.get_total_objects()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_images (Unit)', async function () {
    await expect(LIB.get_total_images()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_pdfs (Unit)', async function () {
    await expect(LIB.get_total_pdfs()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_audio (Unit)', async function () {
    await expect(LIB.get_total_audio()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_video (Unit)', async function () {
    await expect(LIB.get_total_video()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_yearly_ingests (Unit)', async function () {
    await expect(LIB.get_total_yearly_ingests()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_total_daily_ingests (Unit)', async function () {
    await expect(LIB.get_total_daily_ingests()).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_dip_storage_usage (Unit)', async function () {
    await expect(LIB.get_dip_storage_usage(ARCHIVEMATICALIB)).resolves.toBeDefined();
}, 10000);

it.concurrent('Stats Tasks get_aip_storage_usage (Unit)', async function () {
    await expect(LIB.get_aip_storage_usage(ARCHIVEMATICALIB)).resolves.toBeDefined();
}, 10000);
