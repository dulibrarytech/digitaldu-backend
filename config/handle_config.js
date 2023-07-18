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
const HANDLE_CONFIG = {
    handle_host: process.env.HANDLE_HOST,
    handle_prefix: process.env.HANDLE_PREFIX,
    handle_user: process.env.HANDLE_USERNAME,
    handle_password: process.env.HANDLE_PWD,
    handle_target: process.env.HANDLE_TARGET,
    handle_server: process.env.HANDLE_SERVER
};

module.exports = function () {
    const HELPER_TASK = new HELPER();
    return HELPER_TASK.check_config(HANDLE_CONFIG);
};
