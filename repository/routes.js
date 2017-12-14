'use strict';

var Repo = require('../repository/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    app.route('/collections')
        .get(Repo.get_collections);

    app.route('/object') // TODO: plural
        .get(Repo.get_object);

    // TODO: export route
};