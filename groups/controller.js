'use strict';

var Groups = require('../groups/model');

exports.get_groups = function (req, res) {
    Groups.get_groups(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_group_users = function (req, res) {
    Groups.get_group_users(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.add_user_to_group = function (req, res) {
    Groups.add_user_to_group(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.remove_user_from_group = function (req, res) {
    Groups.remove_user_from_group(req, function (data) {
        res.status(data.status).send(data.data);
    });
};