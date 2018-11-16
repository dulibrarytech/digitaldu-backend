'use strict';

const fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    modslib = require('../libs/mods/mods_init'),
    metslib = require('../libs/mets'),
    pids = require('../libs/next-pid'),
    handles = require('../libs/handles'),
    archivematica = require('../libs/archivematica'),
    duracloud = require('../libs/duracloud'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    async = require('async'),
    socketclient = require('socket.io-client')(config.host),
    request = require('request'),
    shell = require('shelljs'),
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
    TRANSFER_QUEUE = 'tbl_archivematica_transfer_queue',
    INGEST_QUEUE = 'tbl_archivematica_ingest_queue',
    IMPORT_QUEUE = 'tbl_duracloud_import_queue',
    REPO_OBJECTS = 'tbl_objects',
    TRANSFER_TIMER = 3000,                  // Transfer status is broadcast every 3 sec.
    INGEST_TIMER = 4000,                    // Ingest status is broadcast every 4 sec.
    IMPORT_TIMER = 5000,                    // Import status is broadcast every 5 sec.
    TRANSFER_START_TIME = 45000,            // Object transfer starts every 45 sec. when the endpoint receives a request.
    TRANSFER_APPROVAL_TIME = 30000,         // Transfer approval occurs 30 sec. after transfer  (Gives transfer process time to complete)
    TRANSFER_STATUS_CHECK = 3000,           // Transfer status checks occur every 3 sec.
    INGEST_STATUS_START_TIMEOUT = 10000,    // Ingest status checks begin 10 sec after the endpoint receives a request.
    INGEST_STATUS_CHECK_TIME = 3000,        // Ingest status checks occur every 3 sec.
    DURACLOUD_IMPORT_START_TIMEOUT = 5000;  // DuraCloud import begins 5 sec after the endpoint receives a request.

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
                console.log(error);
                throw error;
            });

    }, TRANSFER_TIMER);
});

/**
 * Broadcasts ingest status
 */
