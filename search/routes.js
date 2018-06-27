'use strict';

var Stats = require('../stats/controller');

module.exports = function (app) {

    app.route('/api/v1/stats/collection/count')
        .get(Stats.get_collection_count);

    app.route('/api/v1/stats/object/count')
        .get(Stats.get_object_count);

};