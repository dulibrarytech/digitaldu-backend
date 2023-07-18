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

const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const TABLE = DB_TABLES.repo.repo_objects;
const QA_TASKS = require('../qa/tasks/check_collection_tasks');
const LOGGER = require('../libs/log4');

/**
 * Checks if collection exists
 * @param uri
 * @param callback

exports.check_collection = (uri, callback) => {

    (async () => {

        try {

            const QA_TASK = new QA_TASKS(DB, TABLE);
            const RECORD = await QA_TASK.check_collection(uri);

            callback({
                status: 200,
                data: RECORD
            });

        } catch(error) {
            LOGGER.module().error('ERROR: [/qa/model module (check_collection)] Unable to get collection record ' + error);
        }

    })();
};
 */