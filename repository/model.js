'use strict';

const fs = require('fs'),
    request = require('request'),
    config = require('../config/config'),
    pid = require('../libs/next-pid'),
    permissions = require('../libs/object-permissions'),
    async = require('async'),
    uuid = require('node-uuid'),
    handles = require('../libs/handles'),
    modslibdisplay = require('../libs/display-record'),
    archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    logger = require('../libs/log4'),
    knex =require('../config/db')(),
    REPO_OBJECTS = 'tbl_objects';

/** DEPRECATED
 * Gets next pid and increments pid value
 * @param req
 * @param callback
 */
/*
exports.get_next_pid = function (req, callback) {

    let namespace = config.namespace;

    knex.transaction(function (trx) {

        return knex('tbl_pid_gen')
            .select('namespace', 'current_pid')
            .where({
                namespace: namespace
            })
            .limit(1)
            .transacting(trx)
            .then(function (data) {

                // increment pid
                let new_id = (parseInt(data[0].current_pid) + 1),
                    new_pid = data[0].namespace + ':' + new_id;

                // update current pid with new pid value
                return knex('tbl_pid_gen')
                    .where({
                        namespace: data[0].namespace
                    })
                    .update({
                        current_pid: new_id
                    })
                    .then(function () {
                        return new_pid;
                    })
                    .catch(function (error) {
                        logger.module().error('ERROR: Unable to get next pid ' + error);
                        throw 'ERROR: Unable to get next pid ' + error;
                    });

            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(function (pid) {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: {pid: pid},
                message: 'PID retrieved.'
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get next pid ' + error);
            throw 'ERROR: Unable to get next pid ' + error;
        });
};
*/

/**
 * Gets objects by collection
 * @param req
 * @param callback
 */
exports.get_objects = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Objects retrieved.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get next pid ' + error);
            throw 'ERROR: Unable to get next pid ' + error;
        });
};

/**
 * Gets object by pid
 * @param req
 * @param callback
 */
exports.get_object = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Object retrieved.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/**
 * Get object by collection (admin dashboard)
 * @param req
 * @param callback
 */
exports.get_admin_objects = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('id', 'is_member_of_collection', 'pid', 'object_type', 'display_record', 'thumbnail', 'mime_type', 'is_compound', 'is_published', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Collections for administrators',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/**
 * Gets object (admin dashboard)
 * @param req
 * @param callback
 */
exports.get_admin_object = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .select('is_member_of_collection', 'pid', 'handle', 'object_type', 'display_record', 'is_published', 'created')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                message: 'Object retrieved.',
                data: data
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get object ' + error);
            throw 'ERROR: Unable to get object ' + error;
        });
};

/** TODO: DEPRECATE use archivespace
 * Updates collection object
 * @param req
 * @param callback
 */
exports.update_admin_collection_object = function (req, callback) {

    let data = req.body;

    if (data.is_member_of_collection === undefined || data.is_member_of_collection.length === 0) {

        callback({
            status: 400,
            message: 'Missing collection PID.',
            data: []
        });

        return false;
    }

    let mods = {
        title: data.title,
        abstract: data.abstract
    };

    let obj = {};
        obj.pid = data.pid;
        obj.is_member_of_collection = data.is_member_of_collection;
        obj.object_type = data.object_type;
        obj.handle = data.handle;
        obj.mods = JSON.stringify(mods);

    modslibdisplay.create_display_record(obj, function (display_record) {

        knex(REPO_OBJECTS)
            .where({
                is_member_of_collection: data.is_member_of_collection,
                pid: data.pid
            })
            .update({
                mods: JSON.stringify(mods),
                display_record: display_record
            })
            .then(function (data) {
                callback({
                    status: 201,
                    message: 'Object updated.',
                    data: [{'pid': obj.pid}]
                });
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save collection record ' + error);
                throw 'ERROR: unable to save collection record ' + error;
            });
    });
};