socketclient.on('connect', function () {

    // const INGEST_TIMER = 4000;
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

/**
 * Broadcasts duracloud import status
 */
socketclient.on('connect', function () {

    // const IMPORT_TIMER = 5000;
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
                console.log(error);
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
exports.start_transfer = function (req, callback) {

    if (req.body === undefined) {

        callback({
            status: 404,
            content_type: {'Content-Type': 'application/json'},
            message: 'Nothing to see here...',
            data: []
        });
    }

    var collection = req.body.collection,
        objects = req.body.objects.split(','),
        user = req.body.user;

    // Create array of objects.  Each object contains the collection PID and object filename
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
    knexQ.batchInsert(TRANSFER_QUEUE, importObjects, chunkSize)
        .then(function (data) {

            let timer = setInterval(function () {

                // Get one transfer queue record
                knexQ(TRANSFER_QUEUE)
                    .select('id', 'is_member_of_collection', 'object')
                    .where({
                        is_member_of_collection: collection,
                        message: 'WAITING_FOR_TRANSFER',
                        status: 0
                    })
                    .limit(1)
                    .then(function (data) {

                        if (data.length === 0) {
                            console.log('Transfers completed.');
                            clearInterval(timer);
                            return false;
                        }

                        var object = data.pop();

                        if (object.id === undefined) {
                            console.log('ERROR: object.id not found');
                            throw 'ERROR: object.id not found';
                        }

                        let transferStartedObj = {
                            table: TRANSFER_QUEUE,
                            where: {
                                id: object.id,
                                status: 0
                            },
                            update: {
                                message: 'TRANSFER_STARTED',
                                microservice: 'Starting transfer microservice'
                            },
                            callback: function (data) {
                                if (data !== 1) {
                                    // TODO: log update error
                                    console.log(data);
                                    throw 'Database transfer queue error';
                                }
                            }
                        };

                        // Update queue. Indicate to user that the transfer has started.
                        updateQueue(transferStartedObj);

                        // Initiate transfers using archivematica api
                        archivematica.start_tranfser(object, function (results) {

                            var json = JSON.parse(results);

                            if (json.message !== 'Copy successful.') {
                                console.log(json.message);
                                // TODO: update queue
                                return false;
                            }

                            let path = json.path;
                            let pathArr = path.split('/');

                            let arr = pathArr.filter(function (result) {
                                if (result.length !== 0) {
                                    return result;
                                }
                            });

                            let transferFolder = arr.pop();

                            setTimeout(function () {

                                // Automatically approve transfer to allow ingest to proceed
                                archivematica.approve_transfer(transferFolder, function (results) {

                                    var json = JSON.parse(results);

                                    if (json.error === true) {

                                        console.log('transfer_uuid is not present');

                                        if (object.id === undefined) {
                                            console.log('ERROR: object.id not found');
                                            // TODO: update queue
                                            throw 'ERROR: object.id not found';
                                        }

                                        let transferNotApprovedObj = {
                                            table: TRANSFER_QUEUE,
                                            where: {
                                                id: object.id,
                                                status: 0
                                            },
                                            update: {
                                                transfer_uuid: 'transfer_uuid is not present',
                                                message: 'TRANSFER_NOT_APPROVED',
                                                status: 1
                                            },
                                            callback: function (data) {

                                                if (data !== 1) {
                                                    // TODO: log update error
                                                    console.log(data);
                                                    throw 'Database transfer queue error';
                                                }
                                            }
                                        };

                                        // Update queue and indicate that the transfer approval has failed
                                        updateQueue(transferNotApprovedObj);

                                    } else if (json.message === 'Approval successful.') {

                                        var transfer_uuid = json.uuid;

                                        let transferApprovedObj = {
                                            table: TRANSFER_QUEUE,
                                            where: {
                                                id: object.id,
                                                status: 0
                                            },
                                            update: {
                                                transfer_uuid: transfer_uuid,
                                                message: 'TRANSFER_APPROVED'
                                            },
                                            callback: function (data) {

                                                if (data !== 1) {
                                                    // TODO: log update error
                                                    console.log(data);
                                                    throw 'Database transfer queue error';
                                                }

                                                // Initiate transfer status checks
                                                request.get({
                                                    url: config.apiUrl + '/api/admin/v1/import/transfer_status?collection=' + collection + '&transfer_uuid=' + transfer_uuid
                                                }, function (error, httpResponse, body) {

                                                    if (error) {
                                                        console.log(error);
                                                        throw error;
                                                    }

                                                    if (httpResponse.statusCode !== 200) {

                                                        // TODO: log
                                                        throw 'Unable to start transfer status checks';
                                                    }

                                                    console.log(body);
                                                });

                                                return null;
                                            }
                                        };

                                        // Update queue and indicate that the transfer has been approved
                                        updateQueue(transferApprovedObj);

                                    } else if (json.uuid !== undefined) {

                                        console.log('ERROR: json.uuid not found');

                                        let transferApprovalFailedObj = {
                                            table: TRANSFER_QUEUE,
                                            where: {
                                                id: object.id,
                                                status: 0
                                            },
                                            update: {
                                                transfer_uuid: 'uuid is not present',
                                                message: 'TRANSFER_APPROVAL_FAILED',
                                                status: 1
                                            },
                                            callback: function (data) {

                                                if (data !== 1) {
                                                    // TODO: log update error
                                                    console.log(data);
                                                    throw 'Database transfer queue error';
                                                }
                                            }
                                        };

                                        // Update queue and indicate that the transfer approval has failed
                                        updateQueue(transferApprovalFailedObj);

                                        return false;
                                    }
                                });

                            }, TRANSFER_APPROVAL_TIME);
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                        throw error;
                    });

                return null;

            }, TRANSFER_START_TIME);

            return null;

        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Transfer started.',
        data: {collection: collection}
    });
};

/**
 * Checks transfer status and updates queue based on stage of transfer
 * STEP 2
 * @param req
 * @param callback
 */
exports.get_transfer_status = function (req, callback) {

    var is_member_of_collection = req.query.collection,
        transfer_uuid = req.query.transfer_uuid;

    knexQ(TRANSFER_QUEUE)
        .select('*')
        .where({
            is_member_of_collection: is_member_of_collection,
            transfer_uuid: transfer_uuid,
            message: 'TRANSFER_APPROVED'
        })
        .limit(1)
        .then(function (data) {

            let timer = setInterval(function () {

                data.forEach(function (object) {

                    archivematica.get_transfer_status(object.transfer_uuid, function (results) {

                        var json = JSON.parse(results);

                        if (json.status === 'COMPLETE' && json.sip_uuid !== undefined) {

                            clearInterval(timer);

                            let transferCompleteObj = {
                                table: TRANSFER_QUEUE,
                                where: {
                                    is_member_of_collection: is_member_of_collection,
                                    transfer_uuid: json.uuid,
                                    status: 0
                                },
                                update: {
                                    message: 'TRANSFER_COMPLETE',
                                    microservice: json.microservice,
                                    status: 1
                                },
                                callback: function (data) {

                                    if (data !== 1) {
                                        // TODO: log update error
                                        console.log(data);
                                        throw 'Database transfer queue error';
                                    }

                                    if (json.sip_uuid === undefined) {

                                        console.log('sip_uuid was not generated');

                                        let errorObj = {
                                            table: TRANSFER_QUEUE,
                                            update: {
                                                message: 'ERROR_SIP_UUID_NOT_CREATED',
                                                microservice: json.microservice,
                                                status: 1
                                            },
                                            callback: function (data) {

                                                if (data !== 1) {
                                                    // TODO: log update error
                                                    console.log(data);
                                                    throw 'Database transfer queue error';
                                                }
                                            }
                                        };

                                        updateQueue(errorObj);
                                        return false;
                                    }

                                    // Check if transfer uuid already exist
                                    knexQ(INGEST_QUEUE)
                                        .count('transfer_uuid as count')
                                        .where({
                                            transfer_uuid: json.uuid
                                        })
                                        .then(function (data) {

                                            // if the record exist, skip the next step
                                            if (data[0].count === 1) {
                                                return false;
                                            }

                                            // Save object information to import queue
                                            knexQ(INGEST_QUEUE)
                                                .insert({
                                                    is_member_of_collection: object.is_member_of_collection.replace('_', ':'),
                                                    transfer_uuid: json.uuid,
                                                    sip_uuid: json.sip_uuid,
                                                    message: 'STARTING_IMPORT',
                                                    microservice: 'Starting import microservice',
                                                    user: object.user
                                                })
                                                .then(function (data) {

                                                    setTimeout(function () {

                                                        console.log('Begin checking import status...');

                                                        // Initiate ingest status checks
                                                        request.get({
                                                            url: config.apiUrl + '/api/admin/v1/import/ingest_status?sip_uuid=' + json.sip_uuid
                                                        }, function (error, httpResponse, body) {

                                                            if (error) {
                                                                console.log(error);
                                                                throw error;
                                                            }

                                                            if (httpResponse.statusCode !== 200) {

                                                                // TODO: log
                                                                throw 'Unable to start ingest status checks';
                                                            }

                                                            console.log(body);
                                                        });

                                                    }, INGEST_STATUS_START_TIMEOUT);

                                                })
                                                .catch(function (error) {
                                                    console.log(error);
                                                    throw error;
                                                });

                                            return null;

                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                            throw error;
                                        });

                                    return null;
                                }
                            };

                            // Flag transfer as COMPLETE in queue
                            updateQueue(transferCompleteObj);

                        } else if (json.status === 'FAILED' || json.status === 'USER_INPUT' || json.status === 'REJECTED') {

                            let transferFailedObj = {
                                table: TRANSFER_QUEUE,
                                where: {
                                    is_member_of_collection: is_member_of_collection,
                                    transfer_uuid: object.transfer_uuid,
                                    status: 0
                                },
                                update: {
                                    message: json.status,
                                    microservice: json.microservice,
                                    status: 1
                                },
                                callback: function (data) {

                                    if (data !== 1) {
                                        // TODO: log update error
                                        console.log(data);
                                        throw 'Database transfer queue error';
                                    }
                                }
                            };

                            // Update transfer status
                            updateQueue(transferFailedObj);

                        } else if (json.status === 'PROCESSING') {

                            let transferProcessingObj = {
                                table: TRANSFER_QUEUE,
                                where: {
                                    is_member_of_collection: is_member_of_collection,
                                    transfer_uuid: object.transfer_uuid,
                                    status: 0
                                },
                                update: {
                                    message: json.status,
                                    microservice: json.microservice
                                },
                                callback: function (data) {

                                    if (data !== 1) {
                                        // TODO: log update error
                                        console.log(data);
                                        throw 'Database transfer queue error';
                                    }
                                }
                            };

                            // Update transfer status
                            updateQueue(transferProcessingObj);

                        } else {

                            let transferUnknownErrorObj = {
                                table: TRANSFER_QUEUE,
                                update: {
                                    message: json.status,
                                    microservice: json.microservice,
                                    status: 1
                                },
                                callback: function (data) {

                                    if (data !== 1) {
                                        // TODO: log update error
                                        console.log(data);
                                        throw 'Database transfer queue error';
                                    }
                                }
                            };

                            // Update transfer status
                            updateQueue(transferUnknownErrorObj);
                        }
                    });
                });

            }, TRANSFER_STATUS_CHECK);

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Updating transfer queue.'
    });
};

/**
 * Checks ingest status and updates queue based on stage of ingest
 * STEP 3
 * @param req
 * @param callback
 */
exports.get_ingest_status = function (req, callback) {

    let sip_uuid = req.query.sip_uuid;

    let timer = setInterval(function () {

        if (sip_uuid === undefined) {
            console.log('sip uuid problem');
            return false;
        }

        archivematica.get_ingest_status(sip_uuid, function (results) {

            var json = JSON.parse(results);

            if (json.status === 'COMPLETE') {

                let importCompleteQueue = {
                    table: INGEST_QUEUE,
                    where: {
                        sip_uuid: json.uuid,
                        status: 0
                    },
                    update: {
                        message: 'IMPORT_COMPLETE',
                        microservice: json.microservice
                    },
                    callback: function (data) {

                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database transfer queue error';
                        }

                        setTimeout(function () {

                            let importStatusChange = {
                                table: INGEST_QUEUE,
                                where: {
                                    sip_uuid: json.uuid,
                                    status: 0
                                },
                                update: {
                                    status: 1
                                },
                                callback: function (data) {

                                    if (data !== 1) {
                                        // TODO: log update error
                                        console.log(data);
                                        throw 'Database ingest queue error';
                                    }

                                    console.log('Begin DuraCloud import...');

                                    // Initiate duraCloud import
                                    request.get({
                                        url: config.apiUrl + '/api/admin/v1/import/import_dip?sip_uuid=' + json.uuid
                                    }, function (error, httpResponse, body) {

                                        if (error) {
                                            console.log(error);
                                            throw error;
                                        }

                                        if (httpResponse.statusCode !== 200) {

                                            // TODO: log
                                            // TODO: update queue
                                            throw 'Unable to start duracloud object imports';
                                        }

                                        console.log(body);
                                    });
                                }
                            };

                            // Update queue status
                            updateQueue(importStatusChange);

                        }, DURACLOUD_IMPORT_START_TIMEOUT);

                        return null;
                    }
                };

                clearInterval(timer);
                updateQueue(importCompleteQueue);

            } else if (json.status === 'FAILED' || json.status === 'REJECTED' || json.status === 'USER_INPUT') {

                let importFailed = {
                    table: INGEST_QUEUE,
                    where: {
                        sip_uuid: json.uuid,
                        status: 0
                    },
                    update: {
                        message: json.status,
                        microservice: json.microservice,
                        status: 1
                    },
                    callback: function (data) {

                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database ingest queue error (importFailed)';
                        }
                    }
                };

                updateQueue(importFailed);

            } else if (json.status === 'PROCESSING') {

                let importProcessing = {
                    table: INGEST_QUEUE,
                    where: {
                        sip_uuid: json.uuid,
                        status: 0
                    },
                    update: {
                        message: json.status,
                        microservice: json.microservice
                    },
                    callback: function (data) {

                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database ingest queue error (importProcessing)';
                        }
                    }
                };

                updateQueue(importProcessing);

            } else {

                let importUnknownError = {
                    table: INGEST_QUEUE,
                    where: {
                        sip_uuid: json.uuid,
                        status: 0
                    },
                    update: {
                        message: json.status,
                        microservice: json.microservice,
                        status: 1
                    },
                    callback: function (data) {

                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database ingest queue error (importUnknownError)';
                        }
                    }
                };

                // unknown error
                updateQueue(importUnknownError);
            }
        });

    }, INGEST_STATUS_CHECK_TIME);

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Import started.'
    });
};

