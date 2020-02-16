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

let Indexer = require('../indexer/controller'),
    apikey = require('../libs/api-key');

module.exports = function (app) {

    app.route('/api/admin/v1/indexer')
        .post(apikey.verify, Indexer.index_record);

    app.route('/api/admin/v1/indexer/all')
        .post(apikey.verify, Indexer.index_records);

    app.route('/api/admin/v1/indexer/index/create')
        .post(apikey.verify, Indexer.create_repo_index);

    app.route('/api/admin/v1/indexer/index/delete')
        .post(apikey.verify, Indexer.delete_repo_index);

    app.route('/api/admin/v1/indexer/update_fragment')
        .put(apikey.verify, Indexer.update_fragment);

    app.route('/api/admin/v1/indexer/reindex')
        .post(apikey.verify, Indexer.reindex);

    app.route('/api/admin/v1/indexer/')
        .delete(apikey.verify, Indexer.unindex_record);
};