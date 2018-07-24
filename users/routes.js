'use strict';

var Users = require('../users/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/users')
        .get(Users.get_users)
        .put(Users.update_user)
        .post(Users.save_user);
};