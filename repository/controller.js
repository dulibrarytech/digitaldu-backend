'use strict';

var Repo = require('../repository/model');

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

/* imports object(s) for administrators */
exports.get_import_admin_objects = function (req, res) {
    Repo.get_import_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_next_pid = function (req, res) {
    Repo.get_next_pid(req, function (data) {
        res.status(data.status).send(data.data);
    });
};



/* search
exports.do_search = function (req, res) {
    Repo.do_search(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
 */