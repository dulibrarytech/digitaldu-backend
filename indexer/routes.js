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
    ENDPOINTS = require('../indexer/endpoints'),
    TOKEN = require('../libs/tokens');
// TODO: figure out most efficient routes
module.exports = function (app) {

    app.route(ENDPOINTS().indexer.indexer_index_records.endpoint)  // '/api/admin/v1/indexer'
        .put(TOKEN.verify, INDEXER.index_records)
        .post(TOKEN.verify, INDEXER.index_record)
        .delete(TOKEN.verify, INDEXER.unindex_record);  // Removes record from public index

    app.route(ENDPOINTS().indexer.indexer_manage_index)  // '/api/admin/v1/indexer/index/create'
        .post(TOKEN.verify, INDEXER.create_repo_index)
        .delete(TOKEN.verify, INDEXER.delete_repo_index);


    // TODO: combine the deletes - designate uising params
    /*
    app.route('/api/admin/v1/indexer/delete')
        .delete(TOKEN.verify, INDEXER.unindex_admin_record); // removes record from admin index
    */

    app.route('/api/admin/v1/indexer/reindex') // TODO: rename!! publishes records from admin to public
        .post(TOKEN.verify, INDEXER.reindex); // TODO: check if this can be deprecated

    app.route('/api/admin/v1/indexer/republish')
        .post(TOKEN.verify, INDEXER.republish_record);



    /*
    app.route('/api/admin/v1/indexer/update_fragment')
        .put(TOKEN.verify, INDEXER.update_fragment);

     */

    /* TODO
    app.route(ENDPOINTS().indexer.indexer_full_reindex)  // '/api/admin/v1/indexer/all'
        .post(TOKEN.verify, INDEXER.index_records);
    */

    /*
    app.route()  // '/api/admin/v1/indexer/index/delete'
        .post(TOKEN.verify, INDEXER.delete_repo_index);
    */

};