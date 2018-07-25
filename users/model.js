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
    var getUsers = function () {

        knex('tbl_users')
            .join('tbl_users_tbl_groups', 'tbl_users.id', '=', 'tbl_users_tbl_groups.user_id')
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

    var getGroups = function () {


    };

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

exports.get_user = function (req, callback) {

    var id = req.query.id; // TODO: sanitize

    knex('tbl_users')
        .select('id', 'group_id', 'du_id', 'email', 'first_name', 'last_name', 'status', 'created')
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

exports.update_user = function (req, callback) {
    // TODO:...
};

exports.save_user = function (req, callback) {
    // TODO: ...
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
