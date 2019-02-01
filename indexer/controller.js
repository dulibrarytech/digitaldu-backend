'use strict';

var Indexer = require('../indexer/model');

exports.index_record = function (req, res) {
    Indexer.index_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_data = function (req, res) {
    Indexer.index_data(req, function (data) {
        res.status(data.status).send(data);
    });
};