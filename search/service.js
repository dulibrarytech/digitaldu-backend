'use strict';

const config = require('../config/config'),
    es = require('elasticsearch'),
    client = new es.Client({
        host: config.elasticSearch
    });

/**
 * Full-text search
 * @param req
 * @param callback
 */
exports.get_search_results = function (req, callback) {

    let q = req.query.q;

    if (q.length === 0) {
        q = '*:*';
    }

    client.search({
        from: 0,
        size: 5000,
        index: config.elasticSearchIndex,
        q: q
    }).then(function (results) {
        callback({
            status: 200,
            message: 'Search results',
            data: results.hits
        });
    });
};