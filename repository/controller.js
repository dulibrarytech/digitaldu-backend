'use strict';

var Repo = require('../repository/model'),
    fs = require('fs');

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

exports.update_admin_collection_object = function (req, res) {
    Repo.update_admin_collection_object(req, function (data) {
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

exports.get_repo_object = function (req, res) {
    Repo.get_repo_object(req, function (result) {
        // res.setHeader('Content-Length', result.stat.size);
        res.setHeader('Content-Disposition', 'inline; filename=' + result.filename);
        res.setHeader('Content-Type', 'application/pdf');
        //console.log(result.pdf);
        //res.send(result.pdf);

        res.writeHead(200, {
            'Content-Type': "application/octet-stream",
            'Content-Disposition': "attachment; filename=" + result.filename
        });

        fs.createReadStream(result.pdf).pipe(res);

        /*
        result.pdf.on('open', function () {
            result.pdf.pipe(res);
        });
        */

    });
};

/* search
exports.do_search = function (req, res) {
    Repo.do_search(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
 */