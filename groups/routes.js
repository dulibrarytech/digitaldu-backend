'use strict';

var Groups = require('../groups/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/groups')
        .get(Groups.get_groups);
};