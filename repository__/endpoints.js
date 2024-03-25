/**

 Copyright 2024 University of Denver

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
const ENDPOINT = '/repo/';
const ENDPOINTS = {
    repository: {
        repo_ping: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}ping`,
            description: '',
            get: {
                description: 'Initiates ping(s) to all third-party service. ArchivesSpace, Archivematica, Convert service, Transcript service and Handle service',
                params: 'token or api_key'
            }
        },
        repo_records: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}records`,
            description: '',
            get: {
                description: 'Retrieves repository display records',
                params: 'token or api_key, gets all display records by collection uuid param'
            },
            post: {
                description: 'Creates collection record',
                params: 'token or api_key',
                body: 'uri, is_member_of_collection (parent collection)'
            },
            delete: {
                description: 'Deletes repository record',
                params: 'token or api_key, uuid, delete_reason'
            }
        },
        repo_record: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}record`,
            description: '',
            get: {
                description: 'Retrieves repository display record',
                params: 'token or api_key, gets single display record with uuid'
            }
        },
        repo_publish: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}publish`,
            description: '',
            post: {
                description: 'Publishes repository record to discovery layer index',
                params: 'token or api_key',
                body: 'uuid, type'
            }
        },
        repo_suppress: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}suppress`,
            description: 'Provides accessed to suppressed records',
            get: {
                description: 'Retrieves suppressed records',
                params: 'token or api_key, uuid'
            },
            post: {
                description: 'Suppresses repository record',
                params: 'token or api_key',
                body: 'uuid, type'
            }
        },
        repo_rebuild_display_record: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}rebuild/display_record`,
            description: 'Rebuilds repository display record',
            post: {
                description: 'Rebuilds display record',
                params: 'token or api_key',
                body: 'uuid'
            }
        },
        repo_thumbnail_custom: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}/thumbnail/custom`,
            description: '',
            put: {
                description: 'Updates collection record thumbnail',
                params: 'token or api_key',
                body: 'uuid, thumbnail_url'
            }
        },
        repo_thumbnail_duracloud: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}/duracloud/thumbnail`,
            description: '',
            get: {
                description: 'Retrieves thumbnail image from DuraCloud storage service',
                params: 'token or api_key, tn'
            }
        },
        repo_thumbnail_service: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}/thumbnail/service`,
            description: 'Retrieves thumbnail image from local Discovery layer image server',
            get: {
                description: 'Retrieves thumbnail image from local Discovery layer image server',
                params: 'token or api_key, uuid'
            }
        },
        repo_image_service: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}/image/service`,
            description: 'Retrieves image from local convert service (converts tif to jpg during ingest process)',
            get: {
                description: 'Retrieves image from local convert service (converts tif to jpg during ingest process)',
                params: 'token or api_key, uuid, full_path, object_name, mime_type'
            }
        },
        repo_viewer: {
            endpoint: `${PREFIX}${VERSION}${ENDPOINT}viewer`,
            description: 'Redirect request to Discovery Layer object viewer',
            get: {
                description: 'Redirect request to Discovery Layer object viewer',
                params: 'token or api_key, uuid'
            }
        }
    }
};

module.exports = () => {
    return ENDPOINTS;
};
