'use strict';

var Import = require('../import/model');

exports.list = function (req, res) {
    Import.list(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.start_transfer = function (req, res) {
    Import.start_transfer(req, function (data) {
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

/*
exports.get_unapproved_transfers = function (req, res) {
    Import.get_unapproved_transfers(req, function (data) {
        res.status(data.status).send(data.data)
    });
};
*/

/* imports object(s) for administrators */
/*
exports.get_import_admin_objects = function (req, res) {
    Import.get_import_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_import_admin_object_files = function (req, res) {
    Import.get_import_admin_objects_files(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.import_xml = function (req, res) {
    Import.import_xml(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.upload = function (req, res) {
    Import.upload(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_folder = function (req, res) {
    Import.create_folder(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
    */