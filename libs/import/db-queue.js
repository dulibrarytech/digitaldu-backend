'use strict';

const config = require('../../config/config'),
    knexQ = require('knex')({
    client: 'mysql2',
    connection: {
        host: config.dbQueueHost,
        user: config.dbQueueUser,
        password: config.dbQueuePassword,
        database: config.dbQueueName
    }
});

exports.save = function (obj, callback) {

    let chunkSize = obj.data.length;
    knexQ.batchInsert(obj.table, obj.data, chunkSize)
        .then(function (data) {
            // TODO:...
            callback('done');
            // Start processing XML
            // process_duracloud_queue_xml(sip_uuid);
        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
};

/**
 *
 * @param obj
 */
exports.update = function (obj) {

    knexQ(obj.table)
        .where(obj.where)
        .update(obj.update)
        .then(obj.callback)
        .catch(function (error) {
            // TODO: log
            console.log(error);
            throw error;
        });
};