'use strict';

var Repo = require('../repository/model'),
    Service = require('../repository/service');

/* gets objects by is_member_of_collection pid for discovery layer */
exports.get_objects = function (req, res) {
    Repo.get_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets single object for discovery layer */
exports.get_object = function (req, res) {
    Repo.get_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets objects for administrators */
exports.get_admin_objects = function (req, res) {
    Repo.get_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets single administrator object */
exports.get_admin_object = function (req, res) {
    Repo.get_admin_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.save_admin_collection_object = function (req, res) {
    Repo.save_admin_collection_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_thumbnail = function (req, res) {
    Repo.update_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_metadata_cron = function (req, res) {
    Repo.update_metadata_cron(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* imports object(s) for administrators */
exports.get_import_admin_objects = function (req, res) {
    Repo.get_import_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

// DEPRECATED
/*
exports.get_next_pid = function (req, res) {
    Repo.get_next_pid(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
*/

exports.publish_object = function (req, res) {
    Repo.publish_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_object_download = function (req, res) {
    Repo.get_object_download(req, function (data) {

        if (data.file === undefined) {
            res.status(data.status).send(data);
            return false;
        }

        res.set('Content-Type', data.content_type);
        res.download(data.file);
    });
};

exports.ping = function (req, res) {
    Service.ping_services(req, function (data) {
        res.status(data.status).send(data.data);
    });
};