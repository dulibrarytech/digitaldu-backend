'use strict';

var Import = require('../import/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    app.route('/api/admin/v1/import')
        .get(Import.get_import_admin_objects);

    app.route('/api/admin/v1/import/files')
        .get(Import.get_import_admin_object_files);

};