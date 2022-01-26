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

const CONFIG = require('../config/config'),
    FS = require('fs'),
    MODS = require('../libs/display-record'),
    METS = require('../libs/mets'),
    TRANSFER_INGEST = require('../libs/transfer-ingest'),
    MIME_TYPE = require('../libs/mime-types'),
    MANIFEST = require('../libs/manifest'),
    HANDLES = require('../libs/handles'),
    ARCHIVEMATICA = require('../libs/archivematica'),
    DURACLOUD = require('../libs/duracloud'),
    TRANSCRIPTS = require('../libs/transcripts'),
    LOGGER = require('../libs/log4'),
    ASYNC = require('async'),
    MOMENT = require('moment'),
    HTTP = require('../libs/http'),
    DBQ = require('../config/dbqueue')(),
    SERVICE = require('../import/service'),
    TRANSFER_APPROVAL_TIMER = CONFIG.transferApprovalTimer,
    TRANSFER_STATUS_CHECK_INTERVAL = CONFIG.transferStatusCheckInterval,
    INGEST_STATUS_CHECK_INTERVAL = CONFIG.ingestStatusCheckInterval,
    TRANSFER_QUEUE = 'tbl_archivematica_queue',
    IMPORT_QUEUE = 'tbl_duracloud_queue',
    FAIL_QUEUE = 'tbl_fail_queue';

/**
 * Gets list of folders from Archivematica sftp server
 * @param req (query.collection)
 * @param callback
 */
