'use strict';

var Users = require('../users/model');

exports.get_users = function (req, res) {
    Users.get_users(req, function (data) {
        res.status(data.status).send(data.data);
    });
};