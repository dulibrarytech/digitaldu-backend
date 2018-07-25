'use strict';

var Users = require('../users/model');

exports.get_users = function (req, res) {
    Users.get_users(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_user = function (req, res) {
    Users.update_user(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.save_user = function (req, res) {
    Users.save_user(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_user_groups = function (req, res) {
    Users.get_user_groups(req, function (data) {
        res.status(data.status).send(data.data);
    });
};