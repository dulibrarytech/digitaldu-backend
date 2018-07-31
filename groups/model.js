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

    if (req.query.id !== undefined) {

        get_group(req, function (results) {
            callback(results);
        });

        return false;
    }

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

var get_group = function (req, callback) {

    var id = req.query.id; // TODO: sanitize

    knex('tbl_groups')
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

exports.add_user_to_group = function (req, callback) {

    // TODO: check for user and group ids
    var userGroupObj = {
        user_id: req.body.user_id,
        group_id: req.body.group_id
    };

    knex('tbl_users_tbl_groups')
        // .select('id', 'group_name', 'group_description', 'permissions', 'created')
        .count('user_id as count')
        .where({
            user_id: userGroupObj.user_id,
            group_id: userGroupObj.group_id
        })
        .then(function (data) {

            if (data[0].count > 0) {

                callback({
                    status: 400,
                    content_type: {'Content-Type': 'application/json'},
                    message: 'User is already in the group.'
                });

                return false;
            }

            knex('tbl_users_tbl_groups')
                .insert(userGroupObj)
                .then(function (data) {
                    callback({
                        status: 201,
                        content_type: {'Content-Type': 'application/json'},
                        message: 'User added to group.'
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
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.remove_user_from_group = function (req, callback) {

    var user_id = req.query.user_id,
        group_id = req.query.group_id;

    knex('tbl_users_tbl_groups')
        .where({
            user_id: user_id,
            group_id: group_id
        })
        .del()
        .then(function (data) {
            console.log(data);
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: [],
                message: 'User removed from group.'
            });
        })
        .catch(function (error) {
            console.log(error);
        });
};