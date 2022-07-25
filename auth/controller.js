/**

 Copyright 2022 University of Denver

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

const CONFIG = require('../config/app_config')(),
    TOKEN = require('../libs/tokens'),
    SERVICE = require('../auth/service'),
    MODEL = require('../auth/model');

exports.login = function (req, res) {

    let username = req.body.username;
    let password = req.body.password;

    SERVICE.authenticate(username, password, function (isAuth) {

        if (isAuth.auth === true) {

            let token = TOKEN.create(username);
            token = encodeURIComponent(token);

            /* check if user has access to repo */
            MODEL.check_auth_user(username, function (result) {

                if (result.auth === true) {

                    res.status(200).send({
                        message: 'Authenticated',
                        redirect: '/dashboard/home?t=' + token + '&id=' + result.data
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
};

exports.get_auth_user_data = function (req, res) {
    let id = req.query.id;
    MODEL.get_auth_user_data(id, function(data) {
        res.status(data.status).send(data.data);
    });
};

exports.login_form = function (req, res) {
    // res.renderStatic
    res.render('login', {
        host: CONFIG.host,
        message: '',
        username: ''
    });
};