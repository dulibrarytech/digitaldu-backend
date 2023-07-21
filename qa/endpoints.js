/**

 Copyright 2023 University of Denver

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
const ENDPOINT = '/qa/';
const ENDPOINTS = {
    qa_service: {
        qa_status: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}status`,
            description: 'Provides QA process status',
            get: {
                description: 'Provides QA process status',
                params: 'token, api_key'
            }
        },
        qa_list_ready_folders: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}list-ready-folders`,
            description: 'Retrieves local SFTP collection ready folders and lists them',
            get: {
                description: 'Retrieves local SFTP collection ready folders and lists them',
                params: 'api_key'
            }
        },
        qa_run_qa: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}run-qa`,
            description: 'Runs QA on designated collection folder',
            get: {
                description: 'Runs QA on designated collection folder',
                params: 'api_key'
            }
        },
        /*
        qa_check_metadata: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}check-metadata`,
            description: 'Checks each metadata record in the batch to confirm that a record exists and there is minimum record',
            get: {
                description: 'Checks each metadata record in the batch to confirm that a record exists and there is minimum record',
                params: 'api_key'
            }
        },

         */
        /*
        qa_check_collection: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}check-collection`,
            description: '',
            get: {
                description: '',
                params: 'api_key'
            }
        },

         */
        /*
        qa_move_to_ingest: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}move-to-ingest`,
            description: '',
            get: {
                description: 'Moves batch folder to ingest folder on local SFTP',
                params: 'api_key'
            }
        },

         */
        qa_move_to_ingested: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}move-to-ingested`,
            description: '',
            get: {
                description: 'Moves batch folder to ingested folder on local SFTP',
                params: 'api_key'
            }
        },
        /*
        qa_move_to_sftp: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}move-to-sftp`,
            description: '',
            get: {
                description: 'Moves ingest package to Archivematica SFTP server',
                params: 'api_key'
            }
        },
        qa_upload_status: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}upload-status`,
            description: '',
            get: {
                description: 'Moves ingest package to Archivematica SFTP server',
                params: 'api_key'
            }
        }

         */
    }
};

module.exports = () => {
    return ENDPOINTS;
};
