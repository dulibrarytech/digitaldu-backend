'use strict';

var _ = require('lodash'),
    validator = require('validator'),
    config = require('../config/config'),
    Token = require('../libs/tokens'),
    Service = require('../auth/service'),
    User = require('../users/model');

exports.login = function (req, res) {

    if (!_.isEmpty(req.body)) {

        var username = validator.trim(req.body.username),
            password = validator.trim(req.body.password);

        if (username.length === 0) {

            res.render('login', {
                host: config.host,
                message: 'Please enter your DU ID.',
                username: ''
            });

            return false;

        } else if (password.length === 0) {

            res.render('login', {
                message: 'Please enter your passcode.',
                username: username
            });

            return false;

        } else if (!validator.isNumeric(username)) {

            res.render('login', {
                host: config.host,
                message: 'Please enter a DU ID. i.e. 871******',
                username: ''
            });

            return false;
        }

        Service.authenticate(username, password, function (isAuth) {

            if (isAuth.auth === true) {

                var token = Token.create(username);
                token = encodeURIComponent(token);
                var uid = username.trim();

                /* check if user has access to repo */
                User.check_auth_user(username, function (result) {

                    if (result.auth === true) {
                        res.redirect('/dashboard/home?t=' + token + '&uid=' + result.data);
                    } else {
                        res.redirect('/login?error=true');
                    }
                });

            } else if (isAuth.auth === false) {

                res.render('login', {
                    host: config.host,
                    message: '',
                    username: ''
                });
            }
        });

    } else {
        res.render('login', {
            host: config.host,
            message: '',
            username: ''
        });
    }
};