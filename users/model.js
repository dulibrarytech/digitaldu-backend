'use strict';

const config = require('../config/config'),
    fs = require('fs'),
    logger = require('../libs/log4'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

/**
 * Gets all users
 * @param req
 * @param callback
 * @returns {boolean}
 */
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
            logger.module().error('ERROR: unable to get users ' + error);
            throw 'ERROR: unable to get users ' + error;
        });
};

/**
 * Gets one user
 * @param req
 * @param callback
 */
const get_user = function (req, callback) {

    let id = req.query.id; // TODO: sanitize

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
            logger.module().error('ERROR: unable to get user ' + error);
            throw 'ERROR: unable to get user ' + error;
        });
};

/**
 * Checks user access
 * @param username
 * @param callback
 */
exports.check_auth_user = function (username, callback) {

    knex('tbl_users')
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
            logger.module().error('ERROR: unable to check auth ' + error);
            throw 'ERROR: unable to check auth ' + error;
        });
};

/**
 * Gets user data
 * @param username
 * @param callback
 */
exports.get_auth_user_data = function (username, callback) {

    knex('tbl_users')
        .select('id', 'du_id', 'email', 'first_name', 'last_name')
        .where({
            du_id: username,
            status: 1
        })
        .then(function (data) {

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
            logger.module().error('ERROR: unable to get user data ' + error);
            throw 'ERROR: unable to get user data ' + error;
        });
};

/**
 * Updates user data
 * @param req
 * @param callback
 */
exports.update_user = function (req, callback) {
    // TODO:...
};

/**
 * Saves user data
 * @param req
 * @param callback
 */
exports.save_user = function (req, callback) {

    let userObj = req.body;

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
            logger.module().error('ERROR: unable to get user data ' + error);

            callback({
                status: 500,
                content_type: {'Content-Type': 'application/json'},
                message: 'Database error occurred.'
            });
        });
};