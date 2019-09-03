/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslibdisplay = require('../libs/display-record'),
    metslib = require('../libs/mets'),
    importlib = require('../libs/transfer-ingest'),
    mimetypelib = require('../libs/mime-types'),
    manifestlib = require('../libs/manifest'),
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    duracloud = require('../libs/duracloud'),
    archivespace = require('../libs/archivespace'),
    logger = require('../libs/log4'),
    crypto = require('crypto'),
    async = require('async'),
    moment = require('moment'),
    socketclient = require('socket.io-client')(config.host),
    request = require('request'),
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
    TRANSFER_QUEUE = 'tbl_archivematica_queue',
    IMPORT_QUEUE = 'tbl_duracloud_queue',
    FAIL_QUEUE = 'tbl_fail_queue',
    TRANSFER_TIMER = config.transferTimer,                                  // Transfer status is broadcast every 3 sec.
    IMPORT_TIMER = config.importTimer,                                      // Import status is broadcast every 3 sec.
    INGEST_STATUS_TIMER = config.ingestStatusTimer,                         // Ingest status (object count) is broadcast every 20 sec.
    TRANSFER_APPROVAL_TIMER = config.transferApprovalTimer,                 // Transfer approval occurs 35 sec. after transfer  (Gives transfer process time to complete)
    TRANSFER_STATUS_CHECK_INTERVAL = config.transferStatusCheckInterval,    // Transfer status checks occur every 3 sec.
    INGEST_STATUS_CHECK_INTERVAL = config.ingestStatusCheckInterval;        // Ingest status checks begin 3 sec after the endpoint receives a request.

/**
 * Broadcasts current import record count
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(TRANSFER_QUEUE)
            .count('id as count')
            .then(function (data) {
                socketclient.emit('ingest_status', data);
            })
            .catch(function (error) {
                logger.module().error('ERROR: transfer queue database error');
                throw error;
            });

    }, INGEST_STATUS_TIMER);
});

/**
 * Broadcasts archivematica transfer/ingest status
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(TRANSFER_QUEUE)
            .select('*')
            .whereRaw('DATE(created) = CURRENT_DATE')
            .where({
                transfer_status: 1
            })
            .orderBy('created', 'asc')
            .then(function (data) {
                socketclient.emit('transfer_status', data);
            })
            .catch(function (error) {
                logger.module().error('ERROR: transfer queue database error');
                throw error;
            });

    }, TRANSFER_TIMER);
});

/**
 * Broadcasts duracloud import status
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(IMPORT_QUEUE)
            .select('sip_uuid', 'uuid', 'file', 'file_id', 'type', 'type', 'dip_path', 'mime_type', 'message', 'status', 'created')
            .whereRaw('DATE(created) = CURRENT_DATE')
            .orderBy('created', 'desc')
            .groupBy('sip_uuid')
            .then(function (data) {
                socketclient.emit('import_status', data);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/import/queue module (import status broadcasts)] import queue database error ' + error);
                throw 'FATAL: [/import/queue module (import status broadcasts)] import queue database error ' + error;
            });

    }, IMPORT_TIMER);
});

/**
 * Broadcasts import failures
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(FAIL_QUEUE)
            // .count('id as count')
            .select('*')
            // .whereRaw('DATE(created) = CURRENT_DATE')
            .orderBy('created', 'desc')
            .then(function (data) {
                socketclient.emit('fail_status', data);
            })
            .catch(function (error) {
                logger.module().fatal('FATAL: [/import/queue module (import failure broadcasts)] fail queue database error ' + error);
                throw 'FATAL: [/import/queue module (import failure broadcasts)] fail queue database error ' + error;
            });

    }, INGEST_STATUS_TIMER);
});

/**
 * Gets list of folders from Archivematica sftp server
 * @param req (query.collection)
 * @param callback
 */
