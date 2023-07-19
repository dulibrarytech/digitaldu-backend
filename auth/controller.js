/**

 Copyright 2023 University of Denver

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

const APP_CONFIG = require('../config/app_config')();
const WEBSERVICES_CONFIG = require('../config/webservices_config')();
const TOKEN = require('../libs/tokens');
const MODEL = require('../auth/model'); // TODO: create object
const CACHE = require('../libs/cache');
const AUTH = new MODEL();

const Auth_controller = class {

    constructor() {};

    /**
     * Single-Sign-On authentication
     * @param req
     * @param res
     */
    async sso(req, res) {

        const SSO_HOST = req.body.HTTP_HOST;
        const USERNAME = req.body.employeeID;

        if (SSO_HOST === WEBSERVICES_CONFIG.ssoHost && USERNAME !== undefined) {

            let token = TOKEN.create(USERNAME);
            token = encodeURIComponent(token);

            const result = await AUTH.check_auth_user(USERNAME);

            if (result.auth === true) {
                res.redirect('/dashboard/home?t=' + token + '&id=' + result.data);
            } else {

                res.status(401).send({
                    message: 'Authenticate failed.'
                });
            }
        }
    }

    /**
     * Gets user profile data
     * @param req
     * @param res
     */
    async get_auth_user_data(req, res) {
        const id = req.query.id;
        const data = await AUTH.get_auth_user_data(id);
        res.status(data.status).send(data.data);
    }

    logout(req, res) {
        CACHE.clear_cache();
        res.render('logout', {
            host: APP_CONFIG.host,
            appname: APP_CONFIG.app_name,
            appversion: APP_CONFIG.app_version,
            organization: APP_CONFIG.organization,
            redirect: WEBSERVICES_CONFIG.ssoLogoutUrl
        });
    }
}

module.exports = Auth_controller;
