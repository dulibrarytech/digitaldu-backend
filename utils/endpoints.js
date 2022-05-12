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
    utils: {
        utils_reindex: `${PREFIX}${VERSION}${ENDPOINT}reindex`,
        utils_clear_cache: `${PREFIX}${VERSION}${ENDPOINT}clear_cache`,
        utils_batch_convert: `${PREFIX}${VERSION}${ENDPOINT}batch_convert`,
        utils_save_call_number: `${PREFIX}${VERSION}${ENDPOINT}save_call_number`,
        utils_batch_fix: `${PREFIX}${VERSION}${ENDPOINT}batch_fix`
    }
};

module.exports = () => {
    return ENDPOINTS;
};