exports.list = function (req, callback) {

    knexQ(TRANSFER_QUEUE)
        .count('id as count')
        .then(function (data) {

            if (data[0].count === 0) {

                let query = req.query.collection;

                archivematica.list(query, function (results) {

                    if (results.error !== undefined && results.error === true) {

                        logger.module().fatal('FATAL: [/import/queue module (list)] unable to get files from Archivematica SFTP server');

                        callback({
                            status: 400,
                            message: results.message
                        });

                        return false;
                    }

                    callback({
                        status: 200,
                        message: 'list',
                        data: {list: results}
                    });
                });

                return false;

            } else {

                callback({
                    status: 200,
                    message: 'import in progress',
                    data: {list: []}
                });

            }
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/import/queue module (list)] queue progress check failed ' + error);
            throw 'FATAL: [/import/queue module (list)] queue progress check failed ' + error;
        });
};

/**
 * Starts the Archivematica transfer process
 * NOTE: Ingest begins automatically after a successful transfer and approval
 * STEP 1
 * @param req (body.collection, body.objects, body.user)
 * @param callback
 */
exports.queue_objects = function (req, callback) {

    if (req.body === undefined) {

        logger.module().error('ERROR: [/import/queue module (queue_objects)] missing payload body. unable to start ingest process');

        callback({
            status: 404,
            message: 'Nothing to see here...',
            data: []
        });

        return false;
    }

    let transfer_data = req.body;

    const check_collection = function (callback) {

        importlib.check_collection(transfer_data.collection, function (result) {

            if (result === false) {
                transfer_data.collection_status = false;
                callback(null, transfer_data);
            } else {
                callback(null, transfer_data);
            }

        });
    };

    const start_transfer = function (obj, callback) {

        if (obj.collection_status !== undefined && obj.collection_status === false) {
            callback(null, obj);
            return false;
        }

        logger.module().info('INFO: [/import/queue module (queue_objects/start_transfer)] starting ingest process');

        importlib.save_transfer_records(transfer_data, function (result) {

            if (result.recordCount === 0) {
                // TODO: fail queue?
                return false;
            }

            request.post({
                url: config.apiUrl + '/api/admin/v1/import/start_transfer',
                form: {
                    'collection': transfer_data.collection
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().fatal('FATAL: [/import/queue module (queue_objects/start_transfer/importlib.save_transfer_records)] unable to begin transfer ' + error);
                    throw 'FATAL: [/import/queue module (queue_objects/start_transfer/importlib.save_transfer_records)] unable to begin transfer ' + error;
                }

                if (httpResponse.statusCode === 200) {
                    return false;
                } else {
                    logger.module().fatal('FATAL: [/import/queue module (queue_objects/start_transfer/importlib.save_transfer_records)] unable to begin transfer ' + httpResponse.statusCode + '/' + error);
                    throw 'FATAL: [/import/queue module (queue_objects/start_transfer/importlib.save_transfer_records)] unable to begin transfer ' + httpResponse.statusCode + '/' + error;
                }
            });

            return false;
        });
    };

    async.waterfall([
        check_collection,
        start_transfer
    ], function (error, obj) {

        if (error) {
            logger.module().error('ERROR: [/import/queue module (queue_objects/async.waterfall)] ' + error);
        }

        if (obj.collection_status !== undefined && obj.collection_status === false) {

            let failObj = {
                is_member_of_collection: obj.collection.replace('_', ':'),
                message: 'Unable to move forward with import due to incorrect collection pid.'
            };

            importlib.save_to_fail_queue(failObj);
        }

        logger.module().info('INFO: [/import/queue module (queue_objects/async.waterfall)] transfer records queued');

        return false;
    });

    callback({
        status: 200,
        message: 'Queuing objects.'
    });
};

/**
 * STEP 2
 * @param req
 * @param callback
 */
