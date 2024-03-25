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

const REPOSITORY_RECORD_TASKS = require('../tasks/index_record_tasks');
const INDEXER_RECORD_TASKS = require('../../indexer/tasks/indexer_index_tasks');
const LOGGER = require('../../libs/log4');
const {Client} = require("@elastic/elasticsearch");
const ES_CONFIG = require('../../test/elasticsearch_config')();
const CLIENT = new Client({
    node: ES_CONFIG.elasticsearch_host
});

/**
 * Object contains task used to publish a repository record
 * @param uuid
 * @constructor
 * @type {Publish_record_tasks}
 */
const Publish_record_tasks = class {

    constructor(UUID, DB, TABLE) {
        this.UUID = UUID;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Publishes both collection and child records - publish_collection_record
     */
    publish_collection_record = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    const INDEXER_TASKS = new INDEXER_RECORD_TASKS(this.DB, this.TABLE, CLIENT, ES_CONFIG);
                    const RECORD_TASKS = new REPOSITORY_RECORD_TASKS(this.UUID, this.DB, this.TABLE);
                    let record = {};
                    let record_data = await RECORD_TASKS.get_index_record_data();
                    let index_record = await RECORD_TASKS.create_index_record(record_data);
                    record.index_record = JSON.stringify(index_record);
                    let response = await INDEXER_TASKS.index_record(this.UUID, true, record);

                    if (response.statusCode === 201 || response.statusCode === 200) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/repository/tasks (publish_collection_record)] unable to publish collection record ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((is_published) => {
            return is_published;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Publish_record_tasks;
