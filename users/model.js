/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const LOGGER = require('../libs/log4'),
    DB =require('../config/db')(),
    USERS = 'tbl_users';

/**
 * Gets all users
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.get_users = function (req, callback) {

    if (req.query.id !== undefined && req.query.id.length !== 0) {

        get_user(req, function (user) {
            callback(user);
        });

        return false;
    }

    DB(USERS)
        .select(
        'tbl_users.id',
        'tbl_users.du_id',
        'tbl_users.email',
        'tbl_users.first_name',
        'tbl_users.last_name',
        'tbl_users.is_active',
        'tbl_users.created'
    )
        .then(function (data) {
            callback({
                status: 200,
                data: data,
                message: 'Users retrieved.'
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/users/model module (get_users)] unable to get users ' + error);
            throw 'FATAL: [/users/model module (get_users)] unable to get users ' + error;
        });
};

/**
 * Gets one user
 * @param req
 * @param callback
 */
const get_user = function (req, callback) {

    let id = req.query.id;

    if (id === undefined || id.length === 0) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });
    }

    DB(USERS)
        .select('id', 'du_id', 'email', 'first_name', 'last_name', 'is_active', 'created')
        .where({
            id: id
        })
        .then(function (data) {

            callback({
                status: 200,
                data: data,
                message: 'User retrieved.'
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/users/model module (get_user)] unable to get user ' + error);
            throw 'FATAL: [/users/model module (get_user)] unable to get user ' + error;
        });
};

/**
 * Checks user access
 * @param username
 * @param callback
 */
exports.check_auth_user = function (username, callback) {

    DB(USERS)
        .select('id')
        .where({
            du_id: username,
            is_active: 1
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
            LOGGER.module().error('FATAL: [/users/model module (check_auth_user)] unable to check auth ' + error);
            throw 'FATAL: [/users/model module (check_auth_user)] unable to check auth ' + error;
        });
};

/**
 * Gets user data
 * @param username
 * @param callback
 */
exports.get_auth_user_data = function (username, callback) {

    DB(USERS)
        .select('id', 'du_id', 'email', 'first_name', 'last_name')
        .where({
            du_id: username,
            is_active: 1
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
            LOGGER.module().fatal('FATAL: [/users/model module (get_auth_user_data)] unable to get user data ' + error);
            throw 'FATAL: [/users/model module (get_auth_user_data)] unable to get user data ' + error;
        });
};

/**
 * Updates user data
 * @param req
 * @param callback
 */
exports.update_user = function (req, callback) {

    let User = req.body,
        id = User.id;

    if (User === undefined || id.length === 0) {

        callback({
            status: 400,
            message: 'Bad Request.'
        });
    }

    delete User.id;

    DB(USERS)
        .where({
            id: id
        })
        .update({
            email: User.email,
            first_name: User.first_name,
            last_name: User.last_name,
            is_active: User.is_active
        })
        .then(function (data) {

            callback({
                status: 201,
                message: 'User updated.'
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/users/model module (update_user)] unable to update user record ' + error);
            throw 'FATAL: [/users/model module (update_user)] unable to update user record ' + error;
        });
};

/**
 * Saves user data
 * @param req
 * @param callback
 */
exports.save_user = function (req, callback) {

    let userObj = req.body;
    let user = Object.values(userObj);

    if (user.indexOf(null) !== -1 || user.indexOf('') !== -1) {
        callback({
            status: 200,
            message: 'Please fill in all required fields.',
            data: userObj
        });

        return false;
    }

    DB(USERS)
        .count('du_id as du_id')
        .where('du_id', userObj.du_id)
        .then(function (data) {

            if (data[0].du_id === 1) {
                callback({
                    status: 200,
                    message: 'User is already in the system.'
                });

                return false;
            }

            DB(USERS)
                .insert(userObj)
                .then(function (data) {
                    callback({
                        status: 201,
                        message: 'User created.'
                    });
                })
                .catch(function (error) {
                    LOGGER.module().error('FATAL: [/users/model module (save_user)] unable to get user data ' + error);
                    throw 'FATAL: [/users/model module (save_user)] unable to get user data ' + error;
                });
        })
        .catch(function (error) {
            LOGGER.module().error('FATAL: [/users/model module (save_user)] unable to save user data ' + error);
            throw 'FATAL: [/users/model module (save_user)] unable to save user data ' + error;
        });

    return false;
};