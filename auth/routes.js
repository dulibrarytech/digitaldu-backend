'use strict';

var Auth = require('../auth/controller');

module.exports = function (app) {

    app.route('/login')
        .get(Auth.login_form);

    app.route('/api/authenticate')
        .post(Auth.login);
};