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

const MCACHE = require('memory-cache'),
    LOGGER = require('../libs/log4'),
    FS = require('fs'),
    PATH = require('path'),
    TN_CACHE = '../public/tn_cache/',
    CACHE_TIME = 60000 * 720; // 12hrs

/**
 * Constructs cache key
 * @param req
 * @returns {string}
 */
const construct_cache_key = function (req) {
    return '__repo-cache__' + req.originalUrl || req.url;
};

/**
 * Caches of the request
 * @param req
 * @param data
 */
exports.cache_request = function (req, data) {
    let key = construct_cache_key(req);
    MCACHE.put(key, data, CACHE_TIME, function (key, value) {
        LOGGER.module().info('INFO: [/libs/cache (cache_request)] ' + key + ' cached.');
    });
};

/**
 * Gets cached data
 * @param req
 * @returns {*}
 */
exports.get_cache = function (req) {
    let key = construct_cache_key(req);
    return MCACHE.get(key);
};

/**
 * Clears cache
 */
exports.clear_cache = function () {
    MCACHE.clear();
    LOGGER.module().info('INFO: [/libs/cache (clear_cache)] cache cleared. ');
};

/**
 * Caches thumbnail
 * @param uuid
 * @param tn
 */
exports.cache_tn = function (uuid, tn) {

    let tn_path = PATH.join(__dirname, TN_CACHE);

    FS.writeFile(tn_path + uuid + '.jpg', tn, (error) => {

        if (error) {
            LOGGER.module().error('ERROR: [/libs/cache (cache_tn)]' + error.message);
        }
    });
};

/**
 * Gets cached thumbnail
 * @param req
 * @returns {string}
 */
exports.get_tn_cache = function (req) {

    let uuid = req.query.uuid;
    let tn = PATH.join(__dirname, TN_CACHE, uuid + '.jpg');

    try {

        if(FS.existsSync(tn)) {
            return tn;
        } else {
            return false;
        }

    } catch (error) {
        LOGGER.module().error('ERROR: [/libs/cache (get_tn_cache)]' + error);
    }
};