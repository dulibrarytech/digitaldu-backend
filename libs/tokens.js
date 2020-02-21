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

const CONFIG = require('../config/config'),
    JWT = require('jsonwebtoken'),
    LOGGER = require('../libs/log4');

/**
 * Creates session token
 * @param username
 * @returns {*}
 */
exports.create = function (username) {

    let tokenData = {
        sub: username,
        iss: CONFIG.tokenIssuer
    };

    return JWT.sign(tokenData, CONFIG.tokenSecret, {
        algorithm: CONFIG.tokenAlgo,
        expiresIn: CONFIG.tokenExpires
    });
};

/**
 * Verifies session token
 * @param req
 * @param res
 * @param next
 */
exports.verify = function (req, res, next) {

    let token = req.headers['x-access-token'] || req.query.t;
    let key = req.query.api_key;

    if (token !== undefined) {

        JWT.verify(token, CONFIG.tokenSecret, function (error, decoded) {

            if (error) {

                LOGGER.module().error('ERROR: [/libs/tokens lib (verify)] unable to verify token ' + error);

                res.status(401).send({
                    message: 'Unauthorized request ' + error
                });

                return false;
            }

            req.decoded = decoded;
            next();
        });

    } else if (key !== undefined)  {

        if (key === CONFIG.apiKey) {
            next();
            return false;
        } else {

            LOGGER.module().error('ERROR: [/libs/tokens lib (verify)] unable to verify api key');

            res.status(401).send({
                message: 'Unauthorized request'
            });
        }
    }
};