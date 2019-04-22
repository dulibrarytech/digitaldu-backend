'use strict';

var Stats = require('../stats/model');

exports.get_stats = function (req, res) {
    Stats.get_stats(req, function (data) {
        res.status(data.status).send(data.data);
    });
};