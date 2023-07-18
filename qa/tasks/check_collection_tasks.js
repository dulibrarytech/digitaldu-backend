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

const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to check collection record for QA
 * @param DB
 * @param TABLE
 * @type {Check_collection_tasks}
 */
const Check_collection_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Checks uri to determine if collection already exists
     * @param uri
     * @returns boolean
     */
    check_collection = (uri) => {
        console.log('URI ', uri)
        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
            .select('is_member_of_collection', 'uuid')
            .where({
                uri: uri,
                object_type: 'collection',
                is_active: 1
            })
            .then((data) => {
                console.log('collection UUID: ', data);
                if (data.length === 0) {
                    reject(false);
                } else if (data.length === 1) {
                    resolve(true);
                } else {
                    reject(false);
                }
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/qa/model tasks (check_collection)] Unable to check collection ' + error.message);
                reject(false);
            });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = Check_collection_tasks;
