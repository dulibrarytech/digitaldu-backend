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

var Indexer = require('../indexer/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/indexer')
        .post(Indexer.index_record);

    app.route('/api/admin/v1/indexer/all')
        .post(Indexer.index_records);

    app.route('/api/admin/v1/indexer/index/create')
        .post(Indexer.create_repo_index);

    // TODO: figure out better function name (creates new display records)
    app.route('/api/admin/v1/indexer/reset')
        .post(Indexer.reset_display_record);
};