/**
 * Imports DuraCloud stored objects
 * STEP 4
 * @param req
 * @param callback
 */
exports.import_dip = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    archivematica.get_dip_path(sip_uuid, function (dip_path) {

        knexQ(INGEST_QUEUE)
            .select('*')
            .where({
                sip_uuid: sip_uuid,
                status: 1
            })
            .limit(1)
            .then(function (data) {

                // Check if sip uuid already exist
                knexQ(IMPORT_QUEUE)
                    .count('sip_uuid as count')
                    .where({
                        sip_uuid: sip_uuid
                    })
                    .then(function (sipUuidCount) {

                        if (sipUuidCount[0].count === 1) {
                            return false;
                        }

                        data[0].dip_path = dip_path;

                        duracloud.get_mets(data, function (results) {

                            if (results.error === true) {

                                let importErrorObj = {
                                    table: IMPORT_QUEUE,
                                    where: {
                                        status: 0,
                                        sip_uuid: sip_uuid,
                                        type: 'xml'
                                    },
                                    update: {
                                        message: 'ERROR_UNABLE_TO_GET_OBJECT',
                                        status: 1
                                    },
                                    callback: function (data) {

                                        if (data !== 1) {
                                            // TODO: log update error
                                            console.log(data);
                                            throw 'Database duracloud import queue error (importErrorObj)';
                                        }
                                    }
                                };

                                updateQueue(importErrorObj);

                                return false;
                            }

                            // Extract values from DuraCloud METS.xml file
                            let metsResults = metslib.process_mets(results.sip_uuid, data[0].dip_path, data[0].transfer_uuid, data[0].is_member_of_collection, results.mets);

                            // Save to queue
                            let chunkSize = metsResults.length;
                            knexQ.batchInsert(IMPORT_QUEUE, metsResults, chunkSize)
                                .then(function (data) {
                                    // Start processing XML
                                    process_duracloud_queue_xml(results.sip_uuid);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    throw error;
                                });

                            return null;
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                        throw error;
                    });

                return null;
            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });
    });

    callback({
        status: 200,
        content_type: {'Content-Type': 'application/json'},
        message: 'Processing DIP.'
    });
};

/**
 * Processes MODS XML record retrieved from DuraCloud
 * import helpers
 * @param sip_uuid
 */
var process_duracloud_queue_xml = function (sip_uuid) {

    knexQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'xml',
            status: 0
        })
        .then(function (data) {

            const GET_OBJECT_TIMER = 3000;
            let is_member_of_collection = data[0].is_member_of_collection;

            let timer = setInterval(function () {

                if (data.length === 0) {

                    clearInterval(timer);

                    let importCompleteQueue = {
                        table: IMPORT_QUEUE,
                        where: {
                            status: 0,
                            sip_uuid: sip_uuid,
                            type: 'xml'
                        },
                        update: {
                            message: 'COMPLETE',
                            status: 1
                        },
                        callback: function (data) {

                            if (data !== 1) {
                                // TODO: log update error
                                console.log(data);
                                throw 'Database duracloud import queue error (importCompleteQueue)';
                            }
                        }
                    };

                    // Update queue status
                    updateQueue(importCompleteQueue);

                    return false;
                }

                var object = data.pop();
                var file = object.file;

                duracloud.get_object(object, function (results) {

                    function get_pid(callback) {
                        pids.get_next_pid(function (pid) {
                            callback(null, {pid: pid});
                        });
                    }

                    function get_handle(obj, callback) {
                        handles.create_handle(obj.pid, function (handle) {

                            if (handle.error !== undefined && handle.error === true) {
                                obj.handle = handle.message;
                                callback(null, obj);
                                return false;
                            }

                            obj.handle = handle;
                            callback(null, obj);
                        });
                    }

                    async.waterfall([
                        get_pid,
                        get_handle
                    ], function (err, results) {

                        var recordObj = {};
                        recordObj.pid = results.pid;
                        recordObj.handle = results.handle;
                        recordObj.is_member_of_collection = is_member_of_collection;
                        // The xml file name will be overwritten by the object file name
                        recordObj.file_name = file;

                        let importObj = {
                            table: IMPORT_QUEUE,
                            where: {
                                sip_uuid: sip_uuid
                            },
                            update: {
                                pid: recordObj.pid,
                                handle: recordObj.handle
                            },
                            callback: function (data) {

                                if (data < 1) {
                                    // TODO: log update error
                                    console.log(data);
                                    throw 'Database duracloud import queue error (pid/handle)';
                                }

                                // Check if pid already exist
                                knex(REPO_OBJECTS)
                                    .count('pid as count')
                                    .where({
                                        pid: recordObj.pid
                                    })
                                    .then(function (data) {

                                        // if the record exist, skip the next step
                                        if (data[0].count > 0) {

                                            let pidErrorObj = {
                                                table: IMPORT_QUEUE,
                                                where: {
                                                    pid: recordObj.pid,
                                                    status: 0
                                                },
                                                update: {
                                                    message: 'ERROR_PID_ALREADY_EXIST_(conflict)',
                                                    status: 1
                                                },
                                                callback: function (data) {

                                                    clearInterval(timer);

                                                     if (data === 0) {
                                                        // TODO: log update error
                                                        console.log(data);
                                                        throw 'Database duracloud import queue error (PID conflict)';
                                                     }
                                                }
                                            };

                                            updateQueue(pidErrorObj);

                                            return false;

                                        }

                                        knex(REPO_OBJECTS)
                                            .insert(recordObj)
                                            .then(function (data) {
                                                // Process xml (Extract mods, validate and save to DB)
                                                process_xml(recordObj);
                                                // Start processing object associated with XML record
                                                process_duracloud_queue_objects(sip_uuid, results.pid, file);

                                                return null;
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                throw error;
                                            });

                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        throw error;
                                    });

                                return null;
                            }
                        };

                        // Update queue status
                        updateQueue(importObj);

                        return null;
                    });
                });

            }, GET_OBJECT_TIMER);

            return null;
        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
};

/**
 * Processes objects retrieved from duraCloud
 * @param sip_uuid
 * @param pid
 * @param file
 * @returns {boolean}
 */
var process_duracloud_queue_objects = function (sip_uuid, pid, file) {

    const GET_OBJECT_TIMER = 5000;
    let tmpArr = file.split('.'),
        file_id;

    tmpArr.pop();
    file_id = tmpArr.join('.');

    // Get associated object
    knexQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            file_id: file_id,
            type: 'object',
            status: 0
        })
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length === 0) {

                    clearInterval(timer);

                    var importObj = {
                        table: IMPORT_QUEUE,
                        where: {
                            status: 0,
                            sip_uuid: sip_uuid,
                            file_id: file_id,
                            type: 'object'
                        },
                        update: {
                            status: 1,
                            message: 'COMPLETE'
                        },
                        callback: function (data) {

                            if (data !== 1) {
                                // TODO: log update error
                                console.log(data);
                                throw 'Database duracloud import queue error';
                            }
                        }
                    };

                    // Update queue status
                    updateQueue(importObj);

                    return null;
                }

                var object = data.pop();

                duracloud.get_object(object, function (results) {

                    var recordObj = {};
                    recordObj.pid = pid;
                    recordObj.sip_uuid = sip_uuid;
                    recordObj.transfer_uuid = object.transfer_uuid;
                    recordObj.file_name = object.dip_path + '/objects/' + object.uuid + '-' + results.file;
                    recordObj.checksum = results.headers['content-md5'];
                    recordObj.file_size = results.headers['content-length'];

                    if (!fs.existsSync('./tmp/' + results.file)) {
                        console.log('File ' + results.file + ' does not exist.');
                        throw 'File ' + results.file + ' does not exist.';
                    }

                    let tmp = shell.exec('file --mime-type ./tmp/' + results.file).stdout;
                    let mimetypetmp = tmp.split(':');

                    recordObj.mime_type = mimetypetmp[1].trim();
                    recordObj.thumbnail = object.uuid + '.jpg';

                    knex(REPO_OBJECTS)
                        .where({
                            pid: recordObj.pid,
                            object_type: 'object'
                        })
                        .update({
                            sip_uuid: recordObj.sip_uuid,
                            transfer_uuid: recordObj.transfer_uuid,
                            file_name: recordObj.file_name,
                            checksum: recordObj.checksum,
                            file_size: recordObj.file_size,
                            mime_type: recordObj.mime_type,
                            thumbnail: object.dip_path + '/thumbnails/' + recordObj.thumbnail
                        })
                        .then(function (data) {

                            if (data !== 1) {
                                // TODO: log update error
                                console.log(data);
                                throw 'Database object queue error';
                            }

                            recordObj = {};
                        })
                        .catch(function (error) {
                            console.log(error);
                            throw error;
                        });
                });

            }, GET_OBJECT_TIMER);

            return null;
        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });

    return false;
};

