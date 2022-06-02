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
    ARCHIVESSPACE = require('../libs/archivesspace'),
    // KA = require('http'),
    HTTP = require('axios'),
    VALIDATOR = require('validator'),
    LOGGER = require('../libs/log4'),
    TIMEOUT = 60000*15;

/**
 * Gets list of ready folders
 * @param req
 * @param callback
 */
exports.get_list_ready = function (req, callback) {

    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/list-ready?api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
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
exports.run_qa = function (req, callback) {

    let folder = req.query.folder;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/run-qa?folder=' + folder + '&api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
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
            return false;
        }

    })();
};

/**
 * Checks batch metadata records
 * @param req
 * @param callback
 */
exports.check_metadata = function (req, callback) {

    let uri_str = VALIDATOR.unescape(req.query.uri);
    let uri_arr = uri_str.split('/');
    let uri = uri_arr[uri_arr.length - 1];

    ARCHIVESSPACE.get_session_token(function(result) {

        let obj = JSON.parse(result.data);

        ARCHIVESSPACE.get_mods(uri, obj.session, function(record) {

            let errors = [];
            let error_obj = {};

            if (record.mods.data.title === undefined || record.mods.data.title.length === 0) {
                errors.push(-1);
                error_obj.error = 'Title is missing'
            }

            if (record.mods.data.uri === undefined || record.mods.data.uri.length === 0) {
                errors.push(-1);
                error_obj.error = 'URI is missing';
            }

            if (record.mods.data.identifiers === undefined || record.mods.data.identifiers.length === 0) {
                errors.push(-1);
                error_obj.error = 'Identifier is missing';
            } else {
                // TODO:... look for specific identifier fields
            }

            if (record.mods.data.notes === undefined) {  // TODO: || record.mods.data.notes.length === 0
                errors.push(-1);
                error_obj.error = 'Notes is missing';
            } else {

                for (let i=0;i<record.mods.data.notes.length;i++) {

                    if (record.mods.data.notes[i].type === 'abstract' && record.mods.data.notes[i].content.length === 0) {
                        errors.push(-1);
                        error_obj.error = 'Abstract is missing';
                    }

                    if (record.mods.data.notes[i].type === 'userestrict' && record.mods.data.notes[i].content.length === 0) {
                        errors.push(-1);
                        error_obj.error = 'Rights statement is missing';
                    }
                }
            }

            if (record.mods.data.dates !== undefined) {

                for (let i=0;i<record.mods.data.dates.length;i++) {

                    if (record.mods.data.dates[i].expression === undefined || record.mods.data.dates[i].expression.length === 0) {
                        errors.push(-1);
                        error_obj.error = 'Date expression is missing'
                    }

                    /* TODO: not all records will have a begin date
                    if (record.mods.data.dates[i].begin === undefined || record.mods.data.dates[i].begin.length === 0) {
                        errors.push(-1);
                        error_obj.error = 'Date begin is missing'
                    }
                     */
                }
            }

            // TODO: make available after archivesspace plugin is updated
            /*
            if (record.mods.data.parts === undefined || record.mods.data.parts.length === 0) {
                errors.push(-1);
                error_obj.error = 'Parts is missing'
            } else {

                for (let i=0;i<record.mods.data.parts.length;i++) {

                    if (record.mods.data.parts[i].type === null || record.mods.data.parts[i].type.length === 0) {
                        errors.push(-1);
                        error_obj.error = 'Mime-type is missing (' + record.mods.data.parts[i].title + ')';
                    }
                }
            }
             */

            if (errors.length > 0) {
                errors = [];
                error_obj.uri = uri_str;
                errors.push(error_obj);
            }

            ARCHIVESSPACE.destroy_session_token(obj.session, function(result) {
                callback({
                    status: 200,
                    data: errors
                });
            });
        });
    });
};

/**
 * moves folder from ready to ingest folder
 * @param req
 * @param callback
 */
exports.move_to_ingest = function (req, callback) {

    let pid = req.query.pid;
    let folder = req.query.folder;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/move-to-ingest?pid=' + pid + '&folder=' + folder + '&api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            /* TODO
            let response = await HTTP.get(qaUrl, {
                httpAgent: new KA.Agent({
                    keepAlive: true,
                    maxSockets: 1,
                    keepAliveMsecs: 3000
                }),
                // timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

             */

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
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
                    status: 404,
                    data: []
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (move_to_ingest)] request to QA server failed - ' + error);
            return false;
        }

    })();
};

/**
 * moves packages to Archivematica sftp server
 * @param req
 * @param callback
 */
exports.move_to_sftp = function (req, callback) {

    let pid = req.query.pid;
    let folder = req.query.folder;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/move-to-sftp?pid=' + pid + '&folder=' + folder + '&api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                LOGGER.module().info('INFO: [/qa/service module (move_to_sftp)] Uploading to sftp');
                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (move_to_sftp)] request to QA server failed - ' + error);
            return false;
        }

    })();

    callback({
        status: 200,
        message: 'Uploading packages to sftp.',
        data: []
    });
};

/**
 * Checks sftp upload status
 * @param req
 * @param callback
 */
exports.upload_status = function (req, callback) {

    let pid = req.query.pid;
    let total_batch_file_count = req.query.total_batch_file_count;
    let qaUrl = CONFIG.qaUrl + '/api/v1/qa/upload-status?pid=' + pid + '&total_batch_file_count=' + total_batch_file_count + '&api_key=' + CONFIG.qaApiKey;

    (async () => {

        try {

            let response = await HTTP.get(qaUrl, {
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

                callback({
                    status: 200,
                    message: 'Checking sftp upload status.',
                    data: response.data
                });

                return false;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/qa/service module (upload_status)] request to QA server failed - ' + error);
            return false;
        }

    })();
};