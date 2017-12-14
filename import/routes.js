'use strict';

var Import = require('../import/controller');
    // Token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/import')
        .post(Import.import);  // Token.verify,
};