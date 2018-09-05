'use strict';

var Import = require('../import/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    app.route('/api/admin/v1/import')
        .get(Import.get_import_admin_objects)
        .post(Import.import_admin_objects);

    app.route('/api/admin/v1/import/files')
        .get(Import.get_import_admin_object_files);

    app.route('/api/admin/v1/import/list')
        .get(Import.list);

    app.route('/api/admin/v1/import/upload')
        .post(Import.upload);

    app.route('/api/admin/v1/import/create-folder')
        .post(Import.create_folder);

};