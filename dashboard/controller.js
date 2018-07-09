'use strict';

// var Repo = require('../dashboard/model');

/* home page */
exports.get_dashboard_home = function (req, res) {

    res.render('dashboard-home', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

/* root collections page */
exports.get_dashboard_collections = function (req, res) {

    res.render('dashboard-collections', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

exports.get_dashboard_objects = function (req, res) {

    res.render('dashboard-objects', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
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

exports.get_dashboard_users = function (req, res) {

    res.render('dashboard-users', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

exports.get_dashboard_search = function (req, res) {

    res.render('dashboard-search-results', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

exports.get_dashboard_metadata = function (req, res) {
    res.render('dashboard-edit-metadata', {});
};