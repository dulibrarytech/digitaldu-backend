const config = require('../../config/config'),
    archivematica = require('../../libs/archivematica'),
    queue = require('../../libs/import/db-queue'),
    logger = require('../../libs/log4'),
    knexQ = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbQueueHost,
            user: config.dbQueueUser,
            password: config.dbQueuePassword,
            database: config.dbQueueName
        }
    }),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    }),
    QUEUE = 'tbl_archivematica_queue',
    IMPORT_QUEUE = 'tbl_duracloud_import_queue',
    REPO_OBJECTS = 'tbl_objects';

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

    // Save import objects to transfer queue
    let chunkSize = importObjects.length;
    knexQ.batchInsert(QUEUE, importObjects, chunkSize)
        .then(function (data) {

            let obj = {};
            obj.message = 'Data saved.';
            obj.recordCount = chunkSize;

            if (data.length === 0) {
                obj.message = 'Data not saved.';
                logger.module().fatal('FATAL: unable to save queue data (save_transfer_records)');
                throw 'FATAL: unable to save queue data (save_transfer_records)';
            }

            callback(obj);
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: unable to save queue data (save_transfer_records)');
            throw 'FATAL: unable to save queue data (save_transfer_records) ' + error;
        });
};

/**
 *
 * @param obj
 * @param callback
 */
exports.start_transfer = function (obj, callback) {

    'use strict';

    // Get one transfer queue record
    knexQ(QUEUE)
        .select('id', 'is_member_of_collection', 'object')
        .where({
            is_member_of_collection: obj.collection,
            message: 'WAITING_FOR_TRANSFER',
            transfer_status: 0
        })
        .orderBy('created', 'asc')
        .limit(1)
        .then(function (data) {

            if (data.length === 0) {
                logger.module().info('INFO: transfers complete (start transfer)');
                callback('done');
                return false;
            }

            let object = data.pop();

            let transferStartedObj = {
                table: QUEUE,
                where: {
                    id: object.id,
                    transfer_status: 0
                },
                update: {
                    message: 'TRANSFER_STARTED',
                    microservice: 'Starting transfer microservice'
                },
                callback: function (data) {
                    if (data !== 1) {
                        logger.module().fatal('FATAL: database transfer queue error (start transfer)');
                        throw 'Database transfer queue error';
                    }

                    callback(object);
                }
            };

            // Update queue. Indicate to user that the transfer has started.
            queue.update(transferStartedObj);
        })
        .catch(function (error) {
            logger.module().error('FATAL: database transfer queue error (start transfer) ' + error );
            throw 'FATAL: database transfer queue error (start transfer) ' + error ;
        });
};

/**
 *
 * @param response
 */
exports.confirm_transfer = function (response, id) {

    'use strict';

    // Handle error response
    if (response.error !== undefined && response.error === true) {

        let transferFailedObj = {
            table: QUEUE,
            where: {
                id: id,
                transfer_status: 0
            },
            update: {
                message: 'TRANSFER_FAILED',
                microservice: 'Transfer microservice',
                transfer_status: 1
            },
            callback: function (data) {
                if (data !== 1) {
                    // TODO: log update error
                    logger.module().fatal('FATAL: database transfer queue error (confirm_transfer)');
                    throw 'FATAL: database transfer queue error (confirm_transfer)';
                }
            }
        };

        // Update queue. Indicate to user that the transfer has failed.
        queue.update(transferFailedObj);

        return false;
    }

    if (typeof response === 'object') {
        return false;
    }

    var json = JSON.parse(response);

    // Handle transfer failure
    if (json.message !== 'Copy successful.') {

        let transferFailedObj = {
            table: QUEUE,
            where: {
                id: id,
                transfer_status: 0
            },
            update: {
                message: 'TRANSFER_FAILED',
                microservice: 'Transfer microservice',
                transfer_status: 1
            },
            callback: function (data) {
                if (data !== 1) {
                    // TODO: log update error
                    console.log(data);
                    throw 'Database start transfer queue error';
                }
            }
        };

        // Update queue. Indicate to user that the transfer has failed.
        queue.update(transferFailedObj);
        return false;
    }

    // Construct transfer folder from successful transfer
    let path = json.path;
    let pathArr = path.split('/');

    let arr = pathArr.filter(function (result) {
        if (result.length !== 0) {
            return result;
        }
    });

    // Used to approve transfer
    let transferFolder = arr.pop();

    let transferCompleteObj = {
        table: QUEUE,
        where: {
            id: id,
            transfer_status: 0
        },
        update: {
            message: 'COPY_SUCCESSFUL',
            transfer_folder: transferFolder,
            microservice: json.message,
            transfer_status: 1
        },
        callback: function (data) {
            if (data !== 1) {
                // TODO: log update error
                console.log(data);
                throw 'Database start transfer queue error';
            }
        }
    };

    // Update queue. Indicate to user that the transfer has failed.
    queue.update(transferCompleteObj);
};

