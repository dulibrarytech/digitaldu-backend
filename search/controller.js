'use strict';

var Search = require('../search/service');

exports.get_search_results = function (req, res) {
    Search.get_search_results(req, function (data) {
        res.status(data.status).send(data.data);
    });
};