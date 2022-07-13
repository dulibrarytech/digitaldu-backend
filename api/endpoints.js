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
const VERSION = 'v2/';
const ENDPOINTS = {
    api: {
        api_default: {
            endpoint: `${PREFIX}${VERSION}`,
            description: '',
            get: {
                description: '',
                params: 'token or api_key'
            }
        },
        api_uuids: {
            endpoint: `${PREFIX}${VERSION}uuids`,
            description: '',
            get: {
                description: '',
                params: 'token or api_key'
            }
        },
        api_endpoints: {
            endpoint: `${PREFIX}${VERSION}endpoints`,
            description: 'Gets all repository API endpoints',
            get: {
                description: 'Gets all repository API endpoints',
                params: 'token or api_key'
            }
        },
        api_records: {
            endpoint: `${PREFIX}${VERSION}records`,
            description: '',
            get: {
                description: '',
                params: 'token or api_key'
            }
        },
        api_images: {
            endpoint: `${PREFIX}${VERSION}images`,
            description: '',
            get: {
                description: '',
                params: 'token or api_key'
            }
        }
    }
};

module.exports = () => {
    return ENDPOINTS;
};
