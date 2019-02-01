const config = require('../../config/config'),
    queue = require('../../libs/import/db-queue'),
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    }),
    IMPORT_QUEUE = 'tbl_duracloud_import_queue';

/**
 * Saves transfer object data to db
 * @param transfer_data
 * @param callback
 */
exports.save_transfer_records = function (transfer_data, callback) {

    'use strict';

    let collection = transfer_data.collection,
        objects = transfer_data.objects.split(','),
        user = transfer_data.user;

    // Create array of objects. Each object contains the collection PID and object filename
    let importObjects = objects.map(function (object) {

        return {
            is_member_of_collection: collection,
            object: object,
            transfer_uuid: '---',
            message: 'WAITING_FOR_TRANSFER',
            microservice: 'Waiting for transfer microservice',
            user: user
        };

    });

    // TODO: move to db-queue lib
    // Save import objects to transfer queue
    let chunkSize = importObjects.length;
    knexQ.batchInsert(QUEUE, importObjects, chunkSize)
        .then(function (data) {

            let obj = {};
            obj.message = 'Data saved.';
            obj.recordCount = chunkSize;

            if (data.length === 0) {
                obj.message = 'Data not saved.';
            }

            callback(obj);
        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
};
