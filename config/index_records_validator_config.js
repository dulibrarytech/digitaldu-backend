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

const index_record_schema = {
    is_member_of_collection: {type: 'string'},
    uuid: {type: 'string'},
    handle: {type: 'string'},
    uri: {type: 'string'},
    call_number: {type: 'string'},
    thumbnail: {type: 'string'},
    master: {type: 'string'},
    mime_type: {type: 'string'},
    object_type: {type: 'string'},
    title: {type: 'string'},
    creator: {type: 'string'},
    f_subjects: {type: 'array'},
    abstract: {type: 'string'},
    type: {type: 'string'},
    is_published: {type: 'number'},
    is_compound: {type: 'number'},
    display_record: {type: 'object'},
    transcript: {type: 'string'},
    transcript_search: {type: 'string'}
    // created: {type: 'object'}
};

const index_display_record_validator_schema = { // TODO: use in import
    title: {type: 'string'},
    uri: {type: 'string'},
    identifiers: {type: 'array'},
    dates: {type: 'array'},
    extents: {type: 'array'},
    subjects: {type: 'array'},
    notes: {type: 'array'},
    names: {type: 'array'},
    parts: {type: 'array'},
    is_compound: {type: 'boolean'},
};

module.exports = function () {

    return {
        index_record: index_record_schema,
        display_record: index_display_record_validator_schema
    };
};