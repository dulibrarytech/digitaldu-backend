'use strict';

var Users = require('../users/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/users')
        .get(Users.get_users)
        .put(Users.update_user)
        .post(Users.save_user);

    /* gets the groups a user belongs to */
    app.route('/api/admin/v1/users/groups')
        .get(Users.get_user_groups);
};