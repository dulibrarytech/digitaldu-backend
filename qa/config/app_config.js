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

const APP_CONFIG = {
    host: process.env.HOST,
    app_name: process.env.APP_NAME,
    app_version: process.env.APP_VERSION,
    organization: process.env.ORGANIZATION,
    app_host: process.env.APP_HOST,
    app_port: process.env.APP_PORT,
    api_url: process.env.API_URL,
    tn_upload_path: process.env.TN_UPLOAD_PATH
};

module.exports = function() {
    return APP_CONFIG;
};
