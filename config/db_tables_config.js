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

'use strict';

const DB_TABLES_CONFIG = {
    repo: {
        repo_db: process.env.DB_NAME,
        repo_objects: process.env.REPO_OBJECTS,
        repo_users: process.env.REPO_USERS,
    },
    repo_queue: {
        repo_queue_db: '',
        repo_archivematica_queue: process.env.REPO_ARCHIVEMATICA_QUEUE,
        repo_duracloud_queue: process.env.REPO_DURACLOUD_QUEUE
    }
};

module.exports = function () {
    return DB_TABLES_CONFIG;
};