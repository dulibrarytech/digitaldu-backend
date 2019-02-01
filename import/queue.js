'use strict';

const fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslib = require('../libs/mods/mods_init'),
    modslibdisplay = require('../libs/mods/display-record'),
    metslib = require('../libs/mets'),
    importlib = require('../libs/import/transfer-ingest'),
    pids = require('../libs/next-pid'),
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    duracloud = require('../libs/duracloud'),
    archivespace = require('../libs/archivespace'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    async = require('async'),
    logger = require('../libs/log4'),
    socketclient = require('socket.io-client')(config.host),
    request = require('request'),
    shell = require('shelljs'),
    queue = require('bull'),
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
    REDIS = {
        redis: {
            port: 6379,
            host: '127.0.0.1'
        }
    },
    TRANSFER_QUEUE = 'tbl_archivematica_queue',
    IMPORT_QUEUE = 'tbl_duracloud_import_queue',
    TRANSFER_TIMER = 3000,                  // Transfer status is broadcast every 3 sec.
    IMPORT_TIMER = 5000,                    // Import status is broadcast every 5 sec.
    TRANSFER_INTERVAL_TIME = 10000,         // Object transfer starts every 45 sec. when the endpoint receives a request.
    TRANSFER_APPROVAL_TIME = 10000,         // Transfer approval occurs 30 sec. after transfer  (Gives transfer process time to complete)
    TRANSFER_STATUS_CHECK_INTERVAL = 3000,  // Transfer status checks occur every 3 sec.
    INGEST_STATUS_CHECK_INTERVAL = 10000;   // Ingest status checks begin 10 sec after the endpoint receives a request.

/**
 * Broadcasts transfer status
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(TRANSFER_QUEUE)
            .select('*')
            .whereRaw('DATE(created) = CURRENT_DATE')
            .orderBy('created', 'desc')
            .then(function (data) {

                if (data.length > 0) {
                    socketclient.emit('transfer_status', data);
                }

            })
            .catch(function (error) {
                logger.module().error('ERROR: transfer queue database error');
                throw error;
            });

    }, TRANSFER_TIMER);
});

/** TODO: test, then remove
 * Broadcasts ingest status
 */
/*
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(INGEST_QUEUE)
            .select('*')
            .whereRaw('DATE(created) = CURRENT_DATE')
            .orderBy('created', 'desc')
            .then(function (data) {

                if (data.length > 0) {
                    socketclient.emit('ingest_status', data);
                }

            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });

    }, INGEST_TIMER);
});
*/

/** TODO: rethink this...
 * Broadcasts duracloud import status
 */
socketclient.on('connect', function () {

    let id = setInterval(function () {

        knexQ(IMPORT_QUEUE)
            .select('*')
            .whereRaw('DATE(created) = CURRENT_DATE')
            .orderBy('created', 'desc')
            .groupBy('sip_uuid')
            .then(function (data) {

                if (data.length > 0) {
                    socketclient.emit('import_status', data);
                }

            })
            .catch(function (error) {
                logger.module().error('ERROR: import queue database error');
                throw error;
            });

    }, IMPORT_TIMER);
});

/**
 * Gets list of folders from Archivematica sftp server
 * @param req (query.collection)
 * @param callback
 */
exports.list = function (req, callback) {

    let query = req.query.collection;

    archivematica.list(query, function (results) {

        if (results.error !== undefined && results.error === true) {

            logger.module().fatal('FATAL: unable to get files from Archivematica SFTP server');

            callback({
                status: 400,
                content_type: {'Content-Type': 'application/json'},
                message: results.message
            });

            return false;
        }

        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            message: 'list',
            data: {list: results}
        });
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

    logger.module().info('INFO: starting ingest process (queue_objects)');

    if (req.body === undefined) {

        logger.module().error('ERROR: missing payload body. unable to start ingest process (queue_objects)');

        callback({
            status: 404,
            content_type: {'Content-Type': 'application/json'},
            message: 'Nothing to see here...',
            data: []
        });

        return false;
    }

    let transfer_data = req.body;

    const queue_objects = new queue('queue-objects', REDIS);

    queue_objects.process(function (job, done) {
        importlib.save_transfer_records(job.data, function (result) {
            done(null, result);
            return false;
        });
    });

    queue_objects.on('failed', function (job, error) {
        logger.module().fatal('FATAL: queue failed ' + job.failedReason);
        throw 'FATAL: queue failed ' + job.failedReason + ' (queue_objects)';
    });

    queue_objects.on('completed', function (job) {

        logger.module().info('INFO: queue process completed ' + job.returnvalue);

        if (job.returnvalue.message !== 'Data saved.') {
            logger.module().fatal('FATAL: unable to save queue data (queue_objects)');
            throw 'FATAL: unable to save queue data (queue_objects)';
        }

        if (job.data.collection === undefined) {
            logger.module().fatal('FATAL: collection is undefined (queue_objects)');
            throw 'FATAL: collection is undefined (queue_objects)';
        }

        request.post({
            url: config.apiUrl + '/api/admin/v1/import/start_transfer',
            form: {
                'collection': job.data.collection
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().fatal('FATAL: unable to begin transfer ' + error + ' (queue_objects)');
                throw 'ERROR: unable to begin transfer ' + error + ' (queue_objects)';
            }

            if (httpResponse.statusCode === 200) {
                callback(body);
                logger.module().info('INFO: sending request to start transfer (queue_objects)');
                queue_objects.close();
                return false;
            } else {
                logger.module().fatal('FATAL: unable to begin transfer ' + body + ' (queue_objects)');
                queue_objects.close();
                throw 'FATAL: unable to begin transfer ' + body + ' (queue_objects)';
            }
        });
    });

    queue_objects.on('stalled', function (job) {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        logger.module().info('INFO: stalled queue job ' + job + ' (queue_objects)');
    });

    queue_objects.add(transfer_data);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Objects queued.'
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
    console.log(collection);

    if (collection === undefined) {

        logger.module().fatal('FATAL: collection undefined. unable to start transfer (start_transfer)');

        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to start transfer.'
        });

        return false;
    }

    const start_transfer = new queue('start-transfer', REDIS);

    start_transfer.process(function (job, done) {

        let timer = setInterval(function () {

            importlib.start_transfer(job.data, function (object) {

                if (object === 'done') {
                    clearInterval(timer);
                    logger.module().info('INFO: transfer process complete (start_transfer)');
                    start_transfer.close();
                    done(null, object);
                    return false;
                }

                // Initiates file transfer on Archivematica service
                archivematica.start_tranfser(object, function (response) {

                    if (response.error !== undefined && response.error === true) {
                        logger.module().fatal('FATAL: transfer error ' + response + ' (start_transfer)');
                        // TODO: Tries again if response fails?
                        throw 'FATAL: transfer error ' + response + ' (start_transfer)';
                    }

                    logger.module().info('INFO: transfer started and confirming transfer (start_transfer)');
                    importlib.confirm_transfer(response, object.id);
                });
            });

        }, TRANSFER_INTERVAL_TIME);
    });

    start_transfer.on('failed', function (job, error) {
        logger.module().fatal('FATAL: transfer failed ' + error + ' reason: ' + job.failedReason + ' (start_transfer)');
        throw 'FATAL: transfer failed ' + error + ' reason: ' + job.failedReason + ' (start_transfer)';
    });

    start_transfer.on('completed', function (job) {

        if (job.data.collection === undefined) {
            logger.module().fatal('FATAL: Collection is undefined ' + job.data + ' (start_transfer)');
            start_transfer.close();
            throw 'FATAL: Collection is undefined ' + job.data + ' (start_transfer)';
        }

        request.post({
            url: config.apiUrl + '/api/admin/v1/import/approve_transfer',
            form: {
                'collection': job.data.collection
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().fatal('FATAL: http error. unable to approve transfer ' + error);
                start_transfer.close();
                throw 'FATAL: http error. unable to approve transfer ' + error;
            }

            if (httpResponse.statusCode === 200) {
                logger.module().info('INFO: sending approve transfer request');
                start_transfer.close();
                return false;
            } else {
                logger.module().fatal('FATAL: http error. unable to approve transfer ' + body);
                start_transfer.close();
                throw 'FATAL: http error. unable to approve transfer ' + body;
            }
        });
    });

    start_transfer.on('stalled', function (job) {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        logger.module().info('INFO: stalled queue job ' + job);
    });

    start_transfer.add({
        collection: collection
    });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Starting transfers.'
    });
};

