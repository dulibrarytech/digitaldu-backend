'use strict';

var Stats = require('../stats/controller');

module.exports = function (app) {

    app.route('/api/v1/stats/collection/count')
        .get(Stats.get_collection_count);

    app.route('/api/v1/stats/object/count')
        .get(Stats.get_object_count);

    app.route('/api/v1/stats/objects/new/count')
        .get(Stats.get_user_count);

    app.route('/api/v1/stats/user/count')
        .get(Stats.get_user_count);
};