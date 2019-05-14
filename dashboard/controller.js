'use strict';

const config = require('../config/config'),
    Service = require('../dashboard/service');

exports.ping = function (req, res) {
    Service.ping_services(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* home page */
exports.get_dashboard_home = function (req, res) {
    res.render('dashboard-home', {
        host: config.host
    });
};

/* root collections page */
exports.get_dashboard_collections = function (req, res) {
    res.render('dashboard-collections', {
        host: config.host
    });
};

exports.get_dashboard_collection_add_form = function (req, res) {
    res.render('dashboard-add-collection', {
        host: config.host
    });
};

exports.get_dashboard_objects = function (req, res) {
    res.render('dashboard-objects', {
        host: config.host
    });
};

exports.get_dashboard_download = function (req, res) {
    res.render('dashboard-download', {
        host: config.host
    });
};

exports.edit_dashboard_object = function (req, res) {
    res.render('dashboard-edit-object', {
        host: config.host
    });
};

exports.get_dashboard_object_detail = function (req, res) {
    res.render('dashboard-object-detail', {
        host: config.host,
        pid: req.query.pid
    });
};

exports.get_dashboard_import = function (req, res) {
    res.render('dashboard-import', {
        host: config.host
    });
};

exports.get_dashboard_import_files = function (req, res) {
    res.render('dashboard-import-files', {
        host: config.host
    });
};

exports.get_dashboard_import_status = function (req, res) {
    res.render('dashboard-import-status', {
        host: config.host
    });
};

exports.get_dashboard_import_incomplete = function (req, res) {
    res.render('dashboard-import-incomplete', {
        host: config.host
    });
};

exports.get_dashboard_users = function (req, res) {
    res.render('dashboard-users', {
        host: config.host
    });
};

exports.get_dashboard_user_detail = function (req, res) {
    res.render('dashboard-users-detail', {
        host: config.host
    });
};

exports.get_dashboard_user_add_form = function (req, res) {
    res.render('dashboard-add-user', {
        host: config.host
    });
};

exports.get_dashboard_user_edit_form = function (req, res) {
    res.render('dashboard-edit-user', {
        host: config.host
    });
};

exports.get_dashboard_search = function (req, res) {
    res.render('dashboard-search-results', {
        host: config.host
    });
};

exports.get_dashboard_metadata = function (req, res) {
    res.render('dashboard-edit-metadata', {
        host: config.host
    });
};

exports.get_dashboard_error = function (req, res) {
    res.render('error', {
        host: config.host
    });
};