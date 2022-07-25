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

const HANDLE_CONFIG = require('../../test/handle_config')();
const HANDLE_LIB = require('../../libs/handles');
// TODO...
it('Create record handle', async function () {
    const LIB = new HANDLE_LIB(HANDLE_CONFIG);
    let uuid = 'test-du-repo-2022';
    console.log(await LIB.create_handle(uuid));
    // await expect(LIB.create_handle(uuid)).resolves.toBeTypeOf('string');
}, 10000);

it('Update record handle', async function () {
    const LIB = new HANDLE_LIB(HANDLE_CONFIG);
    let prev_uuid = 'test-du-repo-2022';
    let new_uuid = 'test-du-repo-update-2022';
    console.log(await LIB.update_handle(prev_uuid, new_uuid));
    // await expect(LIB.update_handle(prev_uuid, new_uuid)).toBeTypeOf('string');
}, 10000);

it('Delete record handle', async function () {
    const LIB = new HANDLE_LIB(HANDLE_CONFIG);
    let uuid = 'test-du-repo-2022';let new_uuid = 'test-du-repo-update-2022';
    console.log(await LIB.delete_handle(uuid));
    // await expect(LIB.update_handle(prev_uuid, new_uuid)).toBeTypeOf('string');
}, 10000);
