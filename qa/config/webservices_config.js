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

const WEBSERVICES_CONFIG = {
    ldap_service: process.env.LDAP_SERVICE,
    ssoHost: process.env.SSO_HOST,
    ssoUrl: process.env.SSO_URL,
    ssoResponseUrl: process.env.SSO_RESPONSE_URL,
    ssoLogoutUrl: process.env.SSO_LOGOUT_URL,
    tn_service: process.env.TN_SERVICE,
    tn_service_api_key: process.env.TN_SERVICE_API_KEY,
    convert_service: process.env.CONVERT_SERVICE,
    convert_service_endpoint: process.env.CONVERT_SERVICE_ENDPOINT,
    convert_service_api_key: process.env.CONVERT_SERVICE_API_KEY,
    transcript_service: process.env.TRANSCRIPT_SERVICE,
    transcript_service_api_key: process.env.TRANSCRIPT_SERVICE_API_KEY,
    qa_service: process.env.QA_SERVICE,
    qa_service_api_key: process.env.QA_SERVICE_API_KEY
};

module.exports = function () {
    return WEBSERVICES_CONFIG;
};
