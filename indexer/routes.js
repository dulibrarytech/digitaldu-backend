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
const CONTROLLER = require('../indexer/controller');
const TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route(`${CONFIG.app_path}/api/v2/indexer/reindex`)
    .post(TOKEN.verify, CONTROLLER.reindex);

    app.route(`${CONFIG.app_path}/api/v2/indexer/reindex/:collection_uuid/collection`)
    .post(TOKEN.verify, CONTROLLER.index_collection);

    app.route(`${CONFIG.app_path}/api/v2/indexer/reindex/:uuid/object`)
    .post(TOKEN.verify, CONTROLLER.index_object);

};