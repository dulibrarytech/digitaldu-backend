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

const CONFIG = require('../config/config'),
    ARCHIVESSPACE = require('../libs/archivespace'),
    HTTP = require('axios'),
    KA = require('http'),
    LOGGER = require('../libs/log4');

/**
 * Gets list of ready folders
 * @param req
 * @param callback
 */
exports.get_list_ready = function(req, callback) {

    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/list-ready?api_key=' + CONFIG.qaApiKey;

    (async() => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: 25000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                callback({
                    status: 200,
                    data: response.data
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (get_list_ready)] request to QA server failed - ' + error);

            callback({
                status: 500
            });

            return false;
        }

    })();
};

/**
 * Executes QA processes on designated folder
 * @param req
 * @param callback
 */
exports.get_ready_folder = function(req, callback) {

    let folder = req.query.folder;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/ready?folder=' + folder + '&api_key=' + CONFIG.qaApiKey;

    (async() => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: 25000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                callback({
                    status: 200,
                    data: response.data
                });

                return false;

            } else {

                callback({
                    status: 404, // ?
                    data: []
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (get_list_ready)] request to QA server failed - ' + error);
            return false;
        }

    })();
};

/**
 * moves folder from ready to ingest folder
 * @param req
 * @param callback
 */
exports.move_to_ingest = function(req, callback) {

    let pid = req.query.pid;
    let folder = req.query.folder;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/move-to-ingest?pid=' + pid + '&folder=' + folder + '&api_key=' + CONFIG.qaApiKey;

    (async() => {

        try {

            let response = await HTTP.get(qaUrl, {
                httpAgent: new KA.Agent({ keepAlive: true }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                callback({
                    status: 200,
                    data: response.data
                });

                return false;

            } else {

                callback({
                    status: 404, // ?
                    data: []
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (get_list_ready)] request to QA server failed - ' + error);
            return false;
        }

    })();
};