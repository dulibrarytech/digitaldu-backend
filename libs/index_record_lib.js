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

const VALIDATE = require('../libs/validate_lib');
const LOGGER = require('../libs/log4');

/**
 * Object contains index record methods
 * @param DB
 * @param TABLE
 * @type {Index_record_lib}
 */
const Index_record_lib = class {

    constructor(DB, TABLE, VALIDATOR_CONFIG) {
        this.DB = DB;
        this.TABLE = TABLE;
        this.VALIDATOR_CONFIG = VALIDATOR_CONFIG;
    }

    /**
     * Gets DB record used to create index record
     * @param uuid
     * @return object
     */
    get_index_record_data = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('*')
                .where({
                    uuid: uuid,
                    is_active: 1
                })
                .then((data) => {

                    let record_data = data.pop();
                    let index_record = JSON.parse(record_data.index_record);

                    // escape transcript strings
                    if (index_record.transcript !== undefined && index_record.transcript !== null && index_record.transcript.length !== 0) {
                        index_record.transcript = decodeURI(index_record.transcript);
                    }

                    record_data.index_record = JSON.stringify(index_record);
                    resolve(record_data);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_index_record_data)] Unable to get index record data ' + error);
                    reject(false);
                });
        });

        return promise.then((data) => {
            return data;
        });
    };

    /**
     * Constructs index record from DB data
     * @param data (data object from get_index_record_data)
     * @return object <index record> / returns false if an error occurs
     */
    create_index_record = (data) => {

        let metadata;
        let index_record = {};
        let config;

        if (data.object_type === 'collection') {
            config = this.VALIDATOR_CONFIG.parent_index_record;
        } else if (data.object_type === 'object') {
            config = this.VALIDATOR_CONFIG.child_index_record;
        } else {
            LOGGER.module().fatal('FATAL: [/libs/index_record_lib (create_index_record)] Unable to get index record schema validation');
            return false;
        }

        try {
            metadata = JSON.parse(data.metadata);
        } catch (error) {
            LOGGER.module().fatal('FATAL: [/libs/index_record_lib (create_index_record)] Unable to create index record ' + error.message);
            return false;
        }

        index_record.uuid = data.uuid;
        index_record.object_type = data.object_type;

        if (metadata.title !== undefined && typeof metadata.title === 'string') {
            index_record.title = metadata.title;
        }

        index_record.is_member_of_collection = data.is_member_of_collection;
        index_record.handle = data.handle;
        index_record.uri = data.uri;

        if (data.call_number !== null) {
            index_record.call_number = data.call_number;
        }

        if (data.thumbnail !== null) {
            index_record.thumbnail = data.thumbnail;
        } else {
            index_record.thumbnail = '';
        }

        if (data.object_type === 'object') {

            if (data.master !== null) {
                index_record.master = data.master;
            }

            if (data.mime_type !== null) {
                index_record.mime_type = data.mime_type;
            }

            if (metadata.resource_type !== undefined && metadata.resource_type.length > 0) {
                index_record.resource_type = metadata.resource_type;
            }

            if (data.transcript !== null && data.transcript.length > 0) {

                let transcript_arr = JSON.parse(data.transcript);

                for (let i = 0; i < metadata.parts.length; i++) {
                    for (let j = 0; j < transcript_arr.length; j++) {
                        if (transcript_arr[j].call_number === metadata.parts[i].title.replace('.tif', '')) {
                            metadata.parts[i].transcript = transcript_arr[j].transcript_text;
                        }
                    }
                }
            }

            if (data.transcript_search !== null && data.transcript_search.length > 0) {
                index_record.transcript_search = data.transcript_search;
            }

            if (metadata.parts !== undefined && metadata.parts.length > 0) {

                if (data.is_compound === 1 && data.compound_parts !== null) {
                    metadata.parts = JSON.parse(data.compound_parts);
                }

                for (let i = 0; i < metadata.parts.length; i++) {

                    if (metadata.parts[i].kaltura_id !== undefined && typeof metadata.parts[i].kaltura_id === 'string') {
                        index_record.kaltura_id = metadata.parts[i].kaltura_id;
                    }
                }
            }
        }

        if (metadata.names !== undefined) {

            let names = metadata.names;

            for (let i = 0; i < names.length; i++) {
                if (names[i].role !== undefined && names[i].role === 'creator') {
                    index_record.creator = names[i].title;
                }
            }
        }

        if (metadata.subjects !== undefined) {
            let subjectsArr = [];
            for (let i = 0; i < metadata.subjects.length; i++) {
                if (metadata.subjects[i].title !== null) {
                    subjectsArr.push(metadata.subjects[i].title);
                }
            }

            if (subjectsArr.length > 0) {
                index_record.facets = subjectsArr;
            }
        }

        if (metadata.notes !== undefined && metadata.notes.length > 0) {

            let notes = metadata.notes;

            for (let i = 0; i < notes.length; i++) {
                if (notes[i].type !== undefined && notes[i].type === 'abstract') {
                    index_record.abstract = notes[i].content;
                }
            }
        }

        index_record.is_published = parseInt(data.is_published);

        if (metadata.is_compound !== undefined && metadata.is_compound === true) {
            index_record.is_compound = 1;
        } else {
            index_record.is_compound = 0;
        }

        index_record.display_record = metadata;
        index_record.created = data.created;

        const VALIDATOR = new VALIDATE(config);
        let is_valid = VALIDATOR.validate(index_record);

        if (is_valid !== true) {
            this.flag_record(index_record.uuid, is_valid);
        }

        return index_record;
    };

    /**
     * Updates the display record
     * @param uuid
     * @param index_record (constructed by create_index_record)
     * @return boolean
     */
    update_index_record = (uuid, index_record) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid,
                    is_active: 1
                })
                .update({
                    index_record: JSON.stringify(index_record)
                })
                .then((data) => {

                    if (data === 1) {
                        LOGGER.module().info('INFO: [/libs/index_record_lib (update_index_record)] index record updated');
                        resolve(true);
                    }

                    reject(false);
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/libs/index_record_lib (update_index_record)] unable to update index record ' + error);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch(() => {
            return false;
        });
    };

    /**
     * Flags invalid index record
     * @param uuid
     * @param errors
     */
    flag_record = (uuid, errors) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where({
                    uuid: uuid
                })
                .update({
                    is_valid: 0,
                    validation_errors: JSON.stringify(errors)
                })
                .then((data) => {

                    if (data === 1) {
                        LOGGER.module().info('INFO: [/libs/display-record lib (flag_record)] Record flagged');
                        resolve(true);
                    }
                })
                .catch((error) => {
                    LOGGER.module().error('ERROR: [/libs/display-record lib (flag_record)] unable to flag record ' + error.message);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    };
};

module.exports = Index_record_lib;