/**
 * Creates repository collection (admin dashboard)
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.save_admin_collection_object = function (req, callback) {

    let data = req.body;

    if (data.mods_id === undefined || data.mods_id.length === 0) {

        callback({
            status: 400,
            message: 'Missing collection PID.',
            data: []
        });

        return false;
    }

    // TODO: sanitize mods_id

    function get_session_token(callback) {

        archivespace.get_session_token(function (response) {

            let result = response.data,
                obj = {},
                token;

            if (data === undefined) {
                obj.session = null;
                callback(null, obj);
                return false;
            }

            try {

                token = JSON.parse(result);

                if (token.session === undefined) {
                    logger.module().error('ERROR: session token is undefined');
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                if (token.error === true) {
                    logger.module().error('ERROR: session token error' + token.error_message);
                    obj.session = null;
                    callback(null, obj);
                    return false;
                }

                obj.mods_id = data.mods_id;
                obj.session = token.session;
                callback(null, obj);
                return false;

            } catch (error) {
                logger.module().error('ERROR: session token error ' + error);
            }
        });

    }

    function get_mods(obj, callback) {

        // skip mods retrieval if session is not available
        if (obj.session === null) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            archivespace.get_mods(obj.mods_id, obj.session, function (response) {

                if (response.error !== undefined && response.error === true) {

                    logger.module().error('ERROR: unable to get mods ' + response.error_message);

                    obj.mods = null;
                    callback(null, obj);
                    return false;
                }

                obj.object_type = 'collection';
                obj.mods = response.mods;
                obj.is_member_of_collection = data.is_member_of_collection;
                delete obj.session;
                callback(null, obj);
            });

        }, 5000);
    }

    function get_pid(obj, callback) {

        try {
            obj.pid = uuid(config.uuidDomain, uuid.DNS);
            callback(null, obj);
        } catch (error) {
            logger.module().error('ERROR: unable to generate uuid');
            obj.pid = null;
            callback(null, obj);
        }
    }

    function get_handle(obj, callback) {

        if (obj.pid === null) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

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

    function create_display_record(obj, callback) {

        modslibdisplay.create_display_record(obj, function (result) {
            obj.display_record = result;
            callback(null, obj);
        });
    }

    function save_record(obj, callback) {

        knex(REPO_OBJECTS)
            .insert(obj)
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to save collection record ' + error);
                obj.error = 'ERROR: unable to save collection record ' + error;
                callback(null, obj);
            });
    }

    async.waterfall([
        get_session_token,
        get_mods,
        get_pid,
        get_handle,
        create_display_record,
        save_record
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: async (save_admin_collection_object)');
            throw 'ERROR: async (save_admin_collection_object)';
        }

        logger.module().info('INFO: collection record saved');

        if (results.error === undefined) {

            callback({
                status: 201,
                message: 'Object created.',
                data: [{'pid': results.pid}]
            });

        } else {

            callback({
                status: 500,
                message: 'A database error occurred. ' + error,
                data: [{'pid': 'no pid'}]
            });
        }
    });
};

/**
 * Publishes object(s)
 * @param req
 * @param callback
 */
exports.publish_object = function (req, callback) {

    let obj = {},
        message;

    // publish collection and all of its objects
    if (req.body.is_member_of_collection !== undefined && req.body.is_member_of_collection.length !== 0) {

        // TODO: sanitize payload
        obj.is_member_of_collection = req.body.is_member_of_collection;
        message = 'Collection published';

    } else if (req.body.pid !== undefined && req.body.pid !== 0) {

        // TODO: sanitize payload
        // publish single object
        obj.pid = req.body.pid;
        message = 'Record published';

    } else {
        // bad request
        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }

    knex(REPO_OBJECTS)
        .where(obj)
        .update({
            is_published: 1
        })
        .then(function (data) {

            if (data > 0) {
                get_repo_objects(obj);
            }

            callback({
                status: 201,
                message: message
            });

        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to save collection record ' + error);
            throw 'ERROR: unable to save collection record ' + error;
        });
};

/**
 * Gets objects to index
 * @param obj
 */
const get_repo_objects = function (obj) {

    let whereObj = {};

    if (obj.is_member_of_collection !== undefined) {

        whereObj.is_member_of_collection = obj.is_member_of_collection;

    } else if (obj.pid !== undefined) {

        whereObj.pid = obj.pid;
    }

    whereObj.is_published = 1;
    whereObj.is_active = 1;

    knex(REPO_OBJECTS)
        .select('sip_uuid')
        .where(whereObj)
        .then(function (data) {

            let timer = setInterval(function () {

                if (data.length !== 0) {

                    let record = data.pop(),
                        apiUrl = config.apiUrl + '/api/admin/v1/indexer';

                    request.post({
                        url: apiUrl,
                        form: {
                            'sip_uuid': record.sip_uuid,
                            'publish': true
                        },
                        timeout: 25000
                    }, function (error, httpResponse, body) {

                        if (error) {
                            logger.module().error('ERROR: unable to index record ' + error);
                            return false;
                        }

                        if (httpResponse.statusCode === 200) {
                            return false;
                        } else {
                            logger.module().error('ERROR: unable to index record ' + body);
                        }

                    });

                } else {
                    clearInterval(timer);
                }

            }, 1000);

        })
        .catch(function (error) {
            logger.module().error('ERROR: Unable to get sip uuids  ' + error);
            throw 'ERROR: Unable to get sip uuids ' + error;
        });
};

/** TODO: refactor to make use of archivematica download link. make use of shell.js
 * Downloads AIP from archivematica
 * @param req
 * @param callback
 */
exports.get_object_download = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Missing PID.',
            data: []
        });

        return false;
    }

    // keep query to handle legacy pids
    knex(REPO_OBJECTS)
        .select('sip_uuid')
        .where({
            pid: pid,
            object_type: 'object',
            is_active: 1
        })
        .then(function (data) {

            if (data.length === 0) {

                callback({
                    status: 500,
                    message: 'Unable to download AIP.',
                });
            }

            archivematica.download_aip(data[0].sip_uuid, function (aip) {

                if (aip.error === true) {

                    callback({
                        status: 500,
                        message: 'Unable to download AIP.',
                    });

                    return false;
                }

                callback({
                    status: 200,
                    content_type: 'application/x-7z-compressed',
                    file: aip
                });
            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to get object sip_uuid ' + error);
            let obj = {};
            obj.error = 'ERROR: unable to get object sip_uuid ' + error;
            callback(null, obj);
        });
};