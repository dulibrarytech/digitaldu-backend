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
const WEB_SERVICES_CONFIG = require('../config/webservices_config')();
const TEMPLATE_CACHE = require('express-template-cache');

exports.get_dashboard_home = function (req, res) {
    res.render('dashboard-home', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_collection_add_form = function (req, res) {
    res.renderStatic('dashboard-add-collection', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_objects = function (req, res) {
    res.render('dashboard-objects', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_unpublished_objects = function (req, res) {
    res.render('dashboard-unpublished', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.delete_dashboard_object = function (req, res) {
    res.render('dashboard-delete', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.update_dashboard_thumbnail = function (req, res) {
    res.renderStatic('dashboard-update-thumbnail', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_import = function (req, res) {
    res.redirect(WEB_SERVICES_CONFIG.ingest_service + '/dashboard/ingest' + '?api_key=' + APP_CONFIG.api_key);
};

exports.get_dashboard_import_status = function (req, res) {
    res.redirect(WEB_SERVICES_CONFIG.ingest_service + '/dashboard/ingest/status' + '?api_key=' + APP_CONFIG.api_key);
};

exports.get_dashboard_import_complete = function (req, res) {
    res.render('dashboard-import-complete', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_users = function (req, res) {
    res.render('dashboard-users', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_user_detail = function (req, res) {
    res.render('dashboard-users-detail', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_user_add_form = function (req, res) {
    res.renderStatic('dashboard-add-user', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_user_edit_form = function (req, res) {
    res.render('dashboard-edit-user', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_user_delete_form = function (req, res) {
    res.render('dashboard-delete-user', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_search = function (req, res) {
    res.render('dashboard-objects', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_upload = function (req, res) {
    res.renderStatic('dashboard-upload', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization,
        message: '',
        error: ''
    });
};

exports.get_dashboard_qa = function (req, res) {
    res.render('dashboard-qa', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_transcript = function (req, res) {
    res.render('dashboard-transcript', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};

exports.get_dashboard_viewer = function (req, res) {
    res.render('dashboard-viewer', {
        host: APP_CONFIG.host,
        app_name: APP_CONFIG.app_name,
        app_version: APP_CONFIG.app_version,
        organization: APP_CONFIG.organization
    });
};
