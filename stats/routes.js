'use strict';

var Stats = require('../stats/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/stats')
        .get(Stats.get_stats);
};