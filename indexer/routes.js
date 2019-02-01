'use strict';

var Indexer = require('../indexer/controller');

module.exports = function (app) {

    /*
     domain/indexer?type=single&pid=codu:37705
     domain/indexer?type=all
     */
    // TODO: add token verification and param validation
    /*
    app.route('/indexer')
        .get(Indexer.index_data);
    */

    app.route('/api/admin/v1/indexer')
        .post(Indexer.index_record);
};