exports.start_transfer = function (req, callback) {

    logger.module().info('INFO: starting transfer (start_transfer)');

    let collection = req.body.collection;

    if (collection === undefined) {

        logger.module().fatal('FATAL: [/import/queue module (start_transfer)] collection undefined. unable to start transfer');

        let failObj = {
            is_member_of_collection: 'No collection',
            message: 'Collection undefined. unable to start transfer.'
        };

        importlib.save_to_fail_queue(failObj);

        callback({
            status: 400,
            message: 'Unable to start transfer.'
        });

        return false;
    }

    importlib.start_transfer(collection, function (object) {

        // Initiates file transfer on Archivematica service
        archivematica.start_tranfser(object, function (response) {

            if (response.error !== undefined && response.error === true) {

                logger.module().fatal('FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] transfer error ' + response);

                let failObj = {
                    is_member_of_collection: collection,
                    message: response
                };

                importlib.save_to_fail_queue(failObj);
                importlib.clear_queue_record({
                    is_member_of_collection: collection
                }, function (result) {

                    if (result === true) {
                        importlib.restart_import();
                    }

                });

                throw 'FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] transfer error ' + response;
            }

            importlib.confirm_transfer(response, object.id);

            setTimeout(function () {

                request.post({
                    url: config.apiUrl + '/api/admin/v1/import/approve_transfer',
                    form: {
                        'collection': collection
                    }
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().fatal('FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] http error. unable to approve transfer ' + error);
                        throw 'FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] http error. unable to approve transfer ' + error;
                    }

                    if (httpResponse.statusCode === 200) {
                        return false;
                    } else {
                        logger.module().fatal('FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] http error. unable to approve transfer ' + httpResponse.statusCode + '/' + body);
                        throw 'FATAL: [/import/queue module (start_transfer/importlib.start_transfer/archivematica.start_tranfser)] http error. unable to approve transfer ' + httpResponse.statusCode + '/' + body;
                    }
                });

            }, TRANSFER_APPROVAL_TIMER);
        });
    });

    callback({
        status: 200,
        message: 'Starting transfers.'
    });
};

/**
 * STEP 3
 * @param req
 * @param callback
 */
exports.approve_transfer = function (req, callback) {

    let collection = req.body.collection;

    if (collection === undefined) {

        logger.module().error('ERROR: [/import/queue module (approve_transfer)] collection undefined');

        callback({
            status: 400,
            message: 'Unable to start transfer.'
        });

        return false;
    }

    importlib.get_transferred_record(collection, function (object) {

        archivematica.approve_transfer(object.transfer_folder, function (response) {

            importlib.confirm_transfer_approval(response, object, function (result) {

                if (result.error !== undefined && result.error === true) {

                    logger.module().error('ERROR: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] unable to confirm transfer approval ' + result);

                    let failObj = {
                        is_member_of_collection: collection,
                        transfer_uuid: object.transfer_uuid,
                        message: 'Transfer not approved ' + object.transfer_folder
                    };

                    importlib.save_to_fail_queue(failObj);
                    importlib.clear_queue_record({
                        transfer_uuid: object.transfer_uuid
                    }, function (result) {
                        if (result === true) {
                            importlib.restart_import();
                        }
                    });

                    return false;
                }

                logger.module().info('INFO: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] transfer approved');

                request.get({
                    url: config.apiUrl + '/api/admin/v1/import/transfer_status?collection=' + result.is_member_of_collection + '&transfer_uuid=' + result.transfer_uuid
                }, function (error, httpResponse, body) {

                    if (error) {
                        logger.module().fatal('FATAL: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] http error ' + error);
                        throw 'FATAL: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] http error ' + error;
                    }

                    if (httpResponse.statusCode === 200) {
                        return false;
                    } else {
                        logger.module().fatal('FATAL: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] http error ' + httpResponse.statusCode + '/' + body);
                        throw 'FATAL: [/import/queue module (approve_transfer/importlib.get_transferred_record/archivematica.approve_transfer/importlib.confirm_transfer_approval)] http error ' + httpResponse.statusCode + '/' + body;
                    }
                });
            });
        });
    });

    callback({
        status: 200,
        message: 'Approving transfers.'
    });
};

/**
 * Checks transfer status and updates queue based on stage of transfer
 * STEP 4
 * @param req
 * @param callback
 */
