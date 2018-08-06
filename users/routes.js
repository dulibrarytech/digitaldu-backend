'use strict';

var Users = require('../users/controller'),
    token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/api/admin/v1/users')
        .get(token.verify, Users.get_users)
        .put(token.verify, Users.update_user)
        .post(token.verify, Users.save_user);

    /* gets the groups a user belongs to */
    app.route('/api/admin/v1/users/groups')
        .get(token.verify, Users.get_user_groups);
};