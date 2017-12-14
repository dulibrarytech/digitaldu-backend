'use strict';

var Repo = require('../repository/model');

exports.get_collections = function (req, res) {
    Repo.get_collections(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_object = function (req, res) {
    Repo.get_object(req, function (data) {

        if (data.mime_type['Content-Type'] !== undefined && data.mime_type['Content-Type'] === 'application/json') {
            res.status(data.status).json(data.data);
        } else {
            res.writeHead(data.status, data.mime_type);
            res.end(data.data, 'binary');
        }
    });
};