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

const ARCHIVESSPACE = require('../libs/archivespace'),
    HTTP = require('../libs/http'),
    LOGGER = require('../libs/log4');

/**
 * Gets session token
 * @param req
 * @param callback
 */
exports.get_session_token = function(req, callback) {

    ARCHIVESSPACE.get_session_token(function (response) {

        let result = response.data,
            token,
            obj = {
                status: 200,
                data: {
                    session: null
                }
            };

        try {

            token = JSON.parse(result);

            if (token.session === undefined) {
                LOGGER.module().error('ERROR: [/import/service module (get_session_token/ARCHIVESSPACE.get_session_token)] session token is undefined');
                obj.message = 'Unable to get session token';
                callback(obj);
                return false;
            }

            if (token.error === true) {
                LOGGER.module().error('ERROR: [/import/service module (get_session_token/ARCHIVESSPACE.get_session_token)] session token error' + token.error_message);
                obj.message = 'Session token error ' + token.error_message;
                callback(obj);
                return false;
            }

            obj.data.session = token.session;
            callback(obj);
            return false;

        } catch (error) {
            LOGGER.module().fatal('FATAL: [/import/service module (get_session_token/ARCHIVESSPACE.get_session_token)] session token error ' + error);
            obj.message = 'Session token error ' + error;
            callback(obj);
            return false;
        }
    });
};

/**
 * Destroys session token
 * @param req
 * @param callback
 */
exports.destroy_session_token = function(req, callback) {

    let session = req.body.session;

    ARCHIVESSPACE.destroy_session_token(session, function (result) {

        if (result.error === true) {
            LOGGER.module().error('ERROR: [/import/service module (destroy_session_token)] unable to destroy session ' + result);
        }

        callback({
            status: 201
        });
    });
};

/**
 * Gets mods record
 * @param obj
 * @param callback
 */
exports.get_mods = function(obj, callback) {

    ARCHIVESSPACE.get_mods(obj.mods_id, obj.session, function (result) {

        if (result.error === false) {

            obj.error = result.error;
            obj.mods = JSON.stringify(result.mods.data);
            callback(obj);
            return false;

        } else if (result.error === true && result.status === 412) {

            LOGGER.module().info('INFO: [/import/service module (get_mods)] a new session token is required ' + result.message);

            (async() => {

                let response = await HTTP.get({
                    endpoint: '/api/admin/v1/import/metadata/session'
                });

                if (response.error === true) {
                    obj.session = null;
                    callback(null, obj);
                } else {

                    obj.session = response.data.session;

                    ARCHIVESSPACE.get_mods(obj.mods_id, obj.session, function(result) {

                        if (result.error === false) {
                            obj.error = result.error;
                            obj.mods = JSON.stringify(result.mods.data);
                            callback(null, obj);
                        } else {
                            LOGGER.module().error('ERROR: [/import/service module (get_mods)] unable to get mods');
                            obj.error = result.error;
                            obj.mods = null;
                            callback(obj);
                        }

                    });
                }

            })();

            return false;

        } else {
            LOGGER.module().error('ERROR: [/import/service module (get_mods)] unable to get mods');
            obj.error = result.error;
            obj.mods = null;
            callback(obj);
            return false;
        }
    });
};