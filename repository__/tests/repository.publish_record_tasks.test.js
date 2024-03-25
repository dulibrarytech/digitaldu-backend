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
const PUBLISH_RECORD_TASKS = require('../tasks/publish_record_tasks');
const UUID = '';
const DB = '';
const TABLE = '';

// TODO: publish_record - redundant?
it.concurrent('Repository publish_collection_record task (Integration Test)', async function () {
    const RECORD_TASK = new PUBLISH_RECORD_TASKS(UUID, DB, TABLE);
    RECORD_TASK.publish_collection_record();
    // await expect(RECORD_TASK.publish_collection_record).resolves.toBeTruthy();
}, 10000);