/**

 Copyright 2019 University of Denver

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

const CONFIG = require('../config/app_config')();
const CONTROLLER = require('../auth/controller');
const TOKENS = require('../libs/tokens');

module.exports = function (app) {

    app.route(`${CONFIG.app_path}`)
    .get(CONTROLLER.get_auth_landing);

    app.route(`${CONFIG.app_path}/login`)
    .get(TOKENS.verify);

    app.route(`${CONFIG.app_path}/sso`)
    .post(CONTROLLER.sso);
    console.log(`${CONFIG.app_path}/token`);
    app.route(`${CONFIG.app_path}/token`)
    .post(CONTROLLER.refresh_token);

    app.route(`${CONFIG.app_path}/logout`)
    .get(CONTROLLER.logout);
};