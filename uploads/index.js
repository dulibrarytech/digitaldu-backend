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
const APP_CONFIG = require('../config/app_config')();
const MULTER = require('multer');
const HTTP = require('../libs/http');
const LOGGER = require('../libs/log4');
const TOKEN = require('../libs/tokens');
const LIMIT = 500000; // ~500kb

module.exports = function (app) {

    const FILTER = function(req, file, callback) {

        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
            LOGGER.module().error('ERROR: Upload Failed. File is not .jpg');
            callback(null, false);
        }

        callback(null, true);
    };

    let storage = MULTER.diskStorage({
        destination: function (req, file, callback) {
            callback(null, CONFIG.tnUploadPath);
        },
        filename: function (req, file, callback) {
            let sip_uuid = req.body.sip_uuid;
            callback(null, sip_uuid + '.jpg');
        }
    });

    let upload = MULTER({ storage: storage, fileFilter: FILTER, limits: { fileSize: LIMIT} });

    app.post(`${APP_CONFIG.app_path}/tn/upload`, TOKEN.verify, upload.single('tn'), function (req, res) {

        let pid = req.body.sip_uuid;
        let message;
        let error = false;

        if (req.file === undefined) {
            error = true;
            message = 'Upload failed.';
            res.render('dashboard-upload', {
                host: CONFIG.host,
                appname: CONFIG.appName,
                organization: CONFIG.organization,
                appversion: CONFIG.appVersion,
                message: message,
                error: error
            });

            return false;
        }

        if (req.file.mimetype === undefined || req.file.mimetype !== 'image/jpeg') {
            error = true;
            message = 'Upload failed. Only .jpg files are accepted.';
            res.render('dashboard-upload', {
                host: CONFIG.host,
                appname: CONFIG.appName,
                organization: CONFIG.organization,
                appversion: CONFIG.appVersion,
                message: message,
                error: error
            });

            return false;
        }

        if (req.file.size === undefined || req.file.size > LIMIT) {
            error = true;
            message = 'Upload failed. The file is too big.';
            res.render('dashboard-upload', {
                host: CONFIG.host,
                appname: CONFIG.appName,
                organization: CONFIG.organization,
                appversion: CONFIG.appVersion,
                message: message,
                error: error
            });

            return false;
        }

        (async () => {

            let data = {
                'pid': pid,
                'thumbnail_url':  'https://' + req.headers.host + '/tn/' + pid + '.jpg'
            };

            let response = await HTTP.post({
                endpoint: `${APP_CONFIG.app_path}/api/admin/v1/repo/object/thumbnail`,
                data: data
            });

            if (response.error === true) {

                LOGGER.module().error('ERROR: [ Unable to update collection thumbnail.');

                res.render('dashboard-upload', {
                    host: CONFIG.host,
                    appname: CONFIG.appName,
                    organization: CONFIG.organization,
                    appversion: CONFIG.appVersion,
                    message: 'File was uploaded, but the record update failed.',
                    error: true
                });

                return false;

            } else {

                LOGGER.module().info('INFO: Thumbnail updated');

                res.render('dashboard-upload', {
                    host: CONFIG.host,
                    appname: CONFIG.appName,
                    organization: CONFIG.organization,
                    appversion: CONFIG.appVersion,
                    message: 'Thumbnail Updated.',
                    error: false
                });
            }

        })();
    });
};