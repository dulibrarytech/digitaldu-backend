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

    knex('tbl_users')
        .select('id', 'group_id', 'du_id', 'email', 'first_name', 'last_name', 'status', 'created')
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
