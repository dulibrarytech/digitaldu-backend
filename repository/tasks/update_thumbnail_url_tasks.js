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

const LOGGER = require("../../libs/log4");
const DR = require("../../libs/display-record");
const HELPER = require("../../repository/helper");
const CACHE = require("../../libs/cache");

/**
 * Object contains tasks used to update collection thumbnail url
 * @param uuid
 * @param thumbnail_url
 * @param DB
 * @param TABLE
 * @constructor
 */
exports.Update_thumbnail_url_tasks = function (uuid, thumbnail_url, DB, TABLE) {

    this.DB = DB;
    this.TABLE = TABLE;
    this.uuid = uuid;
    this.thumbnail_url = thumbnail_url;

    /**
     * Updates the repository record with new thumbnail url
     */
    this.update_repo_record = () => {

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .update({
                thumbnail: this.thumbnail_url
            })
            .then((data) => {

                if (data === 1) {
                    return data;
                } // TODO: else
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/repository/tasks (update_thumbnail_url/update_repo_record)] unable to update thumbnail record ' + error);
            });
    }

    /**
     * Gets display record data
     * @returns Promise string
     */
    this.get_display_record_data = () => {

        let promise = new Promise((resolve, reject) => {

            DR.get_display_record_data(this.uuid, (record_obj) => {
                // TODO: figure out how to catch error here
                // reject(new Error('Unable to get display record: data'));
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
    this.create_display_record = (data) => {

        let promise = new Promise((resolve, reject) => {

            DR.create_display_record(data, (display_record) => {

                if (typeof display_record === 'object') {
                    LOGGER.module().error('ERROR: [/repository/tasks (update_thumbnail_url_tasks/create_display_record)] Unable to get display record');
                    reject(new Error('Unable to get display record'));
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
    this.update_display_record = (display_record) => {

        let promise = new Promise((resolve, reject) => {

            let display_record_obj = JSON.parse(display_record);
            let where_obj = {
                is_member_of_collection: display_record_obj.is_member_of_collection,
                uuid: display_record_obj.uuid,
                is_active: 1
            };

            DR.update_display_record(where_obj, display_record, (result) => {

                if (typeof result === 'object') {
                    LOGGER.module().error('ERROR: [/repository/tasks (update_thumbnail_url_tasks/update_display_record)] Unable to update display record');
                    reject(new Error('Unable to update display record'));
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
    this.reindex_display_record = (display_record) => {

        let promise = new Promise((resolve, reject) => {

            HELPER.index(display_record.uuid, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (update_thumbnail_url/reindex_display_record)] unable to reindex display record');
                    reject(new Error('Unable to reindex display record'));
                }

                resolve(display_record);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * Republishes display record
     * @param display_record
     */
    this.republish_display_record = (display_record) => {

        let promise = new Promise((resolve, reject) => {

            if (display_record.is_published === 1) {

                // wait to make sure updated admin record is ready
                setTimeout(() => {

                    let match_phrase = {
                        'pid': display_record.uuid
                    };

                    HELPER.reindex(match_phrase, (result) => {

                        if (result.error === true) {
                            LOGGER.module().error('ERROR: [/repository/tasks (update_thumbnail_url/republish_display_record)] unable to republish display record');
                            reject(new Error('Unable to republish display record'));
                        }

                        resolve('done');
                    });

                    CACHE.clear_cache();

                }, 7000);
            } else {
                resolve('done');
            }
        });

        return promise.then((result) => {
            return result;
        });
    }
};
