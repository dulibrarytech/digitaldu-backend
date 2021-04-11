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

const USERS = require('../users/model'),
    CACHE = require('../libs/cache');

/**
 * Gets Users
 * @param req
 * @param res
 */
exports.get_users = function (req, res) {

    let cache = CACHE.get_cache(req);

    if (cache) {
        res.send(cache);
    } else {
        USERS.get_users(req, function (data) {
            res.status(data.status).send(data.data);
        });
    }
};

/**
 * Updates user
 * @param req
 * @param res
 */
exports.update_user = function (req, res) {
    CACHE.clear_cache();
    USERS.update_user(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/**
 * Deletes user
 * @param req
 * @param res
 */
exports.delete_user = function (req, res) {
    CACHE.clear_cache();
    USERS.delete_user(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/**
 * Saves user
 * @param req
 * @param res
 */
exports.save_user = function (req, res) {
    CACHE.clear_cache();
    USERS.save_user(req, function (data) {
        res.status(data.status).send(data.data);
    });
};