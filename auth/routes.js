'use strict';

var Auth = require('../auth/controller');

module.exports = function (app) {

    app.route('/login')
        .get(Auth.login)
        .post(Auth.login);
};