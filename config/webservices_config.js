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

const HELPER = require("../libs/helper");
const WEBSERVICES_CONFIG = {
    sso_host: process.env.SSO_HOST,
    sso_url: process.env.SSO_URL,
    sso_response_url: process.env.SSO_RESPONSE_URL,
    sso_logout_url: process.env.SSO_LOGOUT_URL,
    tn_service: process.env.TN_SERVICE,
    tn_service_api_key: process.env.TN_SERVICE_API_KEY,
    ingest_service: process.env.INGEST_SERVICE_HOST
};

module.exports = function () {
    const HELPER_TASK = new HELPER();
    return HELPER_TASK.check_config(WEBSERVICES_CONFIG);
};