/**
 *
 * @param obj
 * @param callback
 */
exports.get_transferred_record = function (collection, callback) {

    'use strict';

    // Get one transfer queue record
    knexQ(QUEUE)
        .select('id', 'is_member_of_collection', 'transfer_folder')
        .where({
            is_member_of_collection: collection,
            message: 'COPY_SUCCESSFUL',
            transfer_status: 1,
            approval_status: 0
        })
        .limit(1)
        .then(function (data) {

            if (data.length === 0) {
                console.log('Transfers approved.');
                callback('done');
                return false;
            }

            let object = data.pop();
            callback(object);
        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
};

/**
 *
 * @param response
 * @param object
 * @param callback
 * @returns {boolean}
 */
exports.confirm_transfer_approval = function (response, object, callback) {

    'use strict';

    if (typeof response === 'object') {
        logger.module().error('ERROR: unable to approve transfer (confirm_transfer_approval)');
        return false;
    }

    var json;

    try {
        json = JSON.parse(response);
    } catch (e) {
        logger.module().error('ERROR: unable to parse confirmation response (confirm_transfer_approval)');
        return false;
    }

    if (json.message === 'Approval successful.') {

        let transferApprovedObj = {
            table: QUEUE,
            where: {
                id: object.id,
                transfer_status: 1,
                approval_status: 0
            },
            update: {
                transfer_uuid: json.uuid,
                message: 'TRANSFER_APPROVED',
                approval_status: 1
            },
            callback: function (data) {

                if (data !== 1) {
                    logger.module().error('ERROR: unable to update database queue (confirm_transfer_approval)');
                    return false;
                }
            }
        };

        // Update queue and indicate that the transfer has been approved
        queue.update(transferApprovedObj);

        callback({
            is_member_of_collection: object.is_member_of_collection,
            transfer_uuid: json.uuid
        });

        return false;
    }
};

/**
 *
 * @param response
 * @param transfer_uuid
 * @param callback
 * @returns {boolean}
 */
exports.update_transfer_status = function (response, callback) {

    'use strict';

    if (typeof response === 'object') {
        return false;
    }

    var json = JSON.parse(response);

    if (json.status === 'COMPLETE' && json.sip_uuid !== undefined) {

        knexQ(QUEUE)
            .count('sip_uuid as count')
            .where({
                sip_uuid: json.sip_uuid,
                message: 'TRANSFER_COMPLETE'
            })
            .then(function (result) {

                if (result[0].count === 0) {

                    let transferCompleteObj = {
                        table: QUEUE,
                        where: {
                            transfer_uuid: json.uuid,
                            approval_status: 1
                        },
                        update: {
                            sip_uuid: json.sip_uuid,
                            message: 'TRANSFER_COMPLETE',
                            microservice: json.microservice
                        },
                        callback: function (data) {

                            if (data !== 1) {
                                logger.module().error('ERROR: updated more than one record in database queue (update_transfer_status)');
                                throw 'ERROR: updated more than one record in database queue (update_transfer_status)';
                            }

                        }
                    };

                    // Flag transfer as COMPLETE in queue
                    queue.update(transferCompleteObj);

                    callback({
                        complete: true,
                        sip_uuid: json.sip_uuid
                    });
                }
            })
            .catch(function (error) {
                logger.module().error('ERROR: database queue error (update_transfer_status) ' + error);
                throw 'ERROR: database queue error (update_transfer_status) ' + error;
            });

        return false;
    }

    if (json.status === 'PROCESSING') {

        let transferProcessingObj = {
            table: QUEUE,
            where: {
                transfer_uuid: json.uuid,
                approval_status: 1
            },
            update: {
                message: json.status,
                microservice: json.microservice
            },
            callback: function (data) {

                if (data !== 1) {
                    logger.module().error('ERROR: database queue error (update_transfer_status)');
                    throw 'ERROR: database queue error (update_transfer_status)';
                }
            }
        };

        // Update transfer status
        queue.update(transferProcessingObj);

        callback({
            complete: false,
            status: json.status
        });

        return false;
    }
};

/**
 *
 * @param response
 * @param sip_uuid
 * @param callback
 * @returns {boolean}
 */
exports.update_ingest_status = function (response, sip_uuid, callback) {

    'use strict';

    if (typeof response === 'object') {
        return false;
    }

    var json = JSON.parse(response);

    if (json.status === 'COMPLETE') {

        let importCompleteQueue = {
            table: QUEUE,
            where: {
                sip_uuid: json.uuid,
                transfer_status: 1,
                approval_status: 1,
                ingest_status: 0
            },
            update: {
                message: 'INGEST_COMPLETE',
                microservice: json.microservice,
                ingest_status: 1
            },
            callback: function (data) {

                if (data !== 1) {
                    logger.module().error('ERROR: database queue error (update_ingest_status) ' + json.status);
                    throw 'ERROR: database queue error (update_ingest_status)';
                }
            }
        };

        queue.update(importCompleteQueue);

        callback({
            complete: true,
            sip_uuid: sip_uuid
        });

        return false;
    }

    if (json.status === 'FAILED' || json.status === 'REJECTED' || json.status === 'USER_INPUT') {

        let importFailed = {
            table: QUEUE,
            where: {
                sip_uuid: json.uuid,
                ingest_status: 0
            },
            update: {
                message: json.status,
                microservice: json.microservice,
                ingest_status: 1
            },
            callback: function (data) {

                if (data !== 1) {
                    logger.module().error('ERROR: database queue error (update_ingest_status) ' + json.status);
                    throw 'ERROR: database queue error (update_ingest_status)';
                }
            }
        };

        queue.update(importFailed);

        callback({
            error: true,
            message: json.status
        });

        return false;
    }

    if (json.status === 'PROCESSING') {

        let importProcessing = {
            table: QUEUE,
            where: {
                sip_uuid: json.uuid,
                transfer_status: 1,
                approval_status: 1,
                ingest_status: 0
            },
            update: {
                message: json.status,
                microservice: json.microservice
            },
            callback: function (data) {

                if (data !== 1) {
                    logger.module().error('ERROR: database queue error (update_ingest_status) ' + json.status);
                    throw 'ERROR: database queue error (update_ingest_status)';
                }
            }
        };

        queue.update(importProcessing);

        callback({
            complete: false,
            sip_uuid: json.uuid
        });

    }
};

/**
 *
 * @param obj
 * @param callback
 * @returns {boolean}
 */
exports.save_mets_data = function (obj, callback) {

    'use strict';

    knexQ(IMPORT_QUEUE)
        .count('sip_uuid as count')
        .where({
            sip_uuid: obj[0].sip_uuid
        })
        .then(function (result) {

            if (result[0].count !== 2) {

                knexQ(IMPORT_QUEUE)
                    .insert(obj)
                    .then(function (data) {
                        console.log('METS saved: ', data);
                        callback('done');
                    })
                    .catch(function (error) {
                        logger.module().error('ERROR: unable to save mets (save_mets_data) ' + error);
                        throw 'ERROR: unable to save mets (save_mets_data) ' + error;
                    });

                /*
                let chunkSize = obj.length;
                knexQ.batchInsert(IMPORT_QUEUE, obj, chunkSize)
                    .then(function (data) {

                        console.log('METS saved: ', data);
                        callback('done');
                    })
                    .catch(function (error) {
                        console.log(error);
                        throw error;
                    });
                    */
            }
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to save mets (save_mets_data) ' + error);
            throw 'ERROR: unable to save mets (save_mets_data) ' + error;
        });

    return false;
};

/**
 *
 * @param sip_uuid
 * @param callback
 */
exports.get_uri_txt = function (sip_uuid, callback) {

    'use strict';

    knexQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'txt',
            status: 0
        })
        .limit(1)
        .then(function (data) {
            callback(data);
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to get uri txt file (get_uri_txt) ' + error);
            throw 'ERROR: unable to get uri txt file (get_uri_txt) ' + error;
        });
};