/**
 * STEP 3
 * @param req
 * @param callback
 */
exports.approve_transfer = function (req, callback) {

    logger.module().info('INFO: approving transfer');

    let collection = req.body.collection;

    if (collection === undefined) {
        logger.module().error('ERROR: collection undefined (approve_transfer)');
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to start transfer.'
        });

        return false;
    }

    let timer = setInterval(function () {

        importlib.get_transferred_record(collection, function (object) {

            if (object === 'done') {
                logger.module().info('INFO: approval complete (approve_transfer)');
                clearInterval(timer);
                return false;
            }

            archivematica.approve_transfer(object.transfer_folder, function (response) {

                importlib.confirm_transfer_approval(response, object, function (result) {

                    if (result.error !== undefined && result.error === true) {
                        logger.module().error('ERROR: unable to confirm transfer approval ' + result + ' (approve_transfer)');
                        return false;
                    }

                    logger.module().info('INFO: transfer approved (approve_transfer)');

                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/transfer_status?collection=' + result.is_member_of_collection + '&transfer_uuid=' + result.transfer_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().fatal('FATAL: http error ' + error + ' (approve_transfer)');
                            throw 'FATAL: http error ' + error;
                        }

                        if (httpResponse.statusCode === 200) {
                            logger.module().info('INFO: transfer status request (approve_transfer)');
                            return false;
                        } else {
                            logger.module().fatal('ERROR: http error ' + body + ' (approve_transfer)');
                            throw 'FATAL: http error ' + body + ' (approve_transfer)';
                        }
                    });
                });
            });
        });

    }, TRANSFER_APPROVAL_TIME);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
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

    logger.module().info('INFO: getting transfer status');

    var is_member_of_collection = req.query.collection,
        transfer_uuid = req.query.transfer_uuid;

    if (is_member_of_collection === undefined || transfer_uuid === undefined) {
        logger.module().error('ERROR: unable to start transfer checks (get_transfer_status)');
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to start transfer checks.'
        });

        return false;
    }

    let timer = setInterval(function () {

        archivematica.get_transfer_status(transfer_uuid, function (response) {

            importlib.update_transfer_status(response, function (result) {

                if (result.error !== undefined && result.error === true) {
                    logger.module().error('ERROR: unable to get transfer status (get_transfer_status)');
                    clearInterval(timer);
                    return false;
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);
                    logger.module().info('INFO: transfer interval done (get_transfer_status)');

                    // Start ingest status checks
                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/ingest_status?sip_uuid=' + result.sip_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: http error ' + error + ' (get_transfer_status)');
                            throw 'ERROR: http error ' + error + ' (get_transfer_status)';
                        }

                        if (httpResponse.statusCode === 200) {
                            logger.module().info('INFO: ingest status request');
                            return false;
                        } else {
                            logger.module().error('ERROR: http error ' + body + ' (get_transfer_status)');
                            throw 'ERROR: http error ' + body + ' (get_transfer_status)';
                        }
                    });

                    return false;
                }

            });
        });

    }, TRANSFER_STATUS_CHECK_INTERVAL);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
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

    logger.module().info('INFO: getting ingest status');

    let sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined) {
        logger.module().error('ERROR: sip uuid undefined (get_ingest_status)');
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to start ingest checks.'
        });

        return false;
    }

    let timer = setInterval(function () {

        archivematica.get_ingest_status(sip_uuid, function (response) {

            importlib.update_ingest_status(response, sip_uuid, function (result) {

                if (result.error !== undefined && result.error === true) {
                    logger.module().error('ERROR: unable to update ingest status (get_ingest_status)');
                    clearInterval(timer);
                    return false;
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);

                    logger.module().info('INFO: ingest interval complete (get_ingest_status)');

                    request.get({
                        url: config.apiUrl + '/api/admin/v1/import/import_dip?sip_uuid=' + result.sip_uuid
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: import dip request error ' + error + ' (get_ingest_status)');
                            throw 'ERROR: import dip error ' + error + ' (get_ingest_status)';
                        }

                        if (httpResponse.statusCode === 200) {
                            logger.module().info('INFO: import dip request');
                            return false;
                        } else {
                            logger.module().error('ERROR: import dip request error ' + body + ' (get_ingest_status)');
                            throw 'ERROR: import dip request error ' + body + ' (get_ingest_status)';
                        }

                    });

                    return false;
                }
            });
        });

    }, INGEST_STATUS_CHECK_INTERVAL);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
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

    logger.module().info('INFO: importing dip information');

    var sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined) {
        logger.module().error('ERROR: import dip request (import_dip)');
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to start duracloud import.'
        });

        return false;
    }

    archivematica.get_dip_path(sip_uuid, function (dip_path) {

        if (dip_path.error !== undefined && dip_path.error === true) {
            logger.module().error('ERROR: dip path error ' + dip_path.error.message + ' (import_dip)');
            throw 'ERROR: dip path error ' + dip_path.error.message + ' (import_dip)';
        }

        let data = {
            sip_uuid: sip_uuid,
            dip_path: dip_path
        };

        duracloud.get_mets(data, function (response) {

            if (response.error !== undefined && response.error === true) {
                logger.module().error('ERROR: unable to get mets (import_dip)');
                throw 'ERROR: unable to get mets (import_dip)';
            }

            let metsResults = metslib.process_mets(sip_uuid, dip_path, response.mets);

            // TODO: look into why two records are saved to queue sometimes
            // TODO: check if record already exists here...
            importlib.save_mets_data(metsResults, function (result) {

               if (result === 'done') {

                   request.get({
                       url: config.apiUrl + '/api/admin/v1/import/create_repo_record?sip_uuid=' + sip_uuid
                   }, function (error, httpResponse, body) {

                       if (error) {
                           logger.module().fatal('FATAL: create repo record request error ' + error + ' (import_dip)');
                           throw 'FATAL:  create repo record request error' + error + ' (import_dip)';
                       }

                       if (httpResponse.statusCode === 200) {
                           logger.module().info('INFO: create repo record request');
                           return false;
                       } else {
                           logger.module().fatal('FATAL: http create repo record request error ' + body + ' (import_dip)');
                           throw 'FATAL: http create repo record request error ' + body + ' (import_dip)';
                       }
                   });
               }
            });
        });
    });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Processing DIP.'
    });

    return false;
};

