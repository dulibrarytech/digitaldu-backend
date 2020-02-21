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

const REQUEST = require('request'),
    DB = require('../config/db')(),
    DBQ = require('../config/dbqueue')(),
    LOGGER = require('../libs/log4'),
    QUEUE = 'tbl_archivematica_queue',
    IMPORT_QUEUE = 'tbl_duracloud_queue',
    FAIL_QUEUE = 'tbl_fail_queue',
    REPO_OBJECTS = 'tbl_objects';

/**
 * Checks if collection exists
 * @param pid
 * @param callback
 */
exports.check_collection = function (pid, callback) {

    'use strict';

    DB(REPO_OBJECTS)
        .count('pid as count')
        .where({
            object_type: 'collection',
            pid: pid.replace('_', ':')
        })
        .then(function (result) {

            if (result[0].count === 0) {
                callback(false);
            } else {
                callback(true);
            }

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (check_collection)] database queue error ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (check_collection)] database queue error ' + error;
        });
};

/**
 * Saves transfer object data to db (queue)
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
    DBQ.batchInsert(QUEUE, importObjects, chunkSize)
        .then(function (data) {

            let obj = {};
            obj.message = 'Data saved.';
            obj.recordCount = chunkSize;

            if (data.length === 0) {
                obj.message = 'Data not saved.';
                LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (save_transfer_records)] unable to save queue data');
                throw 'FATAL: [/libs/transfer-ingest lib (save_transfer_records)] unable to save queue data';
                // TODO: clear queue and log to fail queue
            }

            callback(obj);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (save_transfer_records)] unable to save queue data');
            throw 'FATAL: [/libs/transfer-ingest lib (save_transfer_records)] unable to save queue data' + error;
        });
};

/**
 * Starts Archivematica transfer process
 * @param collection
 * @param callback
 */
exports.start_transfer = function (collection, callback) {

    'use strict';

    // Get one transfer queue record
    DBQ(QUEUE)
        .select('id', 'is_member_of_collection', 'object')
        .where({
            is_member_of_collection: collection,
            message: 'WAITING_FOR_TRANSFER',
            transfer_status: 0
        })
        .orderBy('created', 'asc')
        .limit(1)
        .then(function (data) {

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
                        // TODO: clear queue and log to fail queue
                        LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (start_transfer)] database transfer queue error. data !== 1');
                        return false;
                    }

                    callback(object);

                    return null;
                }
            };

            // Update queue. Indicate to user that the transfer has started.
            update_queue(transferStartedObj);

            return null;
        })
        .catch(function (error) {
            LOGGER.module().error('FATAL: [/libs/transfer-ingest lib (start_transfer)] database transfer queue error' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (start_transfer)] database transfer queue error' + error ;
        });
};

/**
 * Updates local queue with transfer status
 * @param response
 * @param id
 */
exports.confirm_transfer = function (response, id) {

    'use strict';

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
                    LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (confirm_transfer)] database transfer queue error. data !==1');
                    return false;
                }

                return null;
            }
        };

        // Update queue. Indicate to user that the transfer has failed.
        update_queue(transferFailedObj);

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
                LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (confirm_transfer)] database transfer queue error. data !==1');
                return false;
            }

            return null;
        }
    };

    // Update queue. Indicate to user that the transfer has failed.
    update_queue(transferCompleteObj);
};

/**
 * Gets transferred record from local queue
 * @param collection
 * @param callback
 */
exports.get_transferred_record = function (collection, callback) {

    'use strict';

    // Get one transfer queue record
    DBQ(QUEUE)
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
                callback('done');
                return false;
            }

            let object = data.pop();
            callback(object);

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_transferred_record)] database transfer queue error' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_transferred_record)] database transfer queue error' + error;
        });
};

/**
 * Updates local queue with approval status
 * @param response
 * @param object
 * @param callback
 */
