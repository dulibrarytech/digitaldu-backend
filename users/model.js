'use strict';

var fs = require('fs'),
    config = require('../config/config'),
    async = require('async'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

exports.get_users = function (req, callback) {

    if (req.query.id !== undefined) {

        get_user(req, function (user) {
            callback(user);
        });

        return false;
    }

    knex('tbl_users')
        .select(
        'tbl_users.id',
        'tbl_users.du_id',
        'tbl_users.email',
        'tbl_users.first_name',
        'tbl_users.last_name',
        'tbl_users.status',
        'tbl_users.created'
    )
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

    /*
    knex('tbl_users_tbl_groups')
            .join('tbl_users', 'tbl_users.id', '=', 'tbl_users_tbl_groups.user_id')
            .groupBy('tbl_users.id')
            .select(
            'tbl_users.id',
            'tbl_users.du_id',
            'tbl_users.email',
            'tbl_users.first_name',
            'tbl_users.last_name',
            'tbl_users.status',
            'tbl_users.created',
            'tbl_users_tbl_groups.group_id'
        )
            .then(function (data) {
                console.log(data);
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

        */
    /*

    async.waterfall([
        getUsers,
        getGroups
    ], function (err, results) {
        console.log(results);
        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            data: results,
            message: 'Counts retrieved.'
        });
    });
    */

    /*
    knex('tbl_groups')
        .join('tbl_users_tbl_groups', 'tbl_groups.id', '=', 'tbl_users_tbl_groups.group_id')
        .join('tbl_users', 'tbl_users.id', '=', 'tbl_users_tbl_groups.user_id')
        .select(
            'tbl_users.id',
            'tbl_users.du_id',
            'tbl_users.email',
            'tbl_users.first_name',
            'tbl_users.last_name',
            'tbl_users.status',
            'tbl_users.created',
            'tbl_users_tbl_groups.group_id',
            'tbl_groups.group_name',
            'tbl_groups.group_description',
            'tbl_groups.permissions'
        )
        // .where('tbl_users.id', 1)
        // .groupBy('tbl_groups.group_name')
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
        */
};

var get_user = function (req, callback) {

    var id = req.query.id; // TODO: sanitize

    knex('tbl_users')
        .select('id', 'du_id', 'email', 'first_name', 'last_name', 'status', 'created')
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

// checks whether user is allowed to access repo
exports.check_auth_user = function (username, callback) {

    knex('tbl_users')
        // .count('du_id as count')
        .select('id')
        .where({
            du_id: username,
            status: 1
        })
        .then(function (data) {

            if (data.length === 1) {
                callback({
                    auth: true,
                    data: data[0].id
                });
            } else {
                callback({
                    auth: false,
                    data: []
                });
            }
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

/* gets user information used when requesting repo data and objects */
exports.get_auth_user_data = function (username, callback) {

    // TODO: get group_id(s)
    knex('tbl_users')
        .select('id', 'du_id', 'email', 'first_name', 'last_name')
        .where({
            du_id: username,
            status: 1
        })
        .then(function (data) {

            console.log(data);

            if (data.length === 1) {
                callback({
                    data: data
                });
            } else {
                callback({
                    data: []
                });
            }
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.update_user = function (req, callback) {
    // TODO:...
};

exports.save_user = function (req, callback) {

    // TODO: sanitize
    var userObj = req.body;

    knex('tbl_users')
        .insert(userObj)
        .then(function (data) {
            callback({
                status: 201,
                content_type: {'Content-Type': 'application/json'},
                message: 'User created.'
            });
        })
        .catch(function (error) {
            console.log(error);
            callback({
                status: 500,
                content_type: {'Content-Type': 'application/json'},
                message: 'Database error occurred.'
            });
        });
};

exports.get_user_groups = function (req, callback) {

    // TODO: sanitize
    var id = req.query.id;

    knex('tbl_users_tbl_groups')
        .join('tbl_groups', 'tbl_groups.id', '=', 'tbl_users_tbl_groups.group_id')
        .select(
        'tbl_users_tbl_groups.group_id',
        'tbl_groups.group_name',
        'tbl_groups.group_description',
        'tbl_groups.permissions',
        'tbl_groups.resources'
    )
        .where({
            user_id: id
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'User groups retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};
