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

const CONTROLLER = require('../users/controller'),
    ENDPOINTS = require('../users/endpoints'),
    TOKEN = require('../libs/tokens'),
    FIELDS = require('../users/validate');

module.exports = function (app) {

    app.route(ENDPOINTS().users.endpoint)
        .get(TOKEN.verify, CONTROLLER.get_users)
        .put(TOKEN.verify, CONTROLLER.update_user)
        .post(TOKEN.verify, FIELDS.validate_user, CONTROLLER.save_user)
        .delete(TOKEN.verify, CONTROLLER.delete_user);
};