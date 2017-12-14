'use strict';

var jwt = require('jsonwebtoken'),
    config = require('../config/config');

exports.create = function (username) {

    var tokenData = {
        sub: username,
        iss: 'https://fines.library.du.edu'
    };

    var token = jwt.sign(tokenData, config.tokenSecret, {
        algorithm: config.tokenAlgo,
        expiresIn: config.tokenExpires
    });

    return token;
};

exports.verify = function (req, res, next) {

    var token = req.query.t;

    if (token) {

        jwt.verify(token, config.tokenSecret, function (err, decoded) {

            if (err) {
                return res.renderStatic('session', {
                    url: config.primoUrl
                });
            }

            req.decoded = decoded;
            next();
        });
    } else {
        return res.renderStatic('session', {
            url: config.primoUrl
        });
    }
};