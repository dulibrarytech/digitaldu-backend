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

/**
 * Object contains tasks used to publish a repository record
 * @param uuid
 * @param DB
 * @param TABLE
 * @constructor
 */
exports.Publish_record_tasks = function (uuid, DB, TABLE) {

    this.uuid = uuid;
    this.DB = DB;
    this.TABLE = TABLE;

    /**
     * Updates collection publish status
     */
    this.update_collection_status = () => {

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then((data) => {

                if (data === 1) {
                    return false;
                }

            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/repository/tasks (publish_record_tasks/update_collection_record)] unable to publish collection pid ' + error);
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
     * Updates db collection child record's publish status
     */
    this.update_child_records_status = () => {

        let where_obj = {
            is_member_of_collection: this.uuid,
            is_active: 1
        };

        this.DB(this.TABLE)
            .where(where_obj)
            .update({
                is_published: 1
            })
            .then(() => {
                LOGGER.module().info('INFO: [/libs/display-record lib (update_display_record)] Records updated');
                return 'records_updated';
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/libs/display-record lib (update_display_record)] unable to update display record ' + error);
                return new Error('Unable to update display record: ' + error.message);
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
     * Publishes record
     */
    this.publish_record = () => {

        let promise = new Promise((resolve, reject) => {

            let match_phrase = {
                'pid': this.uuid
            };

            HELPER.publish_record(match_phrase, (result) => {

                if (result.error === true) {
                    LOGGER.module().error('ERROR: [/repository/tasks (publish_collection)] unable to publish collection record.');
                    reject(new Error('Unable to publish record'));
                }

                resolve(result);
            });
        });

        return promise.then((result) => {
            return result;
        });
    }

    /**
     * indexes collection child records
     */
    this.reindex_child_records = () => {

        this.DB(this.TABLE)
            .select('uuid')
            .where({
                is_member_of_collection: this.uuid,
                is_active: 1
            })
            .then((data) => {

                let timer = setInterval(() => {

                    if (data.length === 0) {
                        clearInterval(timer);
                        return false;
                    } else {

                        let record = data.pop();

                        if (record.uuid === null) {
                            return false;
                        }

                        HELPER.index(record.uuid, (result) => {

                            if (result.error === true) {
                                LOGGER.module().error('ERROR: [/repository/tasks (reindex_child_records/reindex_display_record)] unable to reindex display record');
                            }
                        });
                    }

                }, 150);

                return null;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/model module (publish_objects/index_objects)] unable to index published object ' + error);
            });
    }

    /**
     * Moves copy of record or records from admin to public index
     */
    this.publish_child_records = () => {

        let match_phrase = {
            'is_member_of_collection': this.uuid
        };

        HELPER.publish_record(match_phrase, (result) => {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + response.error);
            }

        });
    };

    /**
     * Gets collection uuid
     * @returns string
     */
    this.get_collection_uuid = () => {

        return this.DB(this.TABLE)
            .select('is_member_of_collection')
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .then((data) => {
                return data[0].is_member_of_collection;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error);
                throw 'FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error;
            });
    }

    /**
     *  Checks collection publish status
     *  @param collection_uuid
     *  @return boolean
     */
    this.check_collection_publish_status = (collection_uuid) => {

        return this.DB(this.TABLE)
            .select('is_published')
            .where({
                uuid: collection_uuid,
                is_active: 1
            })
            .then((data) => {

                let is_published = false;

                if (data[0].is_published === 1) {
                    is_published = true;
                }

                return is_published;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/repository/tasks (check_collection_publish_status)] Unable to check collection status ' + error.message);
                throw 'FATAL: [/repository/tasks (check_collection_publish_status)] Unable to check collection status ' + error.message;
            });
    }

    /**
     * Checks if the child record's collection is published
     * @param is_collection_published
     * @returns boolean
     */
    this.update_child_record = (is_collection_published) => {

        if (is_collection_published === false) {
            return false;
        }

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                return true;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
            });
    }
};
