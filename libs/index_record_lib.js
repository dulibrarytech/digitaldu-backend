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

const VALIDATOR_CONFIG = require('../config/index_records_validator_config')();
const VALIDATE = require('../libs/validate_lib');
const LOGGER = require('../libs/log4');

/**
 * Object contains index record methods
 * @param DB
 * @param TABLE
 * @type {Index_record_lib}
 */
const Index_record_lib = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
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
     * Takes DB record and constructs the index record
     * Creates index/metadata display record
     * @param data
     * @return object
     */
    create_index_record = (data) => {

        let metadata;
        let index_record = {};

        try {
            metadata = JSON.parse(data.metadata);
        } catch (error) {
            LOGGER.module().fatal('FATAL: [/libs/index_record_lib (create_index_record)] Unable to create index record ' + error.message);
        }

        index_record.uuid = data.uuid;
        index_record.object_type = data.object_type;

        if (metadata.title !== undefined && typeof metadata.title === 'string') {
            index_record.title = metadata.title;
        }

        index_record.is_member_of_collection = data.is_member_of_collection;
        index_record.handle = data.handle;
        index_record.uri = data.uri;

        if (data.call_number !== undefined && typeof data.call_number === 'string') {
            index_record.call_number = data.call_number;
        }

        if (data.thumbnail !== null) {
            index_record.thumbnail = data.thumbnail;
        } else {
            index_record.thumbnail = '';
        }

        if (data.master !== null) {
            index_record.master = data.master;
        } else {
            index_record.master = '';
        }

        index_record.mime_type = data.mime_type;

        if (metadata.resource_type !== undefined && metadata.resource_type.length > 0) {
            index_record.type = metadata.resource_type;
        } else {
            index_record.type = '';
        }

        if (data.transcript !== null && data.transcript.length > 0) {

            let transcript_arr = JSON.parse(data.transcript);

            for (let i=0;i<metadata.parts.length;i++) {
                for (let j=0;j<transcript_arr.length;j++) {
                    if (transcript_arr[j].call_number === metadata.parts[i].title.replace('.tif', '')) {
                        metadata.parts[i].transcript = transcript_arr[j].transcript_text;
                    }
                }
            }
        } else {
            index_record.transcript = '';
        }

        if (data.transcript_search !== null && data.transcript_search.length > 0) {
            index_record.transcript_search = data.transcript_search;
        } else {
            index_record.transcript_search = '';
        }

        if (metadata.parts !== undefined && metadata.parts.length > 0) {

            if (data.is_compound === 1 && data.compound_parts !== null) {
                metadata.parts = JSON.parse(data.compound_parts);
            }

            for (let i=0;i<metadata.parts.length;i++) {

                if (metadata.parts[i].kaltura_id !== undefined && typeof metadata.parts[i].kaltura_id === 'string') {
                    index_record.kaltura_id = metadata.parts[i].kaltura_id;
                } else {
                    index_record.kaltura_id = '';
                }
            }
        }

        if (metadata.names !== undefined) {

            let names = metadata.names;

            for (let i=0;i<names.length;i++) {
                if (names[i].role !== undefined && names[i].role === 'creator') {
                    index_record.creator = names[i].title;
                } else {
                    index_record.creator = '';
                }
            }
        }

        if (metadata.subjects !== undefined) {
            let subjectsArr = [];
            for (let i=0;i<metadata.subjects.length;i++) {
                if (metadata.subjects[i].title === 'string') {
                    subjectsArr.push(metadata.subjects[i].title);
                }
            }

            index_record.f_subjects = subjectsArr;
        }

        if (metadata.notes !== undefined && metadata.notes.length > 0) {

            let notes = metadata.notes;

            for (let i=0;i<notes.length;i++) {
                if (notes[i].type !== undefined && notes[i].type === 'abstract') {
                    index_record.abstract = notes[i].content;
                } else {
                    index_record.abstract = '';
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
        index_record.display_record.title = escape(index_record.display_record.title);
        index_record.created = data.created;

        const VALIDATOR = new VALIDATE(VALIDATOR_CONFIG.index_record);
        let is_valid = VALIDATOR.validate(index_record);

        if (is_valid !== true) {
            this.flag_record(index_record.uuid, is_valid);
        }

        return index_record;
    };

    /**
     * Flags invalid index record
     * @param uuid
     * @param errors
     */
    flag_record = (uuid, errors) => {

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
                }


            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/libs/display-record lib (flag_record)] unable to flag record ' + error.message);
            });
    };

    /**
     * Updates the display record
     * @param where_obj
     * @param index_record
     * @return boolean
     */
    update_index_record = (where_obj, index_record) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .where(where_obj)
                .update({
                    index_record: JSON.stringify(index_record)
                })
                .then((data) => {

                    if (data === 1) {
                        LOGGER.module().info('INFO: [/libs/display-record lib (update_display_record)] display record updated');
                        resolve(true);
                    }

                    reject(false);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (update_display_record)] unable to update display record ' + error);
                    reject(false);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets display record for indexing
     * @param uuid

    get_index_display_record_data = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('*')
                .where({
                    uuid: uuid,
                    is_active: 1
                })
                .then((data) => {

                    if (data.length === 0) {
                        resolve('no_data');
                    }

                    let record = JSON.parse(data[0].display_record);

                    if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                        let collection_record = {};
                        collection_record.uuid = data[0].uuid;
                        collection_record.pid = data[0].uuid; // legacy
                        collection_record.uri = data[0].uri;
                        collection_record.is_member_of_collection = data[0].is_member_of_collection;
                        collection_record.handle = data[0].handle;
                        collection_record.object_type = data[0].object_type;
                        collection_record.title = unescape(record.display_record.title);
                        collection_record.thumbnail = data[0].thumbnail;
                        collection_record.is_published = data[0].is_published;
                        collection_record.created = data[0].created;

                        // get collection abstract
                        if (record.display_record.notes !== undefined) {

                            for (let i = 0; i < record.display_record.notes.length; i++) {

                                if (record.display_record.notes[i].type === 'abstract') {
                                    collection_record.abstract = record.display_record.notes[i].content.toString();
                                }
                            }
                        }

                        collection_record.display_record = {
                            title: unescape(record.display_record.title),
                            abstract: collection_record.abstract
                        };

                        record = collection_record;

                    } else {
                        record.title = unescape(record.title);
                        record.display_record.title = unescape(record.display_record.title);

                        if (record.display_record.language !== undefined) {

                            if (typeof record.display_record.language !== 'object') {

                                record.display_record.t_language = {
                                    language: record.display_record.language
                                };

                                delete record.display_record.language;

                            } else {
                                record.display_record.t_language = record.display_record.language;
                                delete record.display_record.language;
                            }
                        }
                    }

                    /*
                    const VALIDATOR = new VALIDATE(VALIDATOR_CONFIG.index_record);
                    let is_valid = VALIDATOR.validate(record);

                    if (is_valid === true) {
                        resolve(record);
                    } else {
                        reject(false);
                    }

                     *

                    resolve(record);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_display_record_data)] unable to get display record data for indexing ' + error.message);
                    reject(false);
                });
        });


        return promise.then((index_display_record_data) => {
            return index_display_record_data;
        });
    };
     */

    /**
     * Gets display record data (preps data before creating display record)
     * @param uuid

    get_display_record_data = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('*')
                .where({
                    uuid: uuid,
                    is_active: 1
                })
                .then((data) => {

                    let record = {};
                    record.uuid = data[0].uuid;
                    record.pid = data[0].uuid; // legacy
                    record.is_member_of_collection = data[0].is_member_of_collection;
                    record.object_type = data[0].object_type;
                    record.handle = data[0].handle;
                    record.thumbnail = data[0].thumbnail;
                    record.master = data[0].master;
                    // record.object = data[0].master; // legacy
                    record.mime_type = data[0].mime_type;
                    record.created = data[0].created;

                    if (data[0].transcript === null) {
                        record.transcript = '';
                    } else {
                        record.transcript = data[0].transcript;
                    }

                    if (data[0].transcript_search === null) {
                        record.transcript_search = '';
                    } else {
                        record.transcript_search = data[0].transcript_search;
                    }

                    record.is_published = parseInt(data[0].is_published);
                    record.metadata = data[0].metadata;

                    /*
                    const VALIDATOR = new VALIDATE(VALIDATOR_CONFIG.index_record);
                    let is_valid = VALIDATOR.validate(record);

                    if (is_valid === true) {
                        resolve(record);
                    } else {
                        reject(false);
                    }

                     *

                    resolve(record);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_display_record_data)] unable to get display record data ' + error.message);
                    reject(false);
                });
        });

        return promise.then((display_record_data) => {
            return display_record_data;
        }).catch((error) => {
            return error;
        });
    };
*/
};

module.exports = Index_record_lib;
