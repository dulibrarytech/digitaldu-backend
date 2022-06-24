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

it.concurrent('Duracloud get_mets (Integration Test)', async function () {
    let uuid = TEST_RECORDS.child_records[2].uuid;
    let dip_path = await ARCHIVEMATICA.get_dip_path(uuid);
    await expect(DURACLOUD.get_mets(uuid, dip_path)).resolves.toBeTypeOf('object');
}, 10000);

it.concurrent('Duracloud get_object_info (Unit Test)', async function () {
    let uuid = 'c847ddc2-57c6-4a38-a27d-d56a7dcb4c07'; // <-- DIP uuid
    let file = 'B002.05.01.0387.0009.00003_001.tif';
    let dip_path = 'fdc9/78b6/1bf2/42ea/882c/e351/002e/c4c2/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.05.01.0387.0009.00003_transfer-8372f93e-01cc-4b30-8f1e-7f4d42df5ebb';
    await expect(DURACLOUD.get_object_info(uuid, dip_path, file)).resolves.not.toBeFalsy();
}, 10000);

it.concurrent('Duracloud get_uri (Unit Test)', async function () {
    let uuid = 'c847ddc2-57c6-4a38-a27d-d56a7dcb4c07'; // <-- DIP uuid
    let file = 'B002.05.01.0387.0009.00003_001.tif';
    let dip_path = 'fdc9/78b6/1bf2/42ea/882c/e351/002e/c4c2/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.05.01.0387.0009.00003_transfer-8372f93e-01cc-4b30-8f1e-7f4d42df5ebb';
    await expect(DURACLOUD.get_uri(uuid, dip_path, file)).resolves.not.toBeFalsy();
}, 10000);

// TODO: find video file with manifest
it.concurrent('Duracloud get_object_manifest (Unit Test)', async function () {
    let uuid = 'c847ddc2-57c6-4a38-a27d-d56a7dcb4c07'; // <-- DIP uuid
    let file = 'B002.05.01.0387.0009.00003_001.tif';
    let dip_path = 'fdc9/78b6/1bf2/42ea/882c/e351/002e/c4c2/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.05.01.0387.0009.00003_transfer-8372f93e-01cc-4b30-8f1e-7f4d42df5ebb';
    await expect(DURACLOUD.get_object_manifest(uuid, dip_path, file)).resolves.toBeFalsy();
}, 10000);

it.concurrent('Duracloud get_thumbnail (Unit Test)', async function () {
    // let uuid = '8372f93e-01cc-4b30-8f1e-7f4d42df5ebb'; // 'c847ddc2-57c6-4a38-a27d-d56a7dcb4c07'; // <-- DIP uuid
    let file = 'c847ddc2-57c6-4a38-a27d-d56a7dcb4c07.jpg';
    let dip_path = 'fdc9/78b6/1bf2/42ea/882c/e351/002e/c4c2/a5efb5d1-0484-429c-95a5-15c12ff40ca0_B002.05.01.0387.0009.00003_transfer-8372f93e-01cc-4b30-8f1e-7f4d42df5ebb/thumbnails/';
    let tn = dip_path + file;
    await expect(DURACLOUD.get_thumbnail(tn)).resolves.not.toBeFalsy();
}, 10000);

/*
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