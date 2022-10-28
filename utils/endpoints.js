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

const PREFIX = '/api/';
const VERSION = 'v2';
const ENDPOINT = '/utils/';
const ENDPOINTS = {
    utils: { // TODO: add documentation
        utils_reindex: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}reindex`,
            description: 'Initiates reindex process. Deletes existing index, creates new index and reindexes all records',
            post: {
                description: 'Initiates reindex process',
                params: 'token or api_key',
                body: 'index=frontend/backend'
            }
        },
        utils_clear_cache: `${PREFIX}${VERSION}${ENDPOINT}clear_cache`,
        utils_batch_convert: `${PREFIX}${VERSION}${ENDPOINT}batch_convert`,
        utils_save_call_number: `${PREFIX}${VERSION}${ENDPOINT}save_call_number`,
        utils_batch_fix: `${PREFIX}${VERSION}${ENDPOINT}batch_fix`
    }
};
/*
const ENDPOINTS = {
    indexer: {
        indexer_index_records: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}index`,
            description: 'Allows us to perform a full index, index a single record and delete a record',
            post: {
                description: 'Single repository record index',
                params: 'token or api_key',
                body: 'uuid, is_published=true/false'
            },
            put: {
                description: 'Full repository reindex',
                params: 'token or api_key, optional param (index) === "frontend" or "backend"'
            },
            delete: {
                description: 'Deletes record from admin index',
                params: 'token or api_key, uuid'
            }
        },

 */

module.exports = () => {
    return ENDPOINTS;
};
