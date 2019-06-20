'use strict';

const _ = require('lodash'),
    validator = require('validator'),
    config = require('../config/config'),
    Token = require('../libs/tokens'),
    Service = require('../auth/service'),
    User = require('../users/model');

exports.login = function (req, res) {

    if (!_.isEmpty(req.body)) {

        let username = validator.trim(req.body.username),
            password = validator.trim(req.body.password);

        if (username.length === 0) {

            res.status(401).send({
                message: 'Authenticate failed. Please enter your DU ID.'
            });

            return false;

        } else if (password.length === 0) {

            res.status(401).send({
                message: 'Authenticate failed. Please enter your passcode.'
            });

            return false;

        } else if (!validator.isNumeric(username)) {

            res.status(401).send({
                message: 'Authenticate failed due to invalid username.  Please enter a DU ID. i.e. 871******'
            });

            return false;

        } else {

            Service.authenticate(username, password, function (isAuth) {

                if (isAuth.auth === true) {

                    let token = Token.create(username);
                    token = encodeURIComponent(token);
                    let uid = username.trim();

                    /* check if user has access to repo */
                    User.check_auth_user(username, function (result) {

                        if (result.auth === true) {

                            res.status(200).send({
                                message: 'Authenticated',
                                redirect: '/dashboard/home?t=' + token + '&uid=' + result.data
                            });

                        } else {

                            res.status(401).send({
                                message: 'Authenticate failed.'
                            });
                        }
                    });

                } else if (isAuth.auth === false) {

                    res.status(401).send({
                        message: 'Authenticate failed.'
                    });
                }
            });
        }
    }
};

exports.login_form = function (req, res) {

    res.render('login', {
        host: config.host,
        message: '',
        username: ''
    });
};