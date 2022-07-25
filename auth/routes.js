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

const CONTROLLER = require('../auth/controller'),
    ENDPOINTS = require('../auth/endpoints'),
    TOKENS = require('../libs/tokens'),
    FIELDS = require('../auth/validate');

module.exports = function (app) {

    app.route('/login')
        .get(CONTROLLER.login_form);

    app.route(ENDPOINTS().auth.authentication.endpoint)
        .post(FIELDS.validate_auth, CONTROLLER.login)
        .get(TOKENS.verify, CONTROLLER.get_auth_user_data);
};