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
    record.object = obj.file_name;
    record.mime_type = obj.mime_type;
    record.uri = obj.uri;
    record.object_type = obj.object_type;
    record.is_published = obj.is_published;

    metadata = JSON.parse(mods);

    if (metadata.is_compound !== undefined && metadata.is_compound === true) {
        record.is_compound = 1;
    } else {
        record.is_compound = 0;
    }

    if (metadata.parts !== undefined && metadata.parts.length > 0) {

        for (let i=0;i<metadata.parts.length;i++) {

            if (metadata.parts[i].kaltura_id !== undefined) {
                record.entry_id = metadata.parts[i].kaltura_id;
            }
        }
    }

    if (metadata.title !== undefined || metadata.title !== null) {
        record.title = metadata.title;
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

    callback(JSON.stringify(record));
};