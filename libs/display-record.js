/**

 Copyright 2019 University of Denver

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

const DB = require('../config/db')(),
    VALIDATOR = require('validator'),
    REPO_OBJECTS = 'tbl_objects',
    LOGGER = require("../libs/log4");

/**
 * Gets display record to render in UI
 * @param pid
 * @param callback
 */
exports.get_db_display_record_data = function (pid, callback) {

    if (pid === undefined || typeof pid !== 'string') {
        callback({
            error: true,
            message: 'Missing pid | Unable to get display record'
        });
        return false;
    }

    DB(REPO_OBJECTS)
        .select('display_record')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function (data) {

            let record_data = data.pop();
            let display_record = JSON.parse(record_data.display_record);

            display_record.title = unescape(display_record.title);
            display_record.display_record.title = unescape(display_record.display_record.title);

            if (display_record.transcript !== undefined && display_record.transcript !== null && display_record.transcript.length !== 0) {
                display_record.transcript = VALIDATOR.unescape(display_record.transcript);
            }

            data.push({display_record: JSON.stringify(display_record)});
            callback(data);
        })
        .catch(function (error) {
            LOGGER.module().error('ERROR: [/libs/display-record lib (get_db_display_record_data)] Unable to get display record ' + error);
        });
};

/**
 * Gets display record for indexing
 * @param sip_uuid
 * @param callback
 */
exports.get_index_display_record_data = function (sip_uuid, callback) {

    DB(REPO_OBJECTS)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            is_active: 1
        })
        .then(function (data) {

            let record = JSON.parse(data[0].display_record);

            if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                let collection_record = {};
                collection_record.pid = data[0].pid;
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

                    for (let i=0;i<record.display_record.notes.length;i++) {

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

                        let language = {
                            language: record.display_record.language
                        };

                        record.display_record.t_language = language;
                        delete record.display_record.language;

                    } else {
                        record.display_record.t_language = record.display_record.language;
                        delete record.display_record.language;
                    }
                }
            }

            callback(record);
        })
        .catch(function (error) {
            LOGGER.module().error('ERROR: [/libs/display-record lib (get_display_record_data)] unable to get display record data for indexing ' + error);
        });
};

/**
 * Gets display record data (preps data before creating display record)
 * @param sip_uuid
 * @param callback
 */
exports.get_display_record_data = function (sip_uuid, callback) {

    DB(REPO_OBJECTS)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            is_active: 1
        })
        .then(function (data) {

            let recordObj = {};
            recordObj.pid = data[0].pid;
            recordObj.is_member_of_collection = data[0].is_member_of_collection;
            recordObj.object_type = data[0].object_type;
            recordObj.sip_uuid = data[0].sip_uuid;
            recordObj.handle = data[0].handle;
            recordObj.thumbnail = data[0].thumbnail;
            recordObj.object = data[0].file_name;
            recordObj.mime_type = data[0].mime_type;
            recordObj.transcript = data[0].transcript;
            recordObj.is_published = data[0].is_published;
            recordObj.mods = data[0].mods;
            callback(recordObj);
        })
        .catch(function(error) {
            LOGGER.module().error('ERROR: [/libs/display-record lib (get_display_record_data)] unable to get display record data ' + error);
            callback(error);
        });
};

/**
 * Creates index/metadata display record
 * @param obj
 * @param callback
 */
exports.create_display_record = function (obj, callback) {

    'use strict';

    let mods = obj.mods,
        record = {},
        metadata;

    record.pid = obj.pid;
    record.is_member_of_collection = obj.is_member_of_collection;
    record.handle = obj.handle;
    record.thumbnail = obj.thumbnail;
    record.mime_type = obj.mime_type;
    record.object_type = obj.object_type;
    record.is_published = obj.is_published;

    if (obj.file_name !== undefined) {
        record.object = obj.file_name;  // import process
    } else {
        record.object = obj.object;
    }

    if (obj.transcript !== undefined) {
        record.transcript = obj.transcript;
    }

    metadata = JSON.parse(mods);

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

    if (metadata.notes !== undefined) {

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

    record.display_record = JSON.parse(obj.mods);
    record.display_record.title = escape(record.display_record.title);
    callback(JSON.stringify(record));
};

/**
 * Updates the display record
 * @param obj
 * @param display_record
 * @param callback
 */
exports.update_display_record = function (obj, display_record, callback) {

    DB(REPO_OBJECTS)
        .where(obj)
        .update({
            display_record: display_record
        })
        .then(function (data) {

            if (data === 1) {
                LOGGER.module().info('INFO: [/libs/display-record lib (update_display_record)] display record updated');
                callback({error: false});
            }

            return false;
        })
        .catch(function (error) {
            LOGGER.module().error('ERROR: [/libs/display-record lib (update_display_record)] unable to update display record ' + error);
            callback({error: true});
        });
};