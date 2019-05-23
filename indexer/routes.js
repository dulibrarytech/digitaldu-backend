'use strict';

var Indexer = require('../indexer/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/indexer')
        .post(Indexer.index_record);

    app.route('/api/admin/v1/indexer/index/create')
        .post(Indexer.create_repo_index);

    /*
    app.route('/api/admin/v1/indexer/mapping/create')
        .post(Indexer.create_repo_index);
    */
};