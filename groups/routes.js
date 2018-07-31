'use strict';

var Groups = require('../groups/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/groups')
        .get(Groups.get_groups);

    /* gets users assigned to each group */
    app.route('/api/admin/v1/groups/users')
        .get(Groups.get_group_users)
        .post(Groups.add_user_to_group)
        .delete(Groups.remove_user_from_group);

};