'use strict';

var fs = require('fs'),
    config = require('../config/config'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

exports.save_group = function (req, callback) {
    // TODO: ...
};

exports.get_groups = function (req, callback) {

    knex('tbl_groups')
        .select('id', 'group_name', 'group_description', 'permissions', 'resources', 'created')
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Groups retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_group = function (req, callback) {

    var id = req.query.id; // TODO: sanitize

    knex('tbl_users')
        .select('id', 'group_name', 'group_description', 'permissions', 'created')
        .where({
            id: id
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'User retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.update_group = function (req, callback) {
    // TODO: ...
};

exports.get_group_users = function (req, callback) {

    // TODO: sanitize (group_id)
    var id = req.query.id;

    knex('tbl_users_tbl_groups')
        .join('tbl_users', 'tbl_users.id', '=', 'tbl_users_tbl_groups.user_id')
        .join('tbl_groups', 'tbl_groups.id', '=', 'tbl_users_tbl_groups.group_id')
        .select(
        'tbl_users_tbl_groups.group_id',
        'tbl_users.id',
        'tbl_users.first_name',
        'tbl_users.last_name',
        'tbl_users.email',
        'tbl_users.status',
        'tbl_groups.group_name'
    )
        .where({
            group_id: id
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Users retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

