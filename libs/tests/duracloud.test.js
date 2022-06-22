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
const DURACLOUD_CONFIG = require('../../test/duracloud_config')();
const ARCHIVEMATICA_CONFIG = require('../../test/archivematica_config')();
const DURACLOUD_LIB = require('../duracloud');
const ARCHIVEMATICA_LIB = require('../../libs/archivematica');
const DURACLOUD = new DURACLOUD_LIB(DURACLOUD_CONFIG);
const ARCHIVEMATICA = new ARCHIVEMATICA_LIB(ARCHIVEMATICA_CONFIG);
const TEST_RECORDS = require('../../test/test_records')();

it.concurrent('Duracloud ping', async function () {
    await expect(DURACLOUD.ping()).resolves.toBeTruthy();
}, 10000);

it.concurrent('Duracloud get_mets', async function () {
    let uuid = TEST_RECORDS.child_records[2].uuid;
    let dip_path = await ARCHIVEMATICA.get_dip_path(uuid);
    await expect(DURACLOUD.get_mets(uuid, dip_path)).resolves.toBeTypeOf('object');
}, 10000);

/*
it('Archivematica Storage Service ping', async function () {
    await expect(LIB.ping_storage_api()).resolves.toBeTruthy();
}, 10000);

it('Archivematica Storage Service DIP usage', async function () {
    await expect(LIB.get_dip_storage_usage()).resolves.toBeDefined();
}, 10000);

it('Archivematica sftp', async function () {
    // TODO: await expect(LIB.list()).resolves.toBeDefined();
}, 10000);

it('Archivematica start transfer', async function () {
    // TODO:
}, 10000);

it('Archivematica approve transfer', async function () {
    // TODO:
}, 10000);

it('Archivematica get transfer status', async function () {
    // TODO:
}, 10000);

 */