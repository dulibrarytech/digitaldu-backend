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

const HELPER = require('../libs/helper');
const ARCHIVEMATICA_CONFIG = {
    archivematica_api: process.env.ARCHIVEMATICA_API,
    archivematica_username: process.env.ARCHIVEMATICA_USERNAME,
    archivematica_api_key: process.env.ARCHIVEMATICA_API_KEY,
    archivematica_transfer_source: process.env.ARCHIVEMATICA_TRANSFER_SOURCE,
    archivematica_transfer_timeout: process.env.ARCHIVEMATICA_TRANSFER_TIMEOUT,
    archivematica_storage_api: process.env.ARCHIVEMATICA_STORAGE_API,
    archivematica_storage_username: process.env.ARCHIVEMATICA_STORAGE_USERNAME,
    archivematica_storage_api_key: process.env.ARCHIVEMATICA_STORAGE_API_KEY,
    archivematica_storage_dip_uuid: process.env.ARCHIVEMATICA_DIP_UUID,
    archivematica_storage_aip_uuid: process.env.ARCHIVEMATICA_AIP_UUID,
    archivematica_user_id: process.env.ARCHIVEMATICA_USERID,
    archivematica_user_email: process.env.ARCHIVEMATICA_USER_EMAIL,
    archivematica_pipeline: process.env.ARCHIVEMATICA_PIPELINE
};

module.exports = function () {
    const HELPER_TASK = new HELPER();
    return HELPER_TASK.check_config(ARCHIVEMATICA_CONFIG);
};