exports.confirm_transfer_approval = function (response, object, callback) {

    'use strict';

    if (typeof response === 'object') {
        return false;
    }

    var json;

    try {
        json = JSON.parse(response);
    } catch (e) {
        LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (confirm_transfer_approval)] unable to parse confirmation response');
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
                    LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (confirm_transfer_approval)] unable to update database queue. data !==1');
                    return false;
                }

                return null;
            }
        };

        // Update queue and indicate that the transfer has been approved
        update_queue(transferApprovedObj);

        callback({
            is_member_of_collection: object.is_member_of_collection,
            transfer_uuid: json.uuid
        });

        return false;

    } else {

        callback({
            error: true,
            message: 'Transfer not approved'
        });

        return false;
    }
};

/**
 * Updates transfer queue status
 * @param response
 * @param callback
 */
exports.update_transfer_status = function (response, callback) {

    'use strict';

    if (typeof response === 'object') {
        return false;
    }

    var json = JSON.parse(response);

    if (json.status === 'COMPLETE' && json.sip_uuid !== undefined) {

        DBQ(QUEUE)
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
                                LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (update_transfer_status)] updated more than one record in database queue. data !==1');
                                return false;
                            } else {

                                callback({
                                    complete: true,
                                    sip_uuid: json.sip_uuid
                                });
                            }

                            return null;
                        }
                    };

                    // Flag transfer as COMPLETE in queue
                    update_queue(transferCompleteObj);
                }

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (update_transfer_status)] database queue error ' + error);
                throw 'FATAL: [/libs/transfer-ingest lib (update_transfer_status)] database queue error ' + error;
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
                    LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (update_transfer_status)] database queue error. data !==1');
                    return false;
                }

                return null;
            }
        };

        update_queue(transferProcessingObj);

        callback({
            complete: false,
            status: json.status
        });

        return false;
    }

    // TODO: test (github issue #104)
    if (json.status === 'FAILED' || json.status === 'REJECTED' || json.status === 'USER_INPUT') {

        // TODO: clear queue and add to fail queue

        callback({
            error: true,
            message: json.status
        });

        return false;
    }
};

/**
 * Updates ingest queue status
 * @param response
 * @param sip_uuid
 * @param callback
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
                    LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (update_ingest_status)] database queue error. data!==1 ' + json.status);

                    callback({
                        complete: false
                    });

                } else {

                    callback({
                        complete: true,
                        sip_uuid: sip_uuid
                    });

                }

                return null;
            }
        };

        update_queue(importCompleteQueue);

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
                    LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (update_ingest_status)] database queue error data!==1 ' + json.status);
                    return false;
                }

                return null;
            }
        };

        update_queue(importProcessing);

        callback({
            complete: false,
            sip_uuid: json.uuid
        });
    }

    if (json.status === 'FAILED' || json.status === 'REJECTED' || json.status === 'USER_INPUT') {

        callback({
            error: true,
            message: json.status
        });

        return false;
    }
};

/**
 * Saves object data retrieved from METS file
 * @param obj
 * @param callback
 */
exports.save_mets_data = function (obj, callback) {

    'use strict';

    DBQ(IMPORT_QUEUE)
        .count('sip_uuid as count')
        .where({
            sip_uuid: obj[0].sip_uuid
        })
        .then(function (result) {

            if (result[0].count !== 2) {

                DBQ(IMPORT_QUEUE)
                    .insert(obj)
                    .then(function (data) {
                        callback('done');
                        return null;
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save mets ' + error);
                        throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save mets ' + error;
                    });
            }

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save mets ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (save_mets_data)] unable to save mets ' + error;
        });

    return false;
};

/**
 * Gets uri.txt containing mods id (used to get metadata from Archivesspace)
 * @param sip_uuid
 * @param callback
 */
exports.get_uri_txt = function (sip_uuid, callback) {

    'use strict';

    DBQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'txt',
            file: 'uri.txt',
            status: 0
        })
        .limit(1)
        .then(function (data) {
            callback(data);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_uri_txt)] unable to get uri txt file ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_uri_txt)] unable to get uri txt file ' + error;
        });
};

