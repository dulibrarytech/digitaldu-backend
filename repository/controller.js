'use strict';

var Repo = require('../repository/model');

/* gets objects by is_member_of_collection pid */
exports.get_objects = function (req, res) {
    Repo.get_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets single object */
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

/*
exports.update_collection = function (req, res) {
    Repo.update_collection(req, function (data) {
        res.status(data.status).send(data);
    });
};
*/

/* search
exports.do_search = function (req, res) {
    Repo.do_search(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
 */