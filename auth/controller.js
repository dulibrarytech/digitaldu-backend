'use strict';

var _ = require('lodash'),
    validator = require('validator'),
    Token = require('../libs/tokens'),
    Service = require('../auth/service');

exports.login = function (req, res) {

    if (!_.isEmpty(req.body)) {

        var username = validator.trim(req.body.username),
            password = validator.trim(req.body.password);

        if (username.length === 0) {

            res.render('login', {
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
                message: 'Please enter a DU ID. i.e. 871******',
                username: ''
            });

            return false;
        }

        Service.authenticate(username, password, function (isAuth) {

            if (isAuth.auth === true) {

                var token = Token.create(username);
                token = encodeURIComponent(token);
                var encodedID = new Buffer(username).toString('base64');
                res.redirect('/fines?t=' + token + '&id=' + encodedID);

            } else if (isAuth.auth === false) {

                Service.almaAuthenticate(username, password, function (isAuth) {

                    if (isAuth.auth === true) {

                        var token = Token.create(username);
                        token = encodeURIComponent(token);
                        var encodedID = new Buffer(username).toString('base64');
                        res.redirect('/fines?t=' + token + '&id=' + encodedID);

                    } else {
                        res.render('login', {
                            message: 'Authentication Failed. Please try again.',
                            username: req.body.username
                        });
                    }
                });
            }
        });

    } else {
        res.render('login', {
            message: '',
            username: ''
        });
    }
};