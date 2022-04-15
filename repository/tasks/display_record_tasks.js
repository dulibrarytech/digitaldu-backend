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

const DR = require('../../libs/display-record');
const HELPER = require('../../repository/helper');
const LOGGER = require('../../libs/log4');

/**
 * Updates display record
 * @param uuid
 * @type {Display_record_tasks}
 */
const Display_record_tasks = class {

    constructor(uuid) {
        this.uuid = uuid;
    }

    /**
     * Executes tasks to update display record
     */
    update = () => {

        (async () => {

            let data;
            let display_record;

            data = await this.get_display_record_data();
            display_record = await this.create_display_record(data);
            await this.update_display_record(display_record);
            await this.reindex_display_record(JSON.parse(display_record));

        })();
    };

    /**
     * Gets display record data
     * @returns Promise string
     */
    get_display_record_data = () => {

        let promise = new Promise((resolve, reject) => {

            DR.get_display_record_data(this.uuid, (record_obj) => {
                resolve(record_obj);
            });

        });

        return promise.then((data) => {
            return data;
        });
    }

    /**
     * Creates updated display record
     * @param data
     * returns Promise
     */
    create_display_record = (data) => {

        let promise = new Promise((resolve, reject) => {

            DR.create_display_record(data, (display_record) => {

                if (typeof display_record === 'object') {
                    LOGGER.module().error('ERROR: [/repository/tasks (create_display_record)] Unable to create display record');
                    reject(new Error('ERROR: [/repository/tasks (create_display_record)] Unable to create display record'));
                }

                resolve(display_record);
            });
        });

        return promise.then((display_record) => {
            return display_record;
        });
    }

    /**
     * Updates display record
     * @param display_record
     */
    update_display_record = (display_record) => {

        let promise = new Promise((resolve, reject) => {

            let display_record_obj = JSON.parse(display_record);
            let where_obj = {
                is_member_of_collection: display_record_obj.is_member_of_collection,
                uuid: display_record_obj.uuid,
                is_active: 1
            };

            DR.update_display_record(where_obj, display_record, (result) => {

                if (typeof result === 'object') {
                    LOGGER.module().error('ERROR: [/repository/tasks (update_display_record/DR.update_display_record)] Unable to update display record');
                    reject(new Error('ERROR: [/repository/tasks (update_display_record/DR.update_display_record)] Unable to update display record'));
                }

                resolve(result);
            });
        });

        return promise.then((display_record) => {
            return display_record;
        });
    }

    /**
     * Reindexes display record
     * @param display_record
     */
    reindex_display_record = (display_record) => {

        let promise = new Promise((resolve, reject) => {

            HELPER.index(display_record.uuid, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (reindex_display_record/HELPER.index)] Unable to reindex display record');
                    reject(new Error('Unable to reindex display record'));
                }

                resolve(display_record);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }
};

module.exports = Display_record_tasks;
