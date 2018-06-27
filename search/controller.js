'use strict';

var Stats = require('../stats/model');

exports.get_collection_count = function (req, res) {
    Stats.get_collection_count(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_object_count = function (req, res) {
    Stats.get_object_count(req, function (data) {
        res.status(data.status).send(data.data);
    });
};
