'use strict';

var Indexer = require('../indexer/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/indexer')
        .post(Indexer.index_record);
};