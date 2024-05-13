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

const APP_CONFIG = require('../config/app_config')();
const WEBSERVICES_CONFIG = require('../config/webservices_config')();
const TOKEN = require('../libs/tokens');
const MODEL = require('../users/model');
const AUTH_TASKS = require('../auth/tasks/auth_tasks');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const VALIDATOR = require('validator');
const LOGGER = require('../libs/log4');

exports.sso = function (req, res) {

    try {

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

        const USERNAME = req.body.employeeID;
        const SSO_HOST = req.body.HTTP_HOST;
        delete req.body;

        if (SSO_HOST === WEBSERVICES_CONFIG.sso_host) {

            let token = TOKEN.create(USERNAME);
            let refresh_token = TOKEN.refresh_token(USERNAME);
            token = encodeURIComponent(token);
            refresh_token = encodeURIComponent(refresh_token);

            (async function () {
                const TASK = new AUTH_TASKS(DB, DB_TABLES);
                await TASK.save_token(USERNAME, refresh_token);
            })();

            MODEL.check_auth_user(USERNAME, (result) => {

                if (result.auth === true) {
                    res.redirect(APP_CONFIG.app_path + '/dashboard/home?t=' + token + '&rt=' + refresh_token + '&id=' + parseInt(result.data));
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

    } catch (error) {
        LOGGER.module().error('ERROR: [/auth/controller (sso)] SSO process failed. ' + error.message);
    }
};

exports.refresh_token = function (req, res) {

    (async function () {

        try {

            const uid = req.query.id;
            const token = req.headers['x-access-token'];
            const TASK = new AUTH_TASKS(DB, DB_TABLES);
            const result = await TASK.get_token(uid);
            const dbrt = result[0].token;
            const tmp_hrt = JSON.parse(token);
            const hrt = tmp_hrt.token;

            if (hrt === dbrt) {

                // TODO: VALIDATOR.isJWT();
                res.status(201).send({
                    token: TOKEN.create(result[0].du_id)
                });

            } else {
                res.status(401).send({});
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/controller (refresh_token)] Unable to refresh token. ' + error.message);
        }

    })();
};

exports.get_auth_landing = function (req, res) {
    res.render('auth-landing', {
        host: APP_CONFIG.host,
        appname: APP_CONFIG.appname,
        appversion: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization,
        redirect: WEBSERVICES_CONFIG.sso_logout_url
    });
};

exports.logout = function (req, res) {

    if (req.query.uid === undefined) {
        res.status(400).send('Bad Request.');
        return false;
    }

    (async function () {

        try {

            const uid = req.query.uid;
            const TASK = new AUTH_TASKS(DB, DB_TABLES);
            const is_deleted = await TASK.delete_token(uid);

            if (is_deleted === 1) {
                LOGGER.module().info('INFO: [/auth/controller (logout)] Token deleted. ');
            } else {
                LOGGER.module().error('ERROR: [/auth/controller (logout)] Unable to delete token. ');
            }

            res.render('logout', {
                host: APP_CONFIG.host,
                appname: APP_CONFIG.appname,
                appversion: APP_CONFIG.app_version,
                organization: APP_CONFIG.organization,
                redirect: WEBSERVICES_CONFIG.sso_logout_url
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/auth/controller (logout)] Unable to logout. ' + error.message);
        }

    })();
};
