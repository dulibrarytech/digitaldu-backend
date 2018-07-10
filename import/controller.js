'use strict';

var Import = require('../import/model');

/* imports object(s) for administrators */
exports.get_import_admin_objects = function (req, res) {
    Import.get_import_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};