exports.get_transfer_status = function (req, callback) {

    var is_member_of_collection = req.query.collection,
        transfer_uuid = req.query.transfer_uuid;

    if (is_member_of_collection === undefined || transfer_uuid === undefined) {
        logger.module().error('ERROR: [/import/queue module (get_transfer_status)] unable to start transfer checks');
        callback({
            status: 400,
            message: 'Unable to start transfer checks.'
        });

        return false;
    }

    logger.module().info('INFO: [/import/queue module (get_transfer_status)] checking transfer status');

    let timer = setInterval(function () {

        archivematica.get_transfer_status(transfer_uuid, function (response) {

            importlib.update_transfer_status(response, function (result) {

                if (result.error !== undefined && result.error === true) {

                    logger.module().error('ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] transfer status : ' + result.message);
                    clearInterval(timer);

                    let failObj = {
                        is_member_of_collection: '',
                        transfer_uuid: transfer_uuid,
                        message: 'Transfer status: ' + result.message
                    };

                    importlib.save_to_fail_queue(failObj);
                    importlib.clear_queue_record({
                        transfer_uuid: transfer_uuid
                    },function (result) {
                        if (result === true) {
                            importlib.restart_import();
                        }
                    });

                    throw 'ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] transfer status: ' + result.message;
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);

                    // Start ingest status checks
                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/ingest_status?sip_uuid=' + result.sip_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] http error ' + error);
                            throw 'ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] http error ' + error;
                        }

                        if (httpResponse.statusCode === 200) {
                            setTimeout(function () {
                                archivematica.clear_transfer(transfer_uuid);
                            }, 5000);
                            return false;
                        } else {
                            logger.module().error('ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] http error ' + httpResponse.statusCode + '/' + body);
                            // throw 'ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/importlib.update_transfer_status)] http error ' + httpResponse.statusCode + '/' + body;
                        }
                    });

                    return false;
                }
            });
        });

    }, TRANSFER_STATUS_CHECK_INTERVAL);

    callback({
        status: 200,
        message: 'Transfer status checks started.'
    });
};

/**
 * Checks ingest status and updates queue based on stage of ingest
 * STEP 5
 * @param req
 * @param callback
 */
exports.get_ingest_status = function (req, callback) {

    let sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined) {
        logger.module().error('ERROR: [/import/queue module (get_ingest_status)] sip uuid undefined');
        callback({
            status: 400,
            message: 'Unable to start ingest checks.'
        });

        return false;
    }

    let timer = setInterval(function () {

        archivematica.get_ingest_status(sip_uuid, function (response) {

            importlib.update_ingest_status(response, sip_uuid, function (result) {

                if (result.error !== undefined && result.error === true) {

                    logger.module().error('ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/importlib.update_ingest_status)] unable to update ingest status');

                    let failObj = {
                        is_member_of_collection: '',
                        sip_uuid: sip_uuid,
                        message: 'Ingest status: ' + result.message
                    };

                    importlib.save_to_fail_queue(failObj);
                    importlib.clear_queue_record({
                        sip_uuid: sip_uuid
                    }, function (result) {
                        if (result === true) {
                            importlib.restart_import();
                        }
                    });

                    throw 'ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/importlib.update_ingest_status)] unable to update ingest status';
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);

                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/import_dip?sip_uuid=' + result.sip_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/importlib.update_ingest_status)] import dip request error ' + error);
                            throw 'ERROR: import dip error ' + error;
                        }

                        if (httpResponse.statusCode === 200) {
                            return false;
                        } else {
                            logger.module().error('ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/importlib.update_ingest_status)] import dip request error ' + httpResponse.statusCode + '/' + body);
                            // throw 'ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/importlib.update_ingest_status)] import dip request error ' + httpResponse.statusCode + '/' + body;
                        }

                    });

                    return false;

                }

                if (result.complete === false) {
                    return false;
                }
            });
        });

    }, INGEST_STATUS_CHECK_INTERVAL);

    callback({
        status: 200,
        message: 'Ingest status checks started.'
    });
};

/**
 * Imports DuraCloud DIP paths and associated data
 * STEP 6
 * @param req
 * @param callback
 */
