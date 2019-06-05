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