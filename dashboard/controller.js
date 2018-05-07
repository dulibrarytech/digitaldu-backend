'use strict';

// var Repo = require('../dashboard/model');

exports.get_dashboard_home = function (req, res) {

    res.render('dashboard-home', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

/* communities */
exports.get_dashboard_communities = function (req, res) {

    res.render('dashboard-communities', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

exports.edit_dashboard_community = function (req, res) {

    res.render('dashboard-edit-community', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

/* collections */
exports.get_dashboard_collections = function (req, res) {

    res.render('dashboard-collections', {
        // message: 'Authentication Failed. Please try again.',
        // username: req.body.username
    });
};

exports.edit_dashboard_collection = function (req, res) {

    res.render('dashboard-edit-collection', {
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

exports.get_dashboard_object_detail = function (req, res) {

    res.render('dashboard-object-detail', {
        pid: req.query.pid
    });
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