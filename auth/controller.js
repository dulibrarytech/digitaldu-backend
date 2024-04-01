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

const CONFIG = require('../config/config');
const TOKEN = require('../libs/tokens');
const MODEL = require('../users/model');
const CACHE = require('../libs/cache');
const VALIDATOR = require('validator');

exports.sso = function (req, res) {

    if (req.body.employeeID === undefined || req.body.HTTP_HOST === undefined) {

        res.status(403).send({
            message: 'You do not have access to this resource.'
        });
        return false;
    }

    if (!VALIDATOR.isNumeric(req.body.employeeID) || !VALIDATOR.isFQDN(req.body.HTTP_HOST)) {

        res.status(403).send({
            message: 'You do not have access to this resource.'
        });

        return false;
    }

    if (req.body.employeeID.length > 10) {

        res.status(400).send({
            message: 'Bad Request.'
        });

        return false;
    }

    const APP_PATH = ''; // TODO
    const USERNAME = req.body.employeeID;
    const SSO_HOST = req.body.HTTP_HOST;
    delete req.body;

    if (SSO_HOST === CONFIG.ssoHost) {

        let token = TOKEN.create(USERNAME);
        token = encodeURIComponent(token);

        MODEL.check_auth_user(USERNAME, (result) => {

            if (result.auth === true) {
                res.redirect(APP_PATH + '/dashboard/home?t=' + token + '&id=' + parseInt(result.data));
            } else {
                res.status(403).send({
                    message: 'You do not have access to this resource.'
                });
            }
        });

    } else {
        res.status(401).send({
            message: 'Authentication failed.'
        });
    }
};

exports.logout = (req, res) => {
    CACHE.clear_cache();
    res.render('logout', {
        host: CONFIG.host,
        appname: CONFIG.appName,
        appversion: CONFIG.appVersion,
        organization: CONFIG.organization,
        redirect: CONFIG.ssoLogoutUrl
    });
};
