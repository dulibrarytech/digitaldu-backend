'use strict';

var Users = require('../users/controller');

module.exports = function (app) {

    app.route('/api/v1/users')
        .get(Users.get_users);
};