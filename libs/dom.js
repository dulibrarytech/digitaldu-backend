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

const CREATEDOMPURIFY = require('dompurify'),
    {JSDOM} = require('jsdom'),
    WINDOW = new JSDOM('').window,
    DOMPURIFY = CREATEDOMPURIFY(WINDOW),
    VALIDATOR = require('validator');

/**
 * Middleware function used to sanitize body (form) inputs
 * @param req
 * @param res
 * @param next
 */
exports.sanitize_req_body = function(req, res, next) {

    if (req.body === undefined) {
        next();
    }

    let keys = Object.keys(req.body);

    keys.map(function (prop) {

        if (req.body.hasOwnProperty(prop)) {

            if (prop !== 'is_active' && typeof req.body[prop] === 'string') {
                req.body[prop] = DOMPURIFY.sanitize(VALIDATOR.escape(VALIDATOR.trim(req.body[prop])));
            }
        }
    });

    next();
};

/**
 * Middleware function used to sanitize query string inputs
 * @param req
 * @param res
 * @param next
 */
exports.sanitize_req_query = function(req, res, next) {

    if (req.query === undefined) {
        next();
    }

    let keys = Object.keys(req.query);

    keys.map(function (prop) {

        if (req.query.hasOwnProperty(prop) && typeof req.query[prop] === 'string') {
            req.query[prop] = DOMPURIFY.sanitize(VALIDATOR.escape(VALIDATOR.trim(req.query[prop])));
        }
    });

    next();
};

/**
 * Validates uuids in query string
 * @param req
 * @param res
 * @param next
 */
exports.validate_uuid = function(req, res, next) {

    if (req.query.sip_uuid !== undefined && Array.isArray(req.query.sip_uuid)) {
        req.query.sip_uuid = req.query.sip_uuid.pop();
    } else if (req.query.pid !== undefined && Array.isArray(req.query.pid)) {
        req.query.pid = req.query.pid.pop();
    }

    if (Object.entries(req.query).length !== 0 && req.query.sip_uuid !== undefined) {

        if (VALIDATOR.isUUID(req.query.sip_uuid)) {
            next();
        } else {
            res.status(404).send({
                message: 'Resource not found.'
            });
        }

    } else if (Object.entries(req.query).length !== 0 && req.query.pid !== undefined) {

        if (VALIDATOR.isUUID(req.query.pid) || req.query.pid === 'codu:root') {
            next();
        } else {
            res.status(404).send({
                message: 'Resource not found.'
            });
        }

    } else {
        next();
    }
};