/**
 * Gets collection from local queue
 * @param sip_uuid
 * @param callback
 */
exports.get_collection = function (sip_uuid, callback) {

    'use strict';

    DBQ(QUEUE)
        .select('is_member_of_collection')
        .where({
            sip_uuid: sip_uuid
        })
        .then(function (data) {
            callback(data[0].is_member_of_collection.replace('_', ':'));
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_collection)] unable to get collection ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_collection)] unable to get collection ' + error;
        });
};

/**
 * Saves mods_id used to get metadata from Archivesspace
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
                LOGGER.module().error('ERROR: [/libs/transfer-ingest lib (save_mods_id)] unable to save mods id.  data !==1');
                throw 'ERROR: [/libs/transfer-ingest lib (save_mods_id)] unable to save mods id.  data !==1';
            }

            callback(true);

            return null;
        }
    };

    update_queue(importProcessing);
};

/**
 * Gets local queue record
 * @param sip_uuid
 * @param callback
 */
exports.get_object = function (sip_uuid, callback) {

    'use strict';

    DBQ(IMPORT_QUEUE)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            type: 'object',
            status: 0
        })
        .limit(1)
        .then(function (data) {
            callback(data);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_object)] unable to get object ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_object)] unable to get object ' + error;
        });
};

/**
 * Creates repository record
 * @param obj
 * @param callback
 */
exports.create_repo_record = function (obj, callback) {

    'use strict';

    delete obj.session;
    delete obj.dip_path;
    delete obj.file;
    delete obj.uuid;

    DB(REPO_OBJECTS)
        .insert(obj)
        .then(function (data) {
            callback(true);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (create_repo_record)] unable to create repo record ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (create_repo_record)] unable to create repo record ' + error;
        });
};

/**
 * Cleans up local queue when object ingest is complete
 * @param obj
 * @param callback
 */
exports.cleanup = function (obj, callback) {

    'use strict';

    DBQ(QUEUE)
        .where({
            sip_uuid: obj.sip_uuid
        })
        .del()
        .then(function (data) {

            DBQ(IMPORT_QUEUE)
                .where({
                    sip_uuid: obj.sip_uuid
                })
                .del()
                .then(function (data) {
                    callback(true);
                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (cleanup/QUEUE)] unable to clean up queue ' + error);
                    throw 'FATAL: [/libs/transfer-ingest lib (cleanup/QUEUE)] unable to clean up queue ' + error;
                });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (cleanup/IMPORT_QUEUE)] unable to clean up queue ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (cleanup/IMPORT_QUEUE)] unable to clean up queue ' + error;
        });
};

/**
 * Flags incomplete records
 * @param obj
 */
exports.flag_incomplete_record = function (obj) {

    'use strict';

    DB(REPO_OBJECTS)
        .where({
            sip_uuid: obj.sip_uuid
        })
        .update({
            is_complete: 0
        })
        .then(function (data) {
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (flag_incomplete_record)] unable to flag incomplete record ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (flag_incomplete_record)] unable to flag incomplete record ' + error;
        });

};

/**
 * Checks queue to determine if another transfer should be started
 * @param is_member_of_collection
 * @param callback
 */
exports.check_queue = function (is_member_of_collection, callback) {

    'use strict';

    DBQ(QUEUE)
        .count('is_member_of_collection as count')
        .where({
            is_member_of_collection: is_member_of_collection
        })
        .then(function (result) {

            let obj = {};

            if (result[0].count !== 0) {
                obj.status = 1;
            } else {
                obj.status = 0;
            }

            callback(obj);

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (check_queue)] unable to check queue ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (check_queue)] unable to check queue ' + error;
        });
};

/**
 * Saves data to fail queue
 * @param obj
 */
