'use strict';

const jwt = require('jsonwebtoken'),
    config = require('../config/config'),
    logger = require('../libs/log4');

/**
 * Creates session token
 * @param username
 * @returns {*}
 */
exports.create = function (username) {

    let tokenData = {
        sub: username,
        iss: config.tokenIssuer
    };

    return jwt.sign(tokenData, config.tokenSecret, {
        algorithm: config.tokenAlgo,
        expiresIn: config.tokenExpires
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

    if (token) {

        jwt.verify(token, config.tokenSecret, function (error, decoded) {

            if (error) {

                logger.module().error('ERROR: unable to verify token ' + error);

                res.status(401).send({
                    message: 'Unauthorized request ' + error
                });

                return false;
            }

            req.decoded = decoded;
            next();
        });

    } else {

        logger.module().error('ERROR: Unauthorized request');

        res.status(401).send({
            message: 'Unauthorized request'
        });

    }
};