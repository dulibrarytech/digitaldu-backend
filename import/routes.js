'use strict';

var Import = require('../import/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    app.route('/api/admin/v1/import/list')
        .get(Import.list);

    app.route('/api/admin/v1/import/start_transfer')
        .post(Import.start_transfer);

    app.route('/api/admin/v1/import/transfer_status')
        .get(Import.get_transfer_status);

    app.route('/api/admin/v1/import/ingest_status')
        .get(Import.get_ingest_status);

    /*
    app.route('/api/admin/v1/import')
        .get(Import.get_import_admin_objects);

    */

    /*
     app.route('/api/admin/v1/import/unapproved_transfers')
     .get(Import.get_unapproved_transfers);
     */

    /*
    app.route('/api/admin/v1/import/files')
        .get(Import.get_import_admin_object_files);
    */

    /*
    app.route('/api/admin/v1/import/upload')
        .post(Import.upload);
    */

    // NOT USED
    /*
    app.route('/api/admin/v1/import/create-folder')
        .post(Import.create_folder);

    */
};