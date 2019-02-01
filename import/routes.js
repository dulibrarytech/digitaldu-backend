'use strict';

var Import = require('../import/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    app.route('/api/admin/v1/import/list')
        .get(Import.list);

    app.route('/api/admin/v1/import/queue_objects')
        .post(Import.queue_objects);

    app.route('/api/admin/v1/import/start_transfer')
        .post(Import.start_transfer);

    app.route('/api/admin/v1/import/approve_transfer')
        .post(Import.approve_transfer);

    app.route('/api/admin/v1/import/transfer_status')
        .get(Import.get_transfer_status);

    app.route('/api/admin/v1/import/ingest_status')
        .get(Import.get_ingest_status);

    app.route('/api/admin/v1/import/import_dip')
        .get(Import.import_dip);

    app.route('/api/admin/v1/import/create_repo_record')
        .get(Import.create_repo_record);

    app.route('/api/admin/v1/import/status')
        .get(Import.get_import_status);

    /*
    app.route('/api/admin/v1/import/queue')
        .post(Import.start_queue);
    */
};