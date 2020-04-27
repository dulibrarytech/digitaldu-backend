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

exports.get_dashboard_home = function (req, res) {
    res.render('dashboard-home', {
        host: CONFIG.host
    });
};

exports.get_dashboard_collections = function (req, res) {
    res.render('dashboard-collections', {
        host: CONFIG.host
    });
};

exports.get_dashboard_collection_add_form = function (req, res) {
    res.render('dashboard-add-collection', {
        host: CONFIG.host
    });
};

exports.get_dashboard_objects = function (req, res) {
    res.render('dashboard-objects', {
        host: CONFIG.host
    });
};

exports.get_dashboard_unpublished_objects = function (req, res) {
    res.render('dashboard-unpublished-objects', {
        host: CONFIG.host
    });
};

exports.update_dashboard_thumbnail = function (req, res) {
    res.render('dashboard-update-thumbnail', {
        host: CONFIG.host
    });
};

exports.get_dashboard_object_detail = function (req, res) {
    res.render('dashboard-object-detail', {
        host: CONFIG.host,
        pid: req.query.pid
    });
};

exports.get_dashboard_import = function (req, res) {
    res.render('dashboard-import', {
        host: CONFIG.host
    });
};

exports.get_dashboard_import_files = function (req, res) {
    res.render('dashboard-import-files', {
        host: CONFIG.host
    });
};

exports.get_dashboard_import_status = function (req, res) {
    res.render('dashboard-import-status', {
        host: CONFIG.host
    });
};

exports.get_dashboard_import_incomplete = function (req, res) {
    res.render('dashboard-import-incomplete', {
        host: CONFIG.host
    });
};

exports.get_dashboard_import_complete = function (req, res) {
    res.render('dashboard-import-complete', {
        host: CONFIG.host
    });
};

exports.get_dashboard_users = function (req, res) {
    res.render('dashboard-users', {
        host: CONFIG.host
    });
};

exports.get_dashboard_user_detail = function (req, res) {
    res.render('dashboard-users-detail', {
        host: CONFIG.host
    });
};

exports.get_dashboard_user_add_form = function (req, res) {
    res.render('dashboard-add-user', {
        host: CONFIG.host
    });
};

exports.get_dashboard_user_edit_form = function (req, res) {
    res.render('dashboard-edit-user', {
        host: CONFIG.host
    });
};

exports.get_dashboard_search = function (req, res) {
    res.render('dashboard-search-results', {
        host: CONFIG.host
    });
};

exports.get_dashboard_metadata = function (req, res) {
    res.render('dashboard-edit-metadata', {
        host: CONFIG.host
    });
};

exports.get_dashboard_upload = function (req, res) {
    res.render('dashboard-upload', {
        host: CONFIG.host,
        message: '',
        error: ''
    });
};

exports.get_dashboard_error = function (req, res) {
    res.render('error', {
        host: CONFIG.host
    });
};