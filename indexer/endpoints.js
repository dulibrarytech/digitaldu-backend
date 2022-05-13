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
const ENDPOINT = '/indexer/';
const ENDPOINTS = {
    indexer: {
        indexer_index_records: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}index_records`,
            description: 'Allows us to perform a full index, index a single record and delete a record',
            post: {
                description: 'Single record index',
                params: 'token or api_key',
                body: 'uuid'
            },
            put: {
                description: 'Full reindex',
                params: 'token or api_key'
            },
            delete: {
                description: 'Deletes record',
                params: 'token or api_key, uuid'
            }
        },
        indexer_manage_index: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}manage_index`,
            description: 'Allows us to create and delete indices',
            post: {
                description: 'Creates new repository search index',
                params: 'token or api_key',
                body: 'index_name'
            },
            delete: {
                description: 'Deletes existing repository search index',
                params: 'token or api_key, uuid, index (frontend/backend)'
            }
        },
        indexer_reindex_record: `${PREFIX}${VERSION}${ENDPOINT}reindex_record`, //-- TODO
        indexer_republish_record: `${PREFIX}${VERSION}${ENDPOINT}republish_record`, //-- TODO
        indexer_delete_record: `${PREFIX}${VERSION}${ENDPOINT}delete_record` //-- TODO
    }
};

module.exports = () => {
    return ENDPOINTS;
};
