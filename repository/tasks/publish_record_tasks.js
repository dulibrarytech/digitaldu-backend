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

const ES = require('elasticsearch');
const ES_CONFIG = require('../../test/elasticsearch_config')();
const INDEXER_TASKS = require('../../indexer/tasks/indexer_index_tasks');
const LOGGER = require('../../libs/log4');
const CLIENT = new ES.Client({
    host: ES_CONFIG.elasticsearch_host
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
     * Publishes both collection and child records
     * @param query
     */
    publish_record = (query) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    const INDEXER_TASK = new INDEXER_TASKS(this.DB, this.TABLE, CLIENT, ES_CONFIG);
                    let is_published = await INDEXER_TASK.publish(query);
                    console.log('IS PUBLISHED RESULT: ', is_published);

                    if (is_published === true) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }

                } catch (error) {
                    reject(false);
                    LOGGER.module().error('ERROR: [/repository/tasks (publish_record_tasks)] Unable to publish record ' + error.message);
                }
            })();
        });

        return promise.then((response) => {
            return response;
        }).catch(() => {
            return false;
        });
    }
};

module.exports = Publish_record_tasks;
