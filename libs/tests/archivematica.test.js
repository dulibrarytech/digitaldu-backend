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

const ARCHIVEMATICA_CONFIG = require('../../test/archivematica_config')(),
    ARCHIVEMATICA_LIB = require('../archivematica'),
    LIB = new ARCHIVEMATICA_LIB(ARCHIVEMATICA_CONFIG);

it('Archivematica ping', async function () {
    const response = {
        status: 'up',
        message: 'Archivematica service is available'
    };

    await expect(LIB.ping_api()).resolves.toMatchObject(response);
}, 10000);

it('Archivematica Storage Service ping', async function () {
    const response = {
        status: 'up',
        message: 'Archivematica storage api service is available'
    };

    await expect(LIB.ping_storage_api()).resolves.toMatchObject(response);
}, 10000);

it('Archivematica Storage Service DIP usage', async function () {
    await expect(LIB.get_dip_storage_usage()).resolves.toBeDefined();
}, 10000);

it('Archivematica sftp', async function () {
    await expect(LIB.list()).resolves.toBeDefined();
}, 10000);