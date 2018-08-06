'use strict';

var Groups = require('../groups/controller'),
    token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/groups')
        .get(token.verify, Groups.get_groups);

    /* gets users assigned to each group */
    app.route('/api/admin/v1/groups/users')
        .get(token.verify, Groups.get_group_users)
        .post(token.verify, Groups.add_user_to_group)
        .delete(token.verify, Groups.remove_user_from_group);

};