/**
 * STEP 7
 */
exports.create_repo_record = function (req, callback) {

    logger.module().info('INFO: creating repository record');

    var sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined) {
        logger.module().error('ERROR: sip uuid undefined (create_repo_record)');
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'Unable to create repository record.'
        });

        return false;
    }

    // 1.) get collection record from queue using sip_uuid
    function get_collection (callback) {

        logger.module().info('INFO: getting collection');

        importlib.get_collection(sip_uuid, function (result) {

            let obj = {};
            obj.sip_uuid = sip_uuid;
            obj.is_member_of_collection = result;
            callback(null, obj);
        });
    }

    // 2.)
    function get_uri_txt(obj, callback) {

        logger.module().info('INFO: getting uri txt');

        importlib.get_uri_txt(obj.sip_uuid, function (data) {

            // TODO: check array length, if zero, uri.txt not present; Update queue db with error
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
    function get_object_uri_data (obj, callback) {

        logger.module().info('INFO: getting object uri data');

        duracloud.get_object(obj, function (response) {

            let uriArr = response.split('/');
            obj.mods_id = uriArr[uriArr.length-1].trim();
            callback(null, obj);
        });
    }

    // 4.)
    function save_mods_id (obj, callback) {

        logger.module().info('INFO: saving mods id');

        importlib.save_mods_id(obj.mods_id, obj.sip_uuid, function (result) {
            // TODO: check result
            callback(null, obj);
        });
    }

    // 5.)
    function get_object(obj, callback) {

        logger.module().info('INFO: getting object data');

        importlib.get_object(obj.sip_uuid, function (data) {

            // TODO: check array length
            // gets object data from db
            let dc_data = data.pop();
            obj.dip_path = dc_data.dip_path;
            obj.file = dc_data.file;
            obj.uuid = dc_data.uuid;
            callback(null, obj);
        });
    }

    // 6.)
    function get_object_file_data (obj, callback) {

        logger.module().info('INFO: getting object file data');

        duracloud.get_object(obj, function (response) {

            obj.checksum = response.headers['content-md5'];
            obj.file_size = response.headers['content-length'];
            obj.file_name = obj.dip_path + '/objects/' + obj.uuid + '-' + obj.file;
            obj.thumbnail = obj.dip_path + '/thumbnails/' + obj.uuid + '.jpg';

            if (!fs.existsSync('./tmp/' + obj.file)) {
                logger.module().error('ERROR: file ' + obj.file + ' does not exist');
                throw 'File ' + obj.file + ' does not exist.';
            }

            let tmp = shell.exec('file --mime-type ./tmp/' + obj.file).stdout;
            let mimetypetmp = tmp.split(':');
            obj.mime_type = mimetypetmp[1].trim();

            callback(null, obj);
        });
    }

    // 7.)
    function get_token (obj, callback) {

        logger.module().info('INFO: getting session token');

        if (fs.existsSync('./tmp/st.txt')) {

            // TODO: check file date/time

            fs.readFile('./tmp/st.txt', {encoding: 'utf-8'}, function(error, data) {

                if (error) {
                    logger.module().error('ERROR: unable to save session token to file ' + error);
                    return false;
                }

                obj.session = data;
                callback(null, obj);

            });

            return false;
        }

        archivespace.get_session_token(function (response) {

            // TODO: catch error here...
            let data = response.data,
                token;

            try {

                token = JSON.parse(data);
                obj.session = token.session;

                fs.writeFile('./tmp/st.txt', obj.session, function(error) {

                    if (error) {
                        logger.module().error('ERROR: unable to save session token to file');
                        callback({
                            error: true,
                            error_message: error
                        });
                    }

                    if (!fs.existsSync('./tmp/st.txt')) {
                        logger.module().error('ERROR: st.txt does not exist');
                        throw 'ERROR: st.txt does not exist';
                    }

                    if (token === undefined) {
                        logger.module().error('ERROR: session token is undefined');
                        throw 'ERROR: session token is undefined';
                    }

                    if (token.error === true) {
                        logger.module().error('ERROR: session token error' + token.error_message);
                        throw 'ERROR: session token error' + token.error_message;
                    }

                    callback(null, obj);
                    return false;

                });

            } catch (e) {
                logger.module().error('ERROR: session token error ' + e);
                throw e;
            }
        });
    }

    // 8.)
    function get_mods(obj, callback) {

        logger.module().info('INFO: getting mods');

        setTimeout(function () {

            archivespace.get_mods(obj.mods_id, obj.session, function (response) {

                // TODO: check response
                if (response.error !== undefined && response.error === true) {
                    logger.module().error('ERROR: unable to get mods ' + response.error_message);
                    // TODO: try again?
                    // TODO: flag queue record as failed?
                    // obj.mods = null;
                    // callback(null, obj);
                    // TODO: FATAL error...
                    return false;
                }

                obj.mods = response.mods;
                callback(null, obj);
            }, 4000);
        });
    }

    // 9.)
    function get_pid (obj, callback) {

        logger.module().info('INFO: getting pid');

        pids.get_next_pid(function (pid) {
            obj.pid = pid;
            callback(null, obj);
        });
    }

    // 10.)
    function get_handle (obj, callback) {

        logger.module().info('INFO: getting handle');

        handles.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                logger.module().error('ERROR: handle error');
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    // 11.)
    function create_display_record (obj, callback) {

        logger.module().info('INFO: creating display record');

        modslibdisplay.create_display_record(obj, function (result) {

            obj.display_record = result;
            callback(null, obj);
        });
    }

    // 12.)
    function delete_file (obj, callback) {

        logger.module().info('INFO: deleting object file');

        fs.unlink('./tmp/' + obj.file, function (error) {

            if (error) {
                logger.module().error('ERROR: handle error ' + error);
            }

            callback(null, obj);
        });
    }

    // 13.)
    function create_repo_record(obj, callback) {

        logger.module().info('INFO: saving repository record to db');

        importlib.create_repo_record(obj, function (result) {

            // TODO: check result...
            callback(null, obj);
        });
    }

    // 14.)
    function index(obj, callback) {

        logger.module().info('INFO: indexing repository record');

        request.post({
            url: config.apiUrl + '/api/admin/v1/indexer',
            form: {
                'sip_uuid': obj.sip_uuid
            }
        }, function (error, httpResponse, body) {

            if (error) {
                logger.module().fatal('FATAL: indexer error ' + error + ' (create_repo_record)');
                throw 'FATAL: indexer error ' + error + ' (create_repo_record)';
            }

            if (httpResponse.statusCode === 200) {
                obj.indexed = true;
                callback(null, obj);
                return false;
            } else {
                logger.module().fatal('FATAL: http error ' + body + ' (create_repo_record)');
                throw 'FATAL: http error ' + body + ' (create_repo_record)'
            }
        });
    }

    // 15.)
    function cleanup_queue(obj, callback) {

        logger.module().info('INFO: cleaning up queue ' + obj.sip_uuid);

        importlib.cleanup(obj, function (result) {

            if (result !== true) {
                logger.module().error('ERROR: unable to clean up queue');
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
        get_pid,
        get_handle,
        create_display_record,
        delete_file,
        create_repo_record,
        index,
        cleanup_queue
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: async (create_repo_record)');
        }

        logger.module().info('INFO: record imported');
        // console.log('repoObj: ', results);
    });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Processing MODS.'
    });
};