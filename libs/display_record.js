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

const LOGGER = require('../libs/log4');

/**
 * Object contains display record methods
 * @param DB
 * @param TABLE
 * @type {Display_record_tasks}
 */
const Display_record_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Gets display record to render in UI
     * @param uuid
     */
    get_db_display_record_data = (uuid) => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .select('display_record')
                .where({
                    uuid: uuid,
                    is_active: 1
                })
                .then((data) => {

                    let record_data = data.pop();
                    let display_record = JSON.parse(record_data.display_record);

                    display_record.title = unescape(display_record.title);
                    display_record.display_record.title = unescape(display_record.display_record.title);

                    if (display_record.transcript !== undefined && display_record.transcript !== null && display_record.transcript.length !== 0) {
                        display_record.transcript = VALIDATOR.unescape(display_record.transcript);
                    }

                    data.push({display_record: JSON.stringify(display_record)});
                    resolve(data);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_db_display_record_data)] Unable to get display record ' + error);
                });
        });

        return promise.then((db_display_record_data) => {
            return db_display_record_data;
        });
    };

    /**
     * Gets display record for indexing
     * @param uuid
     */
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
                        collection_record.uri = data[0].uri;
                        collection_record.is_member_of_collection = data[0].is_member_of_collection;
                        collection_record.handle = data[0].handle;
                        collection_record.object_type = data[0].object_type;
                        collection_record.title = unescape(record.display_record.title);
                        collection_record.thumbnail = data[0].thumbnail;
                        collection_record.is_published = data[0].is_published;
                        collection_record.date = data[0].created;

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

                    resolve(record);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_display_record_data)] unable to get display record data for indexing ' + error);
                });
        });

        return promise.then((index_display_record_data) => {
            return index_display_record_data;
        });
    };

    /**
     * Gets display record data (preps data before creating display record)
     * @param uuid
     */
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
                    record.is_member_of_collection = data[0].is_member_of_collection;
                    record.object_type = data[0].object_type;
                    record.handle = data[0].handle;
                    record.thumbnail = data[0].thumbnail;
                    record.object = data[0].file_name;
                    record.mime_type = data[0].mime_type;
                    record.transcript = data[0].transcript;
                    record.transcript_search = data[0].transcript_search;
                    record.is_published = data[0].is_published;
                    record.metadata = data[0].metadata;
                    resolve(record);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/libs/display-record lib (get_display_record_data)] unable to get display record data ' + error.message);
                });
        });

        return promise.then((display_record_data) => {
            return display_record_data;
        });
    };

    /**
     * Creates index/metadata display record
     * @param obj
     */
    create_display_record = (obj) => {

        let data = obj.metadata,
            record = {},
            metadata;

        record.uuid = obj.uuid;
        record.pid = obj.uuid;
        record.is_member_of_collection = obj.is_member_of_collection;
        record.handle = obj.handle;
        record.thumbnail = obj.thumbnail;
        record.mime_type = obj.mime_type;
        record.object_type = obj.object_type;
        record.is_published = obj.is_published;

        try {
            metadata = JSON.parse(data);
        } catch (error) {
            LOGGER.module().fatal('FATAL: [/libs/display-record lib (create_display_record)] Unable to create display record ' + error.message);
        }

        if (obj.file_name !== undefined) {
            record.object = obj.file_name;  // from import process
        } else {
            record.object = obj.object;
        }

        if (obj.transcript !== undefined && obj.transcript !== null) {

            let transcript_arr = JSON.parse(obj.transcript);

            for (let i=0;i<metadata.parts.length;i++) {
                for (let j=0;j<transcript_arr.length;j++) {
                    if (transcript_arr[j].call_number === metadata.parts[i].title.replace('.tif', '')) {
                        metadata.parts[i].transcript = transcript_arr[j].transcript_text;
                    }
                }
            }
        }

        if (obj.transcript_search !== undefined && obj.transcript_search !== null) {
            record.transcript_search = obj.transcript_search;
        }

        if (metadata.is_compound !== undefined && metadata.is_compound === true) {
            record.is_compound = 1;
        } else {
            record.is_compound = 0;
        }

        record.uri = metadata.uri;

        if (metadata.parts !== undefined && metadata.parts.length > 0) {

            for (let i=0;i<metadata.parts.length;i++) {

                if (metadata.parts[i].kaltura_id !== undefined) {
                    record.entry_id = metadata.parts[i].kaltura_id;
                }
            }
        }

        record.parts = metadata.parts;

        if (metadata.title !== undefined || metadata.title !== null) {
            record.title = escape(metadata.title);
        }

        if (metadata.names !== undefined) {

            let names = metadata.names;

            for (let i=0;i<names.length;i++) {
                if (names[i].role !== undefined && names[i].role === 'creator') {
                    record.creator = names[i].title;
                }
            }
        }

        if (metadata.subjects !== undefined) {
            let subjectsArr = [];
            for (let i=0;i<metadata.subjects.length;i++) {
                subjectsArr.push(metadata.subjects[i].title);
            }

            record.f_subjects = subjectsArr;
        }

        if (metadata.notes !== undefined && metadata.notes.length > 0) {

            let notes = metadata.notes;

            for (let i=0;i<notes.length;i++) {
                if (notes[i].type !== undefined && notes[i].type === 'abstract') {
                    record.abstract = notes[i].content;
                }
            }
        }

        if (metadata.resource_type !== undefined) {
            record.type = metadata.resource_type;
        }

        record.display_record = JSON.parse(obj.metadata);
        record.display_record.title = escape(record.display_record.title);
        return JSON.stringify(record);
    };

    /**
     * Updates the display record
     * @param obj
     * @param display_record
     */
    update_display_record = (obj, display_record) => {

        if (display_record === null) {
            return false;
        }

        return this.DB(this.TABLE)
            .where(obj)
            .update({
                display_record: display_record
            })
            .then((data) => {

                if (data === 1) {
                    LOGGER.module().info('INFO: [/libs/display-record lib (update_display_record)] display record updated');
                    return true;
                }

                return false;
            })
            .catch((error) => {
                LOGGER.module().fatal('FATAL: [/libs/display-record lib (update_display_record)] unable to update display record ' + error);
            });
    };

};

module.exports = Display_record_tasks;