exports.import_dip = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined) {

        logger.module().error('ERROR: [/import/queue module (import_dip)] sip_uuid is undefined');

        callback({
            status: 400,
            message: 'Unable to start duracloud import.'
        });

        return false;
    }

    archivematica.get_dip_path(sip_uuid, function (dip_path) {

        if (dip_path.error !== undefined && dip_path.error === true) {
            logger.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path)] dip path error ' + dip_path.error.message);
            throw 'ERROR: [/import/queue module (import_dip/archivematica.get_dip_path)] dip path error ' + dip_path.error.message;
        }

        let data = {
            sip_uuid: sip_uuid,
            dip_path: dip_path
        };

        duracloud.get_mets(data, function (response) {

            if (response.error !== undefined && response.error === true) {

                logger.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets');

                let failObj = {
                    is_member_of_collection: '',
                    sip_uuid: data.sip_uuid,
                    message: response
                };

                importlib.save_to_fail_queue(failObj);
                importlib.clear_queue_record({
                    sip_uuid: data.sip_uuid
                }, function (result) {
                    if (result === true) {
                        importlib.restart_import();
                    }
                });

                throw 'ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets';
            }

            let metsResults = metslib.process_mets(sip_uuid, dip_path, response.mets);

            importlib.save_mets_data(metsResults, function (result) {

                if (result === 'done') {

                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/create_repo_record?sip_uuid=' + sip_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().fatal('FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/importlib.save_mets_data)] create repo record request error ' + error);
                            throw 'FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/importlib.save_mets_data)] create repo record request error' + error;
                        }

                        if (httpResponse.statusCode === 200) {
                            return false;
                        } else {
                            logger.module().fatal('FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/importlib.save_mets_data)] http create repo record request error ' + httpResponse.statusCode + '/' + body);
                            throw 'FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/importlib.save_mets_data)] http create repo record request error ' + httpResponse.statusCode + '/' + body;
                        }
                    });
                }
            });
        });
    });

    callback({
        status: 200,
        message: 'Processing DIP.'
    });

    return false;
};

/**
 * STEP 7
 */
