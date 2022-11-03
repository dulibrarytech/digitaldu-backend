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

it('Archivesspace ping', async function () {
    const response = {
        error: false,
        status: 'up',
        message: 'Archivespace service is available'
    };

    await expect(LIB.ping()).resolves.toMatchObject(response);
}, 10000);

it('Get Archivesspace archival record', async function () {
    let record = TEST_RECORDS.child_records[1];
    let uri = record.uri;
    await expect(LIB.get_record(uri, session)).resolves.toBeDefined();
}, 10000);

// TODO: test - get resource record using get_record() function
/* TODO: function has been consolidated with get_record - handles both archival and resource records/objects
it('Get Archivesspace resource record', async function () {
    let record = TEST_RECORDS.collection_record;
    await expect(LIB.get_resource_record(record.uri, session)).resolves.toBeDefined();
}, 10000);

 */