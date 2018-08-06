'use strict';

var jwt = require('jsonwebtoken'),
    config = require('../config/config');

exports.create = function (username) {

    var tokenData = {
        sub: username,
        iss: 'https://libspec01-vlp.du.edu'
    };

    var token = jwt.sign(tokenData, config.tokenSecret, {
        algorithm: config.tokenAlgo,
        expiresIn: config.tokenExpires
    });

    return token;
};

exports.verify = function (req, res, next) {

    var token = req.headers['x-access-token'] || req.query.t;

    if (token) {

        jwt.verify(token, config.tokenSecret, function (err, decoded) {

            if (err) {
                // TODO: redirect to login
            }

            req.decoded = decoded;
            next();
        });
    } else {
        console.log('Unable to verify token');
    }
};