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

const MODEL = require('../users/model');
const CACHE = require('../libs/cache');

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

        if (req.query.id !== undefined && req.query.id.length !== 0) {

            const id = req.query.id;

            MODEL.get_user(id, function (data) {
                res.status(data.status).send(data.data);
            });

            return false;
        }

        MODEL.get_users(function (data) {
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

    const user = req.body;
    const id = user.id;

    if (id.length === 0) {
        res.status(400).send('Bad Request.');
    }

    delete user.id;

    MODEL.update_user(id, user, function (data) {
        res.status(data.status).send(data.data);
    });
};

/**
 * Saves user
 * @param req
 * @param res
 */
exports.save_user = function (req, res) {

    if (req.body === undefined) {
        res.status(400).send('Bad Request.');
        return false;
    }

    CACHE.clear_cache();

    let user = req.body;

    MODEL.save_user(user, function (data) {
        res.status(data.status).send(data.data);
    });
};

/**
 * Deletes user
 * @param req
 * @param res
 */
exports.delete_user = function (req, res) {

    let id = req.query.id;

    if (id === undefined || id.length === 0) {
        res.status(400).send('Bad Request.');
        return false;
    }

    CACHE.clear_cache();
    MODEL.delete_user(id, function (data) {
        res.status(data.status).send(data.data);
    });
};
