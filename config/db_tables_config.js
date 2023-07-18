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

'use strict';

const HELPER = require("../libs/helper");
const HELPER_TASK = new HELPER();
const REPO = {
    repo_db: process.env.DB_NAME,
    repo_objects: process.env.REPO_OBJECTS,
    repo_users: process.env.REPO_USERS
};
const REPO_QUEUE = {
    repo_queue_db: process.env.DB_QUEUE_NAME,
    repo_archivematica_queue: process.env.REPO_ARCHIVEMATICA_QUEUE,
    repo_duracloud_queue: process.env.REPO_DURACLOUD_QUEUE,
    repo_qa_queue: process.env.REPO_QA_QUEUE
};
const REPO_TABLES = HELPER_TASK.check_config(REPO);
const REPO_QUEUE_TABLES = HELPER_TASK.check_config(REPO_QUEUE);
const DB_TABLES_CONFIG = {
    repo: REPO_TABLES,
    repo_queue: REPO_QUEUE_TABLES
};

module.exports = function () {
    return DB_TABLES_CONFIG;
};