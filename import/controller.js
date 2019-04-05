'use strict';

var Import = require('../import/queue'),
    Model = require('../import/model');

exports.list = function (req, res) {
    Import.list(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.queue_objects = function (req, res) {
    Import.queue_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.start_transfer = function (req, res) {
    Import.start_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.approve_transfer = function (req, res) {
    Import.approve_transfer(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_transfer_status = function (req, res) {
    Import.get_transfer_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_status = function (req, res) {
    Import.get_import_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_ingest_status = function (req, res) {
    Import.get_ingest_status(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_dip = function (req, res) {
    Import.import_dip(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_repo_record = function (req, res) {
    Import.create_repo_record(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_incomplete = function (req, res) {
    Model.get_import_incomplete(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods = function (req, res) {
    Model.import_mods(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_mods_id = function (req, res) {
    Model.import_mods_id(req, function (data) {
        res.status(data.status).send(data.data);
    });
};