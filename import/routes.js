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

const CONTROLLER = require('../import/controller');
const TOKEN = require('../libs/tokens');

module.exports = function (app) {

    // updates single object metadata record
    app.route('/api/admin/v1/import/metadata/single')
        .put(TOKEN.verify, CONTROLLER.update_single_metadata_record);

    app.route('/api/admin/v1/import/metadata/object')
        .put(TOKEN.verify, CONTROLLER.update_object_metadata_record);

    // batch updates all metadata records (collections and objects)
    app.route('/api/admin/v1/import/metadata/batch')
        .post(TOKEN.verify, CONTROLLER.batch_update_metadata);
};