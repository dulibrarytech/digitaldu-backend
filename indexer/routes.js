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

const INDEXER = require('../indexer/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/indexer')
        .post(TOKEN.verify, INDEXER.index_record);

    app.route('/api/admin/v1/indexer/all')
        .post(TOKEN.verify, INDEXER.index_records);

    app.route('/api/admin/v1/indexer/index/create')
        .post(TOKEN.verify, INDEXER.create_repo_index);

    app.route('/api/admin/v1/indexer/index/delete')
        .post(TOKEN.verify, INDEXER.delete_repo_index);

    app.route('/api/admin/v1/indexer/update_fragment')
        .put(TOKEN.verify, INDEXER.update_fragment);

    app.route('/api/admin/v1/indexer/reindex')
        .post(TOKEN.verify, INDEXER.reindex);

    app.route('/api/admin/v1/indexer/')
        .delete(TOKEN.verify, INDEXER.unindex_record);

    app.route('/api/admin/v1/indexer/delete')
        .delete(TOKEN.verify, INDEXER.unindex_admin_record);
};