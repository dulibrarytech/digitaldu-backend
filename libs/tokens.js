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

const TOKEN_CONFIG = require('../config/token_config')();
const WEBSERVICES_CONFIG = require('../config/webservices_config')();
const CONFIG = require('../config/config');
const JWT = require('jsonwebtoken');
const LOGGER = require('../libs/log4');
const VALIDATOR = require('validator');

/**
 * Creates session token
 * @param username
 */
exports.create = function (username) {

    let tokenData = {
        sub: username,
        iss: TOKEN_CONFIG.token_issuer
    };

    return JWT.sign(tokenData, TOKEN_CONFIG.token_secret, {
        algorithm: TOKEN_CONFIG.token_algo,
        expiresIn: TOKEN_CONFIG.token_expires
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

    if (token !== undefined && VALIDATOR.isJWT(token)) {

        JWT.verify(token, TOKEN_CONFIG.token_secret, function (error, decoded) {

            if (error) {
                LOGGER.module().error('ERROR: [/libs/tokens lib (verify)] unable to verify token ' + error.message);
                res.redirect(WEBSERVICES_CONFIG.sso_url + '?app_url=' + WEBSERVICES_CONFIG.sso_response_url);
                return false;
            }

            req.decoded = decoded;
            next();
        });

    } else if (key !== undefined && key === CONFIG.apiKey)  {

        let api_key = key;

        if (Array.isArray(key)) {
            api_key = key.pop();
        }

        if (!VALIDATOR.isAlphanumeric(api_key)) {
            res.status(401).send({
                message: 'Unauthorized request'
            });

            return false;
        }

        req.query.api_key = api_key;

        next();

    } else {

        LOGGER.module().error('ERROR: [/libs/tokens lib (verify)] unable to verify api key');
        res.redirect(WEBSERVICES_CONFIG.sso_url + '?app_url=' + WEBSERVICES_CONFIG.sso_response_url);
    }
};