exports.list = function (req, callback) {

    DBQ(TRANSFER_QUEUE)
        .count('id as count')
        .then(function (data) {

            if (data[0].count === 0) {

                let query = req.query.collection;

                ARCHIVEMATICA.list(query, function (results) {

                    if (results.error !== undefined && results.error === true) {

                        LOGGER.module().fatal('FATAL: [/import/queue module (list)] unable to get files from Archivematica SFTP server');

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
            LOGGER.module().fatal('FATAL: [/import/queue module (list)] queue progress check failed ' + error);
            throw 'FATAL: [/import/queue module (list)] queue progress check failed ' + error;
        });
};

/**
 * Saves import data to queue and initiates import process
 * NOTE: Ingest begins automatically after a successful transfer and approval
 * STEP 1
 * @param req (body.collection, body.objects, body.user)
 * @param callback
 */
exports.queue_objects = function (req, callback) {

    if (req.body === undefined) {

        LOGGER.module().error('ERROR: [/import/queue module (queue_objects)] missing payload body. unable to start ingest process');

        callback({
            status: 404,
            message: 'Nothing to see here...',
            data: []
        });

        return false;
    }

    let transfer_data = req.body;

    /*
     Checks if collection exists
     function called by async
     */
    const check_collection = function (callback) {

        TRANSFER_INGEST.check_collection(transfer_data.collection, function (result) {

            /*
             if collection does not exist set status to false in order to terminate ingest of objects
             */
            if (result === false) {
                transfer_data.collection_status = false;
                callback(null, transfer_data);
            } else {
                callback(null, transfer_data);
            }

        });
    };

    /*
     Saves import data to queue
     function called by async
     */
    const save_transfer_records = function (obj, callback) {

        if (obj.collection_status !== undefined && obj.collection_status === false) {
            callback(null, obj);
            return false;
        }

        LOGGER.module().info('INFO: [/import/queue module (queue_objects/start_transfer)] starting ingest process');

        /*
         Saves transfer data to queue
         */
        TRANSFER_INGEST.save_transfer_records(transfer_data, function (result) {

            if (result.recordCount === 0) {

                LOGGER.module().FATAL('FATAL: [/import/queue module (queue_objects/start_transfer/TRANSFER_INGEST.save_transfer_records)] unable to save records to ingest queue');

                let failObj = {
                    is_member_of_collection: obj.collection.replace('_', ':'),
                    message: 'FATAL: [/import/queue module (queue_objects/start_transfer/TRANSFER_INGEST.save_transfer_records)]Unable to save records to ingest queue'
                };

                TRANSFER_INGEST.save_to_fail_queue(failObj);
                return false;
            }

            /*
             Send request to start transfer
             */
            (async() => {

                let data = {
                    'collection': transfer_data.collection
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/import/start_transfer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().fatal('FATAL: [/import/queue module (queue_objects/start_transfer/TRANSFER_INGEST.save_transfer_records)] unable to begin transfer.');
                } else if (response.data.status === 200) {
                    return false;
                }

            })();
        });
    };

    ASYNC.waterfall([
        check_collection,
        save_transfer_records
    ], function (error, obj) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/queue module (queue_objects/async.waterfall)] ' + error);
        }

        if (obj.collection_status !== undefined && obj.collection_status === false) {

            let failObj = {
                is_member_of_collection: obj.collection.replace('_', ':'),
                message: 'Unable to move forward with import due to incorrect collection pid.'
            };

            TRANSFER_INGEST.save_to_fail_queue(failObj);
        }

        LOGGER.module().info('INFO: [/import/queue module (queue_objects/async.waterfall)] transfer records queued');

        return false;
    });

    callback({
        status: 200,
        message: 'Queuing objects.'
    });
};

/**
 * Starts Archivematica transfer process
 * STEP 2
 * @param req
 * @param callback
 */
exports.start_transfer = function (req, callback) {

    LOGGER.module().info('INFO: [/import/queue module (start_transfer)] starting transfer (start_transfer)');

    let collection = req.body.collection;

    if (collection === undefined) {

        LOGGER.module().fatal('FATAL: [/import/queue module (start_transfer)] collection undefined. unable to start transfer');

        let failObj = {
            is_member_of_collection: 'No collection',
            message: 'Collection undefined. unable to start transfer.'
        };

        TRANSFER_INGEST.save_to_fail_queue(failObj);

        callback({
            status: 400,
            message: 'Unable to start transfer.'
        });

        return false;
    }

    TRANSFER_INGEST.start_transfer(collection, function (object) {

        /*
         Initiates file transfer on Archivematica service
         */
        ARCHIVEMATICA.start_transfer(object, function (response) {

            if (response.error !== undefined && response.error === true) {

                LOGGER.module().fatal('FATAL: [/import/queue module (start_transfer/TRANSFER_INGEST.start_transfer/archivematica.start_transfer)] transfer error ' + response);

                let failObj = {
                    is_member_of_collection: collection,
                    message: response
                };

                TRANSFER_INGEST.save_to_fail_queue(failObj);
                TRANSFER_INGEST.clear_queue_record({
                    is_member_of_collection: collection
                }, function (result) {

                    if (result === true) {
                        TRANSFER_INGEST.restart_import();
                    }

                });

                throw 'FATAL: [/import/queue module (start_transfer/TRANSFER_INGEST.start_transfer/archivematica.start_transfer)] transfer error ' + response;
            }

            TRANSFER_INGEST.confirm_transfer(response, object.id);

            /*
             Give transfer time to complete before approving it
             */
            setTimeout(function () {

                /*
                 Send request to approve transfer
                 */
                (async() => {

                    let data = {
                        'collection': collection
                    };

                    let response = await HTTP.post({
                        endpoint: '/api/admin/v1/import/approve_transfer',
                        data: data
                    });
                    console.log('transfer approval response: ', response);
                    if (response.error === true) {
                        LOGGER.module().fatal('FATAL: [/import/queue module (start_transfer/TRANSFER_INGEST.start_transfer/archivematica.start_transfer)] http error. unable to approve transfer.');
                        throw 'FATAL: [/import/queue module (start_transfer/TRANSFER_INGEST.start_transfer/archivematica.start_transfer)] http error. unable to approve transfer.';
                    } else if (response.data.status === 200) {
                        return false;
                    }

                })();

            }, TRANSFER_APPROVAL_TIMER);
        });
    });

    callback({
        status: 200,
        message: 'Starting transfers.'
    });
};

/**
 * Approves transfer
 * STEP 3
 * @param req
 * @param callback
 */
exports.approve_transfer = function (req, callback) {

    let collection = req.body.collection;

    if (collection === undefined) {

        LOGGER.module().error('ERROR: [/import/queue module (approve_transfer)] collection undefined');

        callback({
            status: 400,
            message: 'Unable to start transfer.'
        });

        return false;
    }

    /*
     Gets transferred record from queue
     */
    TRANSFER_INGEST.get_transferred_record(collection, function (object) {

        ARCHIVEMATICA.approve_transfer(object.transfer_folder, function (response) {

            TRANSFER_INGEST.confirm_transfer_approval(response, object, function (result) {

                if (result.error !== undefined && result.error === true) {

                    LOGGER.module().error('ERROR: [/import/queue module (approve_transfer/TRANSFER_INGEST.get_transferred_record/archivematica.approve_transfer/TRANSFER_INGEST.confirm_transfer_approval)] unable to confirm transfer approval ' + result);

                    let failObj = {
                        is_member_of_collection: collection,
                        transfer_uuid: object.transfer_uuid,
                        message: 'Transfer not approved ' + object.transfer_folder
                    };

                    TRANSFER_INGEST.save_to_fail_queue(failObj);
                    TRANSFER_INGEST.clear_queue_record({
                        transfer_uuid: object.transfer_uuid
                    }, function (result) {
                        if (result === true) {
                            TRANSFER_INGEST.restart_import();
                        }
                    });

                    return false;
                }

                LOGGER.module().info('INFO: [/import/queue module (approve_transfer/TRANSFER_INGEST.get_transferred_record/archivematica.approve_transfer/TRANSFER_INGEST.confirm_transfer_approval)] transfer approved');

                /*
                 Send request to begin transfer status checks
                 */
                (async () => {

                    let params = {
                        collection: result.is_member_of_collection,
                        transfer_uuid: result.transfer_uuid
                    };

                    let response = await HTTP.get({
                        endpoint: '/api/admin/v1/import/transfer_status',
                        params: params
                    });

                    if (response.error === true) {
                        LOGGER.module().fatal('FATAL: [/import/queue module (approve_transfer/TRANSFER_INGEST.get_transferred_record/archivematica.approve_transfer/TRANSFER_INGEST.confirm_transfer_approval)] http error ' + error);
                        throw 'FATAL: [/import/queue module (approve_transfer/TRANSFER_INGEST.get_transferred_record/archivematica.approve_transfer/TRANSFER_INGEST.confirm_transfer_approval)] http error ' + error;
                    } else if (response.data.status === 200) {
                        return false;
                    }

                })();
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

    /*
        ** Axios is duplicating the values in the query string (creates an array)
        * This is a workaround or that issue...
     */
    var is_member_of_collection,
        transfer_uuid;

    if (typeof req.query.collection !== 'string') {
        is_member_of_collection = req.query.collection.pop();
        transfer_uuid = req.query.transfer_uuid.pop();
    } else {
        is_member_of_collection = req.query.collection;
        transfer_uuid = req.query.transfer_uuid;
    }

    if (is_member_of_collection === undefined || transfer_uuid === undefined) {
        LOGGER.module().error('ERROR: [/import/queue module (get_transfer_status)] unable to start transfer checks');
        callback({
            status: 400,
            message: 'Unable to start transfer checks.'
        });

        return false;
    }

    LOGGER.module().info('INFO: [/import/queue module (get_transfer_status)] checking transfer status');

    /*
     Check transfer status every few seconds
     */
    let timer = setInterval(function () {

        ARCHIVEMATICA.get_transfer_status(transfer_uuid, function (response) {

            /*
             Updates import queue
             */
            TRANSFER_INGEST.update_transfer_status(response, function (result) {

                if (result.error !== undefined && result.error === true) {

                    LOGGER.module().error('ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/TRANSFER_INGEST.update_transfer_status)] transfer status : ' + result.message);
                    clearInterval(timer);

                    let failObj = {
                        is_member_of_collection: '',
                        transfer_uuid: transfer_uuid,
                        message: 'Transfer status: ' + result.message
                    };

                    TRANSFER_INGEST.save_to_fail_queue(failObj);
                    return false;
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);

                    // Send request to begin ingest status checks
                    (async () => {

                        let response = await HTTP.get({
                            endpoint: '/api/admin/v1/import/ingest_status',
                            params: {
                                sip_uuid: result.sip_uuid
                            }
                        });

                        if (response.error === true) {
                            LOGGER.module().error('ERROR: [/import/queue module (get_transfer_status/archivematica.get_transfer_status/TRANSFER_INGEST.update_transfer_status)] http error.');
                        } else if (response.data.status === 200) {

                            setTimeout(function () {
                                ARCHIVEMATICA.clear_transfer(transfer_uuid);
                            }, 5000);

                            return false;
                        }

                    })();

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

    /*
        ** Axios is duplicating the values in the query string (creates an array)
        * This is a workaround or that issue...
     */
    let sip_uuid;

    if (typeof req.query.sip_uuid !== 'string') {
        sip_uuid = req.query.sip_uuid.pop();
    } else {
        sip_uuid = req.query.sip_uuid;
    }

    if (sip_uuid === undefined) {
        LOGGER.module().error('ERROR: [/import/queue module (get_ingest_status)] sip uuid undefined');
        callback({
            status: 400,
            message: 'Unable to start ingest checks.'
        });

        return false;
    }

    LOGGER.module().info('INFO: [/import/queue module (get_ingest_status)] checking ingest status');

    /*
     Check ingest status every few seconds
     */
    let timer = setInterval(function () {

        ARCHIVEMATICA.get_ingest_status(sip_uuid, function (response) {

            /*
             Updates import queue
             */
            TRANSFER_INGEST.update_ingest_status(response, sip_uuid, function (result) {

                if (result.error !== undefined && result.error === true) {

                    LOGGER.module().error('ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/TRANSFER_INGEST.update_ingest_status)] unable to update ingest status');

                    let failObj = {
                        is_member_of_collection: '',
                        sip_uuid: sip_uuid,
                        message: 'Ingest status: ' + result.message
                    };

                    TRANSFER_INGEST.save_to_fail_queue(failObj);
                    return false;
                }

                if (result.complete !== undefined && result.complete === true) {

                    clearInterval(timer);

                    /*
                     Send request to import DIP data
                     */
                    (async () => {

                        let params = {
                            sip_uuid: result.sip_uuid
                        };

                        let response = await HTTP.get({
                            endpoint: '/api/admin/v1/import/import_dip',
                            params: params
                        });

                        if (response.error === true) {
                            LOGGER.module().error('ERROR: [/import/queue module (get_ingest_status/archivematica.get_ingest_status/TRANSFER_INGEST.update_ingest_status)] import dip request error.');
                        } else if (response.data.status === 200) {
                            return false;
                        }

                    })();

                    return false;
                }

                if (result.complete !== undefined && result.complete === false) {
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

    var sip_uuid;

    if (typeof req.query.sip_uuid !== 'string') {
        sip_uuid = req.query.sip_uuid.pop();
    } else {
        sip_uuid = req.query.sip_uuid;
    }

    if (sip_uuid === undefined) {

        LOGGER.module().error('ERROR: [/import/queue module (import_dip)] sip_uuid is undefined');

        callback({
            status: 400,
            message: 'Unable to start duracloud import.'
        });

        return false;
    }

    ARCHIVEMATICA.get_dip_path(sip_uuid, function (dip_path) {

        if (dip_path.error !== undefined && dip_path.error === true) {
            LOGGER.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path)] dip path error ' + dip_path.error.message);
            throw 'ERROR: [/import/queue module (import_dip/archivematica.get_dip_path)] dip path error ' + dip_path.error.message;
        }

        let data = {
            sip_uuid: sip_uuid,
            dip_path: dip_path
        };

        DURACLOUD.get_mets(data, function (response) {

            if (response.error !== undefined && response.error === true) {

                LOGGER.module().error('ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets');

                let failObj = {
                    is_member_of_collection: '',
                    sip_uuid: data.sip_uuid,
                    message: response
                };

                TRANSFER_INGEST.save_to_fail_queue(failObj);
                TRANSFER_INGEST.clear_queue_record({
                    sip_uuid: data.sip_uuid
                }, function (result) {
                    if (result === true) {
                        TRANSFER_INGEST.restart_import();
                    }
                });

                throw 'ERROR: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets)] unable to get mets';
            }

            /*
            FS.writeFile('./tmp/mets.xml', response.mets, function (error) {
                console.log('mets saved.');
            });
            */

            let metsResults = METS.process_mets(sip_uuid, dip_path, response.mets);

            TRANSFER_INGEST.save_mets_data(metsResults, function (result) {

                if (result === 'done') {

                    /*
                     Send request to create repository record
                     */
                    (async () => {

                        let params = {
                            sip_uuid: sip_uuid
                        };

                        let response = await HTTP.get({
                            endpoint: '/api/admin/v1/import/create_repo_record',
                            params: params
                        });

                        if (response.error === true) {
                            LOGGER.module().fatal('FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/TRANSFER_INGEST.save_mets_data)] create repo record request error.');
                            throw 'FATAL: [/import/queue module (import_dip/archivematica.get_dip_path/duracloud.get_mets/TRANSFER_INGEST.save_mets_data)] create repo record request error.';
                        } else if (response.data.status === 200) {
                            return false;
                        }

                    })();
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
 * Creates repository record
 * STEP 7
 */
exports.create_repo_record = function (req, callback) {

    var sip_uuid = req.query.sip_uuid;

    if (sip_uuid === undefined || sip_uuid === null) {
        // no need to move forward if sip_uuid is missing
        // TODO: log to fail queue - DELETE object from Archivematica
        LOGGER.module().error('ERROR: [/import/queue module (create_repo_record)] sip uuid undefined');

        callback({
            status: 400,
            message: 'Unable to create repository record.'
        });

        return false;
    }

    // 1.) get collection record from queue using sip_uuid
    function get_collection(callback) {

        TRANSFER_INGEST.get_collection(sip_uuid, function (result) {

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

        TRANSFER_INGEST.get_uri_txt(obj.sip_uuid, function (data) {

            // uri.txt is not present
            if (data.length === 0) {

                obj.sip_uuid = sip_uuid;
                obj.dip_path = null;
                obj.file = null;
                obj.uuid = null;
                LOGGER.module().error('ERROR: [/import/queue module (get_uri_txt/TRANSFER_INGEST.get_uri_txt)] unable to get uri txt');
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
            LOGGER.module().error('ERROR: [/import/queue module (get_object_uri_data)] unable to get uri data - dip_path is null');
            callback(null, obj);
            return false;
        }

        // downloads uri.txt file
        DURACLOUD.get_uri(obj, function (response) {
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

        TRANSFER_INGEST.save_mods_id(obj.mods_id, obj.sip_uuid, function (result) {
            callback(null, obj);
        });
    }

    // 5.)
    function get_object(obj, callback) {

        TRANSFER_INGEST.get_object(obj.sip_uuid, function (data) {

            if (data.length === 0) {
                obj.dip_path = null;
                obj.file = null;
                obj.uuid = null;
                LOGGER.module().error('ERROR: [/import/queue module (get_object/TRANSFER_INGEST.get_object)] unable to get object - dip_path is null');
                callback(null, obj);
                return false;
            }

            // gets object data from db
            let dc_data = data.pop();
            obj.dip_path = dc_data.dip_path;
            obj.file = dc_data.file;
            obj.uuid = dc_data.uuid;
            console.log('dc data mime type: ', dc_data.mime_type);
            if (dc_data.mime_type === undefined || dc_data.mime_type === null) {
                obj.mime_type = MIME_TYPE.get_mime_type(obj.file);
            } else {
                obj.mime_type = dc_data.mime_type;
            }

            callback(null, obj);
        });
    }

    // 6.)
    function get_manifest(obj, callback) {

        if (obj.dip_path === null) {
            obj.checksum = null;
            obj.file_size = null;
            obj.file_name = null;
            obj.thumbnail = null;
            obj.mime_type = null;
            LOGGER.module().error('ERROR: [/import/queue module (get_object_file_data)] unable to get object file data - dip_path is null');
            callback(null, obj);
            return false;
        }

        // if unable to get mime type from mets, check file extension
        if (obj.mime_type === undefined) {
            LOGGER.module().info('INFO: [/import/queue module (create_repo_record/get_object_file_data)] failed to get mime type from METS');
            obj.mime_type = MIME_TYPE.get_mime_type(obj.file);
        }

        /*
         Get dura-manifest xml document
         */
        DURACLOUD.get_object_manifest(obj, function (response) {

            /*
             if manifest is not present proceed with retrieving data
             */
            if (response.error !== undefined && response.error === true) {

                LOGGER.module().info('INFO: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_manifest)] object does not have a manifest');

                obj.manifest = false;
                callback(null, obj);
                return false;

            } else {

                let manifest = MANIFEST.process_manifest(response);
                console.log('obj.file in manifest: ', obj.file);
                obj.file_name = obj.dip_path + '/objects/' + obj.uuid + '-' + obj.file + '.dura-manifest';
                obj.thumbnail = obj.dip_path + '/thumbnails/' + obj.uuid + '.jpg';
                obj.manifest = true;

                if (manifest.length > 0) {
                    obj.checksum = manifest[0].checksum;
                    obj.file_size = manifest[0].file_size;
                } else {
                    obj.checksum = null;
                    obj.file_size = null;
                    LOGGER.module().error('ERROR: [/import/queue module (get_object_manifest)] unable to get data from manifest');
                }

                callback(null, obj);
                return false;
            }
        });
    }

    // 7.)
    function get_duracloud_object(obj, callback) {

        if (obj.manifest === true) {
            delete obj.manifest;
            callback(null, obj);
            return false;
        }

        delete obj.manifest;

        setTimeout(function () {

            // gets headers only
            DURACLOUD.get_object_info(obj, function (response) {

                if (response.error === true) {

                    LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_info)] Unable to get duracloud object ' + response.error_message);

                    let failObj = {
                        is_member_of_collection: '',
                        sip_uuid: sip_uuid,
                        message: 'ERROR: [/import/queue module (create_repo_record/get_object_file_data/duracloud.get_object_info)] Unable to get duracloud object ' + response.error_message
                    };

                    obj.failed = true;
                    TRANSFER_INGEST.save_to_fail_queue(failObj);
                    TRANSFER_INGEST.clear_queue_record({
                        sip_uuid: sip_uuid
                    }, function (result) {
                        if (result === true) {
                            callback(null, obj);
                        }
                    });

                    return false;
                }

                obj.checksum = response.headers['content-md5'];
                obj.file_size = response.headers['content-length'];
                obj.file_name = obj.dip_path + '/objects/' + obj.uuid + '-' + obj.file;
                obj.thumbnail = obj.dip_path + '/thumbnails/' + obj.uuid + '.jpg';
                obj.full_path = obj.file_name;
                obj.object_name = obj.uuid + '-' + obj.file;

                delete obj.full_path;
                delete obj.object_name;
                callback(null, obj);
            });

        }, 20000);

        return false;
    }

    // 8.)
    function get_token(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (FS.existsSync('./tmp/st.txt')) {

            let st_file = FS.statSync('./tmp/st.txt'),
                now = MOMENT().startOf('day'),
                st_created_date_time = MOMENT(st_file.birthtime),
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
                FS.readFile('./tmp/st.txt', {encoding: 'utf-8'}, function (error, data) {

                    if (error) {
                        LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_token)] unable to read session token file ' + error);
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
         * Makes request to archivesspace to generate new session token
         */
        function new_token() {

            (async() => {

                let response = await HTTP.get({
                    endpoint: '/api/admin/v1/import/metadata/session'
                });

                if (response.error === true) {
                    obj.session = null;
                    callback(null, obj);
                    return false;
                } else {

                    try {

                        let token = {
                            session: response.data.session
                        };

                        FS.writeFile('./tmp/st.txt', token.session, function (error) {

                            if (error) {
                                LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_token/ARCHIVESSPACE.get_session_token)] unable to save session token to file');
                                callback({
                                    error: true,
                                    error_message: error
                                });
                            }

                            if (!FS.existsSync('./tmp/st.txt')) {
                                LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_token/ARCHIVESSPACE.get_session_token)] st.txt was not created');
                                obj.session = null;
                                callback(null, obj);
                                return false;
                            }

                            obj.session = token.session;
                            callback(null, obj);
                            return false;

                        });

                    } catch (error) {
                        LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_token/ARCHIVESSPACE.get_session_token)] session token error ' + error);
                        obj.session = null;
                        callback(null, obj);
                        return false;
                    }
                }

            })();
        }
    }

    // 9.)
    function get_mods(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        // skip mods retrieval if session is not available
        if (obj.session === null) {
            obj.mods = null;
            callback(null, obj);
            return false;
        }

        SERVICE.get_mods(obj, function(data) {

            if (data.error === true) {
                obj.mods = null;
                callback(null, obj);
                return false;
            }

            obj.mods = data.mods;
            callback(null, obj);
        });
    }

    // 10.)
    function get_handle(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (obj.pid === null) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

        HANDLES.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/get_handle/handles.create_handle)] handle error ' + handle.message);
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    // 11.)
    function get_transcript(obj, callback) {

        TRANSCRIPTS.get(obj, function (result) {

            if (result === 'no_transcript') {
                callback(null, obj);
            } else {
                obj.transcript = JSON.stringify(result.transcripts);
                obj.transcript_search = JSON.stringify(result.transcript_search);
                callback(null, obj);
            }
        });
    }

    // 12.)
    function create_display_record(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (obj.mods === null) {
            LOGGER.module().info('INFO: [/import/queue module (create_repo_record/create_display_record)] display record not created because we were not able to get MODS from archivesspace');
            callback(null, obj);
            return false;
        }

        obj.object_type = 'object';
        obj.is_published = 0;

        MODS.create_display_record(obj, function (result) {

            let tmp = JSON.parse(result);

            if (tmp.is_compound === 1) {

                let parts = tmp.parts;

                TRANSFER_INGEST.get_compound_object_parts(obj.sip_uuid, parts, function (compound) {

                    delete tmp.parts // remove additional parts array
                    tmp.display_record.parts = compound;
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

    function delete_file(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (obj.dip_path === null) {
            callback(null, obj);
            return false;
        }

        FS.unlink('./tmp/' + obj.file, function (error) {

            if (error) {
                LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/delete_file)] file delete error ' + error);
            }

            callback(null, obj);
        });
    }

    // 13.)
    function create_repo_record(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (obj.mods === null && obj.dip_path === null) {
            callback(null, obj);
            return false;
        }

        LOGGER.module().info('INFO: [/import/queue module (create_repo_record/create_repo_record)] saving repository record to db');

        delete obj.error;

        TRANSFER_INGEST.create_repo_record(obj, function (result) {
            if (result === false) {
                console.log('ERROR: Unable to create repo record.');
                return false;
            }
        });

        let display_record = JSON.parse(obj.display_record);
        let parts = display_record.display_record.parts; // loop and get object property value

        if (obj.is_compound !== undefined && obj.is_compound === 1) {

            let dataArr = [];
            TRANSFER_INGEST.save_compound_parts(obj.sip_uuid, parts);

            for (let i=0;i<parts.length;i++) {

                let dataObj = {};
                let tmp = parts[i].object.split('/');
                let object_name = tmp[tmp.length - 1];

                dataObj.sip_uuid = obj.sip_uuid;
                dataObj.mime_type = obj.mime_type;
                dataObj.full_path = parts[i].object;

                if (object_name.indexOf('.tif') !== -1) {
                    object_name = object_name.replace('.tif', '.jpg');
                } else if (object_name.indexOf('.jp2') !== -1) {
                    object_name = object_name.replace('.jp2', '.jpg');
                }

                dataObj.object_name = object_name;
                dataArr.push(dataObj);
            }

            let timer = setInterval(function() {

                if (dataArr.length === 0) {
                    clearInterval(timer);
                    callback(null, obj);
                    return false;
                }

                let data = dataArr.pop();
                DURACLOUD.convert_service(data);

            }, 5000);

        } else if (obj.is_compound === 0 || obj.is_compound === undefined) {

            let data = {};
            let tmp = obj.file_name.split('/');
            data.sip_uuid = obj.sip_uuid;
            data.full_path = obj.file_name;
            data.object_name = tmp[tmp.length - 1];

            if (data.object_name.indexOf('.tif') !== -1) {
                data.object_name = data.object_name.replace('.tif', '.jpg');
            } else if (data.object_name.indexOf('.jp2') !== -1) {
                data.object_name = data.object_name.replace('.jp2', '.jpg');
            }

            data.mime_type = obj.mime_type;
            DURACLOUD.convert_service(data);
            callback(null, obj);
            return false;
        }
    }

    // 14.)
    function index(obj, callback) {

        if (obj.failed !== undefined && obj.failed === true) {
            callback(null, obj);
            return false;
        }

        if (obj.mods === null) {
            LOGGER.module().info('INFO: [/import/queue module (create_repo_record/index)] display record not indexed because we were not able to get MODS from archivesspace');
            callback(null, obj);
            return false;
        }

        /*
            Send request to index repository record
        */
        setTimeout(function() {

            (async() => {

                let data = {
                    'sip_uuid': obj.sip_uuid
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/indexer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/index)] indexer error.');
                    return false;
                } else if (response.data.status === 201) {
                    obj.indexed = true;
                    callback(null, obj);
                    return false;
                }

            })();

        }, 5000);
    }

    // 15.)
    function cleanup_queue(obj, callback) {

        LOGGER.module().info('INFO: [/import/queue module (create_repo_record/cleanup_queue)] cleaning up local queue ' + obj.sip_uuid);

        ARCHIVEMATICA.clear_ingest(obj.sip_uuid);

        TRANSFER_INGEST.cleanup(obj, function (result) {

            if (result !== true) {
                LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/cleanup_queue)] unable to clean up queue');
                return false;
            }

            obj.cleaned = true;
            callback(null, obj);
        });
    }

    ASYNC.waterfall([
        get_collection,
        get_uri_txt,
        get_object_uri_data,
        save_mods_id,
        get_object,
        get_manifest,
        get_duracloud_object,
        get_token,
        get_mods,
        get_handle,
        get_transcript,
        create_display_record,
        create_repo_record,
        index,
        cleanup_queue
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/import/queue module (create_repo_record/async.waterfall)] ' + error);
        }

        if (results.mods === null && results.dip_path === null) {

            let failObj = {
                is_member_of_collection: results.is_member_of_collection,
                sip_uuid: results.sip_uuid,
                message: 'Unable to create repository record'
            };

            TRANSFER_INGEST.save_to_fail_queue(failObj);
            TRANSFER_INGEST.clear_queue_record({
                sip_uuid: results.sip_uuid
            }, function (result) {
                if (result === true) {
                    TRANSFER_INGEST.restart_import();
                }
            });
        }

        LOGGER.module().info('INFO: [/import/queue module (create_repo_record/async.waterfall)] record imported');

        let collection = results.is_member_of_collection.replace(':', '_');

        // start next transfer
        // get queue record count for current collection
        TRANSFER_INGEST.check_queue(collection, function (result) {

            if (result.status === 0) {
                // ingest complete
                // TODO: clear current archivesspace session
                return false;
            }

            /*
             Send request to begin next transfer
             */
            (async() => {

                let data = {
                    'collection': collection
                };

                let response = await HTTP.post({
                    endpoint: '/api/admin/v1/import/start_transfer',
                    data: data
                });

                if (response.error === true) {
                    LOGGER.module().fatal('FATAL: [/import/queue module (create_repo_record/async.waterfall/TRANSFER_INGEST.check_queue)] unable to begin transfer.');
                    throw 'FATAL: [/import/queue module (create_repo_record/async.waterfall/TRANSFER_INGEST.check_queue)] unable to begin transfer.';
                } else if (response.data.status === 200) {
                    LOGGER.module().info('INFO: [/import/queue module (create_repo_record/async.waterfall/TRANSFER_INGEST.check_queue)] sending request to start next transfer (async)');
                    return false;
                }

            })();
        });
    });

    callback({
        status: 200,
        message: 'Importing object.'
    });
};

/**
 * Gets import record count
 * @param req
 * @param callback
 */
exports.poll_ingest_status = function (req, callback) {

    DBQ(TRANSFER_QUEUE)
        .count('id as count')
        .then(function (data) {
            callback({
                status: 200,
                data: data
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/queue module (check_ingest_status) transfer queue database error' + error);
            throw 'FATAL: [/import/queue module (check_ingest_status) transfer queue database error' + error;
        });
};

/**
 * Gets transfer status
 * @param req
 * @param callback
 */
exports.poll_transfer_status = function (req, callback) {

    DBQ(TRANSFER_QUEUE)
        .select('*')
        .where({
            transfer_status: 1
        })
        .orderBy('created', 'asc')
        .then(function (data) {
            callback({
                status: 200,
                data: data
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/queue module (check_transfer_status) transfer queue database error ' + error);
            throw 'FATAL: [/import/queue module (check_transfer_status) transfer queue database error ' + error;
        });
};

/**
 * Gets import status
 * @param req
 * @param callback
 */
exports.poll_import_status = function (req, callback) {

    DBQ(IMPORT_QUEUE)
        .select('sip_uuid', 'uuid', 'file', 'file_id', 'type', 'type', 'dip_path', 'mime_type', 'message', 'status', 'created')
        .whereRaw('DATE(created) = CURRENT_DATE')
        .orderBy('created', 'desc')
        // .groupBy('sip_uuid')
        .then(function (data) {
            callback({
                status: 200,
                data: data
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/queue module (import status broadcasts)] import queue database error ' + error);
            throw 'FATAL: [/import/queue module (import status broadcasts)] import queue database error ' + error;
        });
};

/**
 * Gets data from fail queue
 * @param req
 * @param callback
 */
exports.poll_fail_queue = function (req, callback) {

    DBQ(FAIL_QUEUE)
        .select('*')
        .orderBy('created', 'desc')
        .then(function (data) {
            callback({
                status: 200,
                data: data
            });
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/import/queue module (import failure broadcasts)] fail queue database error ' + error);
            throw 'FATAL: [/import/queue module (import failure broadcasts)] fail queue database error ' + error;
        });
};