exports.create_repo_record = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined || sip_uuid === null) {
        // no need to move forward if sip_uuid is missing
        // TODO: log to fail queue
        logger.module().error('ERROR: [/import/queue module (create_repo_record)] sip uuid undefined');

        callback({
            status: 400,
            message: 'Unable to create repository record.'
        });

        return false;
    }

    // 1.) get collection record from queue using sip_uuid
    function get_collection(callback) {

        importlib.get_collection(sip_uuid, function (result) {

            // TODO: confirm that collection pid was returned
            // TODO: if pid was not returned set collection to null? or try again
            // TODO: save sip_uuid to error table?

            if (result === null || result === undefined) {
                get_collection(callback);
                return false;
            }

            let obj = {};
            obj.pid = sip_uuid;
            obj.sip_uuid = sip_uuid;
            obj.is_member_of_collection = result;
            callback(null, obj);
        });
    }

    // 2.)
    function get_uri_txt(obj, callback) {

        importlib.get_uri_txt(obj.sip_uuid, function (data) {

            // uri.txt is not present
            if (data.length === 0) {

                obj.sip_uuid = sip_uuid;
                obj.dip_path = null;
                obj.file = null;
                obj.uuid = null;
                callback(null, obj);
                return false;
            }

            // gets uri data from db
            let dc_data = data.pop();
            obj.sip_uuid = sip_uuid;
            obj.dip_path = dc_data.dip_path;
            obj.file = dc_data.file;
            obj.uuid = dc_data.uuid;
            callback(null, obj);
        });
    }

    // 3.)
    function get_object_uri_data(obj, callback) {

        // no need to assign mods id if dip_path is not available
        if (obj.dip_path === null) {
            obj.mods_id = null;
            callback(null, obj);
            return false;
        }

        // downloads uri.txt file
        duracloud.get_uri(obj, function (response) {
            let uriArr = response.split('/');
            obj.uri = response;
            obj.mods_id = uriArr[uriArr.length - 1].trim();
            callback(null, obj);
        });
    }

    // 4.)
    function save_mods_id(obj, callback) {

        if (obj.mods_id === null) {
            callback(null, obj);
            return false;
        }

        importlib.save_mods_id(obj.mods_id, obj.sip_uuid, function (result) {
            // TODO: check result
            callback(null, obj);
        });
    }

    // 5.)
    function get_object(obj, callback) {

        importlib.get_object(obj.sip_uuid, function (data) {

            if (data.length === 0) {
                obj.dip_path = null;
                obj.file = null;
                obj.uuid = null;
                callback(null, obj);
                return false;
            }

            // gets object data from db
            let dc_data = data.pop();
            obj.dip_path = dc_data.dip_path;
            obj.file = dc_data.file;
            obj.uuid = dc_data.uuid;
            obj.mime_type = dc_data.mime_type;
            callback(null, obj);
        });
    }

    // 6.)
    function get_object_file_data(obj, callback) {

        if (obj.dip_path === null) {
            obj.checksum = null;
            obj.file_size = null;
            obj.file_name = null;
            obj.thumbnail = null;
            obj.mime_type = null;
            callback(null, obj);
            return false;
        }

        // if unable to get mime type from mets, check file extension
        if (obj.mime_type === undefined) {
            logger.module().info('INFO: [/import/queue module (create_repo_record/get_object_file_data)] failed to get mime type from METS');
            obj.mime_type = mimetypelib.get_mime_type(obj.file);
        }

        // process larger files. checks if there is a manifest available for chunked files
        if (obj.mime_type.indexOf('audio') !== -1 || obj.mime_type.indexOf('video') !== -1) {

            const get_manifest = function (obj) {

                if (obj.dip_path === null) {
                    callback(null, obj);
                    return false;
                }

                // get dura-manifest xml document
                duracloud.get_object_manifest(obj, function (response) {

                    if (response.error !== undefined && response.error === true) {

                        logger.module().error('ERROR: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_manifest)] unable to get manifest or manifest  ' + response.error_message);
                        obj.file_name = obj.dip_path + '/objects/' + obj.uuid + '-' + obj.file;
                        get_duracloud_object(obj, 5000);
                        return false;

                    } else {

                        let manifest = manifestlib.process_manifest(response);

                        if (manifest.length > 0) {
                            obj.checksum = manifest[0].checksum;
                            obj.file_size = manifest[0].file_size;
                        } else {
                            obj.checksum = null;
                            obj.file_size = null;
                        }

                        callback(null, obj);
                        return false;
                    }
                });
            };

            get_manifest(obj);

        } else {
            get_duracloud_object(obj, 5000);
        }

        function get_duracloud_object(obj, TIMER) {

            setTimeout(function () {

                // gets headers only
                duracloud.get_object_info(obj, function (response) {

                    if (response.error === true) {
                        logger.module().error('ERROR: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_info)] Unable to get duracloud object ' + response.error_message);

                        let failObj = {
                            is_member_of_collection: '',
                            sip_uuid: sip_uuid,
                            message: 'ERROR: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_info)] Unable to get duracloud object ' + response.error_message
                        };

                        importlib.save_to_fail_queue(failObj);
                        importlib.clear_queue_record({
                            sip_uuid: sip_uuid
                        }, function (result) {
                            if (result === true) {
                                // TODO: test when object is not found, but proceed with metadata import
                                // importlib.restart_import();
                                callback(null, obj);
                            }
                        });

                        return false;
                    }

                    obj.checksum = response.headers['content-md5'];
                    obj.file_size = response.headers['content-length'];
                    obj.file_name = obj.dip_path + '/objects/' + obj.uuid + '-' + obj.file;
                    obj.thumbnail = obj.dip_path + '/thumbnails/' + obj.uuid + '.jpg';

                    callback(null, obj);
                });

            }, TIMER);

            return false;
        }
    }

    // 7.)
    function get_token(obj, callback) {

        if (fs.existsSync('./tmp/st.txt')) {

            let st_file = fs.statSync('./tmp/st.txt'),
                now = moment().startOf('day'),
                st_created_date_time = moment(st_file.birthtime),
                st_expire_date_time = st_created_date_time.clone().add(5, 'days');

            if (st_expire_date_time.isBefore(now)) {

                // if token is expired, delete existing one and get new one.
                let fileObj = {
                    file: 'st.txt'
                };

                delete_file(fileObj, function (result) {
                    new_token();
                });

            } else if (st_expire_date_time.isAfter(now)) {

                // if token is still valid, get the token from the txt file
                fs.readFile('./tmp/st.txt', {encoding: 'utf-8'}, function (error, data) {

                    if (error) {
                        logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token)] unable to read session token file ' + error);
                        return false;
                    }

                    obj.session = data;
                    callback(null, obj);
                    return false;
                });
            }

        } else {
            new_token();
        }

        /**
         * Makes request to archivespace to generate new session token
         */
        function new_token() {

            archivespace.get_session_token(function (response) {

                let data = response.data,
                    token;

                if (data === undefined) {
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                try {

                    token = JSON.parse(data);

                    fs.writeFile('./tmp/st.txt', token.session, function (error) {

                        if (error) {
                            logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token/archivespace.get_session_token)] unable to save session token to file');
                            callback({
                                error: true,
                                error_message: error
                            });
                        }

                        if (token.session === undefined) {
                            logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token/archivespace.get_session_token)] session token is undefined');
                            obj.session = null;
                            callback(null, obj);
                            return false;
                        }

                        if (token.error === true) {
                            logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token/archivespace.get_session_token)] session token error' + token.error_message);
                            obj.session = null;
                            callback(null, obj);
                            return false;
                        }

                        if (!fs.existsSync('./tmp/st.txt')) {
                            logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token/archivespace.get_session_token)] st.txt was not created');
                        }

                        obj.session = token.session;
                        callback(null, obj);
                        return false;

                    });

                } catch (error) {
                    logger.module().error('ERROR: [/import/queue module (create_repo_record/get_token/archivespace.get_session_token)] session token error ' + error);
                }
            });
        }
    }

    // 8.)
    function get_mods(obj, callback) {

        // skip mods retrieval if session is not available
        if (obj.session === null) {
            obj.mods = null;
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            archivespace.get_mods(obj.mods_id, obj.session, function (response) {

                if (response.error !== undefined && response.error === true) {

                    logger.module().error('ERROR: [/import/queue module (create_repo_record/get_mods)] unable to get mods ' + response.error_message);

                    obj.mods = null;
                    callback(null, obj);
                    return false;
                }

                obj.mods = response.mods;
                callback(null, obj);
            });

        }, 5000);
    }

    // 9.)
    function get_handle(obj, callback) {

        if (obj.pid === null) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

        handles.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                logger.module().error('ERROR: [/import/queue module (create_repo_record/get_handle/handles.create_handle)] handle error ' + handle.message);
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    // 10.)
    function create_display_record(obj, callback) {

        if (obj.mods === null) {
            logger.module().info('INFO: [/import/queue module (create_repo_record/create_display_record)] display record not created because we were not able to get MODS from archivesspace');
            callback(null, obj);
            return false;
        }

        obj.object_type = 'object';
        obj.is_published = 0;

        modslibdisplay.create_display_record(obj, function (result) {

            let tmp = JSON.parse(result);

            if (tmp.is_compound === 1) {

                let parts = tmp.display_record.parts;

                importlib.get_compound_object_parts(obj.sip_uuid, parts, function (compound) {

                    tmp.compound = compound;
                    obj.is_compound = 1;
                    obj.display_record = JSON.stringify(tmp);
                    callback(null, obj);
                });

            } else {
                obj.display_record = result;
                callback(null, obj);
            }
        });
    }

    // 11.)
    function delete_file(obj, callback) {

        if (obj.dip_path === null) {
            callback(null, obj);
            return false;
        }

        fs.unlink('./tmp/' + obj.file, function (error) {

            if (error) {
                logger.module().error('ERROR: [/import/queue module (create_repo_record/delete_file)] file delete error ' + error);
            }

            callback(null, obj);
        });
    }

    // 12.)
    function create_repo_record(obj, callback) {

        if (obj.mods === null && obj.dip_path === null) {
            callback(null, obj);
            return false;
        }

        logger.module().info('INFO: [/import/queue module (create_repo_record/create_repo_record)] saving repository record to db');

        importlib.create_repo_record(obj, function (result) {

            // TODO: check result...
            callback(null, obj);
        });
    }

    // 13.)
    function index(obj, callback) {

        if (obj.mods === null) {
            logger.module().info('INFO: [/import/queue module (create_repo_record/index)] display record not indexed because we were not able to get MODS from archivesspace');
            callback(null, obj);
            return false;
        }

        request.post({
            url: config.apiUrl + '/api/admin/v1/indexer',
            form: {
                'sip_uuid': obj.sip_uuid
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().error('ERROR: [/import/queue module (create_repo_record/index)] indexer error ' + error);
                return false;
            }

            if (httpResponse.statusCode === 200) {
                obj.indexed = true;
                callback(null, obj);
                return false;
            } else {
                logger.module().error('ERROR: [/import/queue module (create_repo_record/index)] http error ' + httpResponse.statusCode + '/' + body);
                return false;
            }
        });
    }

    // 14.)
    function cleanup_queue(obj, callback) {

        logger.module().info('INFO: [/import/queue module (create_repo_record/cleanup_queue)] cleaning up local queue ' + obj.sip_uuid);

        archivematica.clear_ingest(obj.sip_uuid);

        importlib.cleanup(obj, function (result) {

            if (result !== true) {
                logger.module().error('ERROR: [/import/queue module (create_repo_record/cleanup_queue)] unable to clean up queue');
                return false;
            }

            obj.cleaned = true;
            callback(null, obj);
        });
    }

    async.waterfall([
        get_collection,
        get_uri_txt,
        get_object_uri_data,
        save_mods_id,
        get_object,
        get_object_file_data,
        get_token,
        get_mods,
        get_handle,
        create_display_record,
        create_repo_record,
        index,
        cleanup_queue
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/import/queue module (create_repo_record/async.waterfall)] ' + error);
        }

        if (results.mods === null && results.dip_path === null) {

            let failObj = {
                is_member_of_collection: results.is_member_of_collection,
                sip_uuid: results.sip_uuid,
                message: 'Unable to create repository record'
            };

            importlib.save_to_fail_queue(failObj);
            importlib.clear_queue_record({
                sip_uuid: results.sip_uuid
            }, function (result) {
                if (result === true) {
                    importlib.restart_import();
                }
            });
        }

        logger.module().info('INFO: [/import/queue module (create_repo_record/async.waterfall)] record imported');

        // look for null values in object as it indicates that the record is incomplete
        for (let i in results) {
            if (results[i] === null) {
                importlib.flag_incomplete_record(results);
                logger.module().info('INFO: [/import/queue module (create_repo_record/async.waterfall)] ' + results.sip_uuid + ' is incomplete');
                break;
            }
        }

        let collection = results.is_member_of_collection.replace(':', '_');

        // start next transfer
        // get queue record count for current collection
        importlib.check_queue(collection, function (result) {

            if (result.status === 0) {
                // ingest complete
                return false;
            }

            request.post({
                url: config.apiUrl + '/api/admin/v1/import/start_transfer',
                form: {
                    'collection': collection
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    logger.module().fatal('FATAL: [/import/queue module (create_repo_record/async.waterfall/importlib.check_queue)] unable to begin transfer ' + error);
                    throw 'FATAL: [/import/queue module (create_repo_record/async.waterfall/importlib.check_queue)] unable to begin transfer ' + error;
                }

                if (httpResponse.statusCode === 200) {
                    logger.module().info('INFO: [/import/queue module (create_repo_record/async.waterfall/importlib.check_queue)] sending request to start next transfer (async)');
                    return false;
                } else {
                    logger.module().fatal('FATAL: [/import/queue module (create_repo_record/async.waterfall/importlib.check_queue)] unable to begin next transfer ' + body);
                    throw 'FATAL: [/import/queue module (create_repo_record/async.waterfall/importlib.check_queue)] unable to begin next transfer ' + body;
                }
            });

        });
    });

    callback({
        status: 200,
        message: 'Importing object.'
    });
};