/**
 *
 * @param sip_uuid
 * @param callback
 */
exports.get_collection = function (sip_uuid, callback) {

    'use strict';

    knexQ(QUEUE)
        .select('is_member_of_collection')
        .where({
            sip_uuid: sip_uuid
        })
        .then(function (data) {
            callback(data[0].is_member_of_collection.replace('_', ':'));
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to get collection (get_collection) ' + error);
            throw 'ERROR: unable to get collection (get_collection) ' + error;
        });
};

/**
 *
 * @param mods_id
 * @param sip_uuid
 * @param callback
 */
exports.save_mods_id = function (mods_id, sip_uuid, callback) {

    'use strict';

    let importProcessing = {
        table: IMPORT_QUEUE,
        where: {
            sip_uuid: sip_uuid,
            file_id: 'uri'
        },
        update: {
            file_id: mods_id
        },
        callback: function (data) {

            if (data !== 1) {
                logger.module().error('ERROR: unable to save mods id (save_mods_id)');
                throw 'ERROR: unable to save mods id (save_mods_id)';
            }

            callback(true);
        }
    };

    queue.update(importProcessing);
};

/**
 *
 * @param sip_uuid
 * @param callback
 */
exports.get_object = function (sip_uuid, callback) {

    'use strict';

    knexQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'object',
            status: 0
        })
        .limit(1)
        .then(function (data) {
            callback(data);
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to get object (get_object) ' + error);
            throw 'ERROR: unable to get object (get_object) ' + error;
        });

};

/**
 *
 * @param obj
 * @param callback
 */
exports.create_repo_record = function (obj, callback) {

    'use strict';

    delete obj.session;
    delete obj.dip_path;
    delete obj.file;
    delete obj.uuid;

    knex(REPO_OBJECTS)
        .insert(obj)
        .then(function (data) {
            callback(true);
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to create repo record (create_repo_record) ' + error);
            throw 'ERROR: unable to create repo record (create_repo_record) ' + error;
        });
};

exports.cleanup = function (obj, callback) {

    'use strict';

    knexQ(QUEUE)
        .where({
            sip_uuid: obj.sip_uuid
        })
        .del()
        .then(function (data) {

            knexQ(IMPORT_QUEUE)
                .where({
                    sip_uuid: obj.sip_uuid
                })
                .del()
                .then(function (data) {
                    callback(true);
                })
                .catch(function (error) {
                    logger.module().error('ERROR: unable to clean up queue (cleanup) ' + error);
                    throw 'ERROR: unable to clean up queue (cleanup) ' + error;
                });

            return null;
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to clean up queue (cleanup) ' + error);
            throw 'ERROR: unable to clean up queue (cleanup) ' + error;
        });
};