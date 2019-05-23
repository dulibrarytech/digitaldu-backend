'use strict';

const Indexer = require('../indexer/model'),
    Service = require('../indexer/service');

exports.index_record = function (req, res) {
    Indexer.get_index_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_records = function (req, res) {
    Indexer.index_records(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.index_data = function (req, res) {
    Indexer.index_data(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.create_repo_index = function (req, res) {
    Service.create_repo_index(req, function (data) {
        res.status(data.status).send(data);
    });
};