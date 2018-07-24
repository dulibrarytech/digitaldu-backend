'use strict';

/* home page */
exports.get_dashboard_home = function (req, res) {
    res.render('dashboard-home', {});
};

/* root collections page */
exports.get_dashboard_collections = function (req, res) {

    res.render('dashboard-collections', {});
};

exports.get_dashboard_objects = function (req, res) {
    res.render('dashboard-objects', {});
};

exports.edit_dashboard_object = function (req, res) {
    res.render('dashboard-edit-object', {});
};

exports.get_dashboard_object_detail = function (req, res) {
    res.render('dashboard-object-detail', {
        pid: req.query.pid
    });
};

exports.get_dashboard_import = function (req, res) {
    res.render('dashboard-import', {});
};

exports.get_dashboard_import_files = function (req, res) {
    res.render('dashboard-import-files', {});
};

exports.get_dashboard_import_batch = function (req, res) {
    res.render('dashboard-import-batch', {});
};

exports.get_dashboard_users = function (req, res) {
    res.render('dashboard-users', {});
};

exports.get_dashboard_user_detail = function (req, res) {
    res.render('dashboard-users-detail', {});
};

exports.get_dashboard_groups = function (req, res) {
    res.render('dashboard-groups', {});
};

exports.get_dashboard_search = function (req, res) {
    res.render('dashboard-search-results', {});
};

exports.get_dashboard_metadata = function (req, res) {
    res.render('dashboard-edit-metadata', {});
};