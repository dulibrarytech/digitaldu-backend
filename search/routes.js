'use strict';

const Search = require('../search/controller');

module.exports = function (app) {

    app.route('/api/admin/v1/search')
        .get(Search.get_search_results);

};