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

const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');

/**
 * Object contains task used to publish a repository record
 * @param uuid
 * @constructor
 * @type {Publish_record_tasks}
 */
const Publish_record_tasks = class {

    constructor(uuid) {
        this.uuid = uuid;
    }

    /**
     * Publishes both collection and child records
     */
    publish_record = () => {

        let promise = new Promise((resolve, reject) => {

            let match_phrase = {
                'pid': this.uuid
            };

            HELPER.publish_record(match_phrase, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (publish_record/HELPER.publish_record)] Unable to publish record');
                    reject(new Error('ERROR: [/repository/tasks (publish_record/HELPER.publish_record)] Unable to publish record'));
                }

                resolve(result);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }
};

module.exports = Publish_record_tasks;
