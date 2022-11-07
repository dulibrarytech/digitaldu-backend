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

const ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config')();
const ARCHIVESSPACE_LIB = require('../archivesspace');
const TEST_RECORDS = require('../../test/test_records')();
const LIB = new ARCHIVESSPACE_LIB(ARCHIVESSPACE_CONFIG);
let session = await LIB.get_session_token();

it('ArchivesSpace ping', async function () {
    const response = {
        error: false,
        status: 'up',
        message: 'ArchivesSpace service is available'
    };

    await expect(LIB.ping()).resolves.toMatchObject(response);
}, 10000);

it('Get ArchivesSpace record', async function () {
    let uri = '/repositories/2/archival_objects/143818';
    await expect(LIB.get_record(uri, session)).resolves.toBeDefined();
}, 10000);

it('Destroy ArchivesSpace session', async function () {
    const response = { data: { status: 'session_logged_out' } };
    await expect(LIB.destroy_session_token(session)).resolves.toMatchObject(response);
}, 10000);
