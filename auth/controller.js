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

const CONFIG = require('../config/webservices_config')();
const TOKEN = require('../libs/tokens');
const MODEL = require('../auth/model');
const CACHE = require('../libs/cache');

exports.sso = (req, res) => {

    const SSO_HOST = req.body.HTTP_HOST;
    const USERNAME = req.body.employeeID;

    if (SSO_HOST === CONFIG.ssoHost && USERNAME !== undefined) {

        let token = TOKEN.create(USERNAME);
        token = encodeURIComponent(token);

        MODEL.check_auth_user(USERNAME, (result) => {

            if (result.auth === true) {
                res.redirect('/dashboard/home?t=' + token + '&id=' + result.data);
            } else {

                // TODO: add template to provide user feedback
                res.status(401).send({
                    message: 'Authenticate failed.'
                });
            }
        });
    }
};

exports.get_auth_user_data = (req, res) => {
    const ID = req.query.id;
    MODEL.get_auth_user_data(ID, (data) => {
        res.status(data.status).send(data.data);
    });
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