/**
 * Processes MODS XML retrieved from DuraCloud
 * @param obj
 * @returns {boolean}
 */
var process_xml = function (obj) {

    let file = './tmp/' + obj.file_name,
        validate_xml_command = './libs/xsd-validator/xsdv.sh ./libs/xsd-validator/mods-3-6.xsd.xml ' + file;

    // check if object folder exists
    if (!fs.existsSync(file)) {
        // TODO: error
        // TODO: log
        console.log('ERROR: File not found.');
        throw 'ERROR: File not found.';
    }

    console.log('Validating ' + obj.pid + '...');
    shell.exec(validate_xml_command, function (code, stdout, stderr) {

        // TODO: log
        // console.log(stdout);

        if (code !== 0) {
            console.log(stderr);
            // TODO: log
            throw stderr;
        }

        // read file content
        fs.readFile(file, {encoding: 'utf-8'}, function (error, mods_original) {

            if (error) {
                console.log(error);
                // TODO: log
                throw error;
            }

            var mods = modslib.process_mods(mods_original);

            console.log('Saving mods.');

            knex(REPO_OBJECTS)
                .where({
                    pid: obj.pid
                })
                .update({
                    mods: mods,
                    mods_original: mods_original
                })
                .then(function (data) {

                    if (data !== 1) {
                        // TODO: log update error
                        console.log(data);
                        throw 'Database MODS error';
                    }

                    console.log('MODS saved. ', data);

                    return null;

                })
                .catch(function (error) {
                    console.log(error);
                    throw error;
                });
        });
    });

    return false;
};

/**
 * Updates queues
 * @param obj
 * @returns {null}
 */
var updateQueue = function (obj) {

    knexQ(obj.table)
        .where(obj.where)
        .update(obj.update)
        .then(obj.callback)
        .catch(function (error) {
            // TODO: log
            console.log(error);
            throw error;
        });

    return false;
};