exports.save_to_fail_queue = function (obj) {

    'use strict';

    DBQ(FAIL_QUEUE)
        .insert(obj)
        .then(function (data) {
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (save_to_fail_queue)] unable to save to fail queue ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (save_to_fail_queue)] unable to save to fail queue ' + error;
        });
};

/**
 * Gets a collection from the queue
 * @param callback
 */
exports.get_import_collection = function (callback) {

    'use strict';

    DBQ(QUEUE)
        .select('*')
        .distinct('is_member_of_collection')
        .limit(1)
        .then(function (data) {
            callback(data[0].is_member_of_collection);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_import_collection)] unable to get import collection ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_import_collection)] unable to get import collection ' + error;
        });
};

/**
 * Restarts import queue process
 */
exports.restart_import = function () {

    'use strict';

    DBQ(QUEUE)
        .select('*')
        .distinct('is_member_of_collection')
        .limit(1)
        .then(function (data) {

            if (data.length === 0) {
                // cannot restart import
                return false;
            }

            REQUEST.post({
                url: config.apiUrl + '/api/admin/v1/import/start_transfer',
                form: {
                    'collection': data[0].is_member_of_collection
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (restart_import)] unable to restart transfer (request async)' + error);
                    throw 'FATAL: [/libs/transfer-ingest lib (restart_import)] unable to restart transfer (request async)' + error;
                }

                if (httpResponse.statusCode === 200) {
                    LOGGER.module().info('INFO: [/libs/transfer-ingest lib (restart_import)] sending request to restart transfer (request async)');
                    return false;
                } else {
                    LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (restart_import)] unable to restart transfer ' + httpResponse.statusCode + '/' + body + ' (request async)');
                    throw 'FATAL: [/libs/transfer-ingest lib (restart_import)] unable to begin restart transfer ' + httpResponse.statusCode + '/' + body + ' (request async)';
                }
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (restart_import)] unable unable to restart import ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (restart_import)] unable to restart import ' + error;
        });
};

/**
 * gets compound object parts from import queue
 * @param sip_uuid
 * @param parts
 * @param callback
 */
exports.get_compound_object_parts = function (sip_uuid, parts, callback) {

    'use strict';

    DBQ(IMPORT_QUEUE)
        .select('uuid', 'file', 'dip_path')
        .where({
            type: 'object',
            sip_uuid: sip_uuid
        })
        .then(function (data) {

            for (let i=0;i<data.length;i++) {

                let file = data[i].file;

                if (file.indexOf('tif') !== -1) {
                    file = file.replace('tif', 'jp2');
                }

                if (file.indexOf('wav') !== -1) {
                    file = file.replace('wav', 'mp3');
                }

                for (let j=0;j<parts.length;j++) {
                    if (parts[j].title === data[i].file) {
                        parts[j].object = data[i].dip_path + '/objects/' + data[i].uuid + '-' + file;
                        parts[j].thumbnail = data[i].dip_path + '/thumbnails/' + data[i].uuid + '.jpg';
                    }
                }
            }

            callback(parts);
            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (get_compound_object_parts)] unable to get compound object parts ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (get_compound_object_parts)] unable to get compound object parts ' + error;
        });
};

/**
 * Clears out failed record(s) in import queue
 * @param obj
 * @param callback
 */
exports.clear_queue_record = function (obj, callback) {

    'use strict';

    DBQ(QUEUE)
        .where(obj)
        .del()
        .then(function (data) {

            if (data > 0) {
                callback(true);
            } else {
                callback(false);
            }

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (clear_queue_record)] unable to clean up queue ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (clear_queue_record)] unable to clean up queue ' + error;
        });
};

/**
 * Updates queue statuses
 * @param obj
 */
const update_queue = function (obj) {

    'use strict';

    DBQ(obj.table)
        .where(obj.where)
        .update(obj.update)
        .then(obj.callback)
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/libs/transfer-ingest lib (update_queue)] unable to update queue ' + error);
            throw 'FATAL: [/libs/transfer-ingest lib (update_queue)] unable to update queue ' + error;
        });
};