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