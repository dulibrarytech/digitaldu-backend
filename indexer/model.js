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

const config = require('../config/config'),
    service = require('../indexer/service'),
    async = require('async'),
    knex =require('../config/db')(),
    logger = require('../libs/log4'),
    modslibdisplay = require('../libs/display-record'),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Gets index record
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.get_index_record = function (req, callback) {

    if (req.body.sip_uuid === undefined) {
        callback({
            status: 400,
            message: 'missing sip uuid.'
        });

        return false;
    }

    let sip_uuid = req.body.sip_uuid;

    knex(REPO_OBJECTS)
        .select('display_record')
        .where({
            sip_uuid: sip_uuid
        })
        .then(function (data) {

            let record = JSON.parse(data[0].display_record);
            // TODO: test with authority value...
            // delete record.display_record.language.authority;
            record.display_record.t_language = record.display_record.language;
            delete record.display_record.language;

            service.index_record({
                index: config.elasticSearchIndex,
                type: 'data',
                id: record.pid.replace('codu:', ''),
                body: record
            }, function (response) {

                if (response.result === 'created' || response.result === 'updated') {

                    callback({
                        status: 200,
                        message: 'record indexed'
                    });

                } else {

                    logger.module().error('ERROR: unable to index record');

                    callback({
                        status: 200,
                        message: 'record not indexed'
                    });
                }

            });
        })
        .catch(function (error) {
            logger.module().error('ERROR: unable get index record ' + error);
            throw error;
        });
};

/**
 * Indexes all repository records
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.index_records = function (req, callback) {

    let index_name;

    if (req.body.index_name !== undefined) {
        index_name = req.body.index_name;
    } else {
        index_name = config.elasticSearchIndex;
    }

    function index (index_name) {

        knex(REPO_OBJECTS)
            .select('display_record')
            .where({
                is_indexed: 0
            })
            .whereNot({
                display_record: null
            })
            .limit(1)
            .then(function (data) {

                if (data.length > 0) {

                    let record = JSON.parse(data[0].display_record);
                    record.display_record.t_language = record.display_record.language;
                    delete record.display_record.language;

                    service.index_record({
                        index: index_name,
                        type: 'data',
                        id: record.pid.replace('codu:', ''),
                        body: record
                    }, function (response) {

                        if (response.result === 'created' || response.result === 'updated') {

                            knex(REPO_OBJECTS)
                                .where({
                                    pid: record.pid
                                })
                                .update({
                                    is_indexed: 1
                                })
                                .then(function (data) {

                                    if (data === 1) {

                                        setTimeout(function () {
                                            index(index_name);
                                        }, config.indexTimer);

                                    } else {
                                        logger.module().error('ERROR: more than one record was updated (index)');
                                    }

                                })
                                .catch(function (error) {
                                    logger.module().error('ERROR: unable to update is_indexed field (index) ' + error);
                                    throw error;
                                });

                        } else {

                            callback({
                                status: 500,
                                data: 'unable to index record'
                            });
                        }
                    });

                } else {
                    logger.module().info('INFO: indexing complete');
                }
            })
            .catch(function (error) {
                logger.module().error('ERROR: unable to get record (index) ' + error);
                throw error;
            });
    }

    // reset is_indexed fields
    knex(REPO_OBJECTS)
        .where({
            is_indexed: 1
        })
        .update({
            is_indexed: 0
        })
        .then(function (data) {

            console.log(data);
            index(index_name);

            /*
            if (data > 0) {
                index(index_name);
            } else {
                logger.module().error('ERROR: unable to reset is_indexed fields (index)');
            }
            */

        })
        .catch(function (error) {
            logger.module().error('ERROR: unable to reset is_indexed fields (index) ' + error);
            throw error;
        });

    callback({
        status: 200,
        message: 'Indexing repository records...'
    });
};

// TODO: reset display records
/**
 *
 * @param req
 * @param callback
 */
exports.reset_display_record = function (req, callback) {

    let params = {};

    if (req.body.pid !== undefined) {
        params.pid = req.body.pid;
    } else if (req.body.is_member_of_collection !== undefined) {
        params.is_member_of_collection = req.body.is_member_of_collection;
    } else if (req.body.pid === undefined && req.body.is_member_of_collection === undefined) {
        params.none = true;
    } else {
        // TODO: 400 error
        return false;
    }

    function get_data (callback) {

        let obj = {};

        if (params.none !== undefined) {

            // console.log('meow');

            knex(REPO_OBJECTS)
                .select('is_member_of_collection', 'pid', 'handle', 'object_type', 'mods', 'thumbnail', 'file_name', 'mime_type')
                .whereNot({
                    mods: null
                })
                .then(function (data) {
                    // TODO: check data
                    obj.data = data;
                    callback(null, obj);
                })
                .catch(function (error) {
                    logger.module().error('ERROR: unable to get record ' + error);
                    throw 'ERROR: unable to get record ' + error;
                });

        } else {

            knex(REPO_OBJECTS)
                .select('is_member_of_collection', 'pid', 'handle', 'object_type', 'mods', 'thumbnail', 'file_name', 'mime_type')
                .where(params)
                .whereNot({
                    mods: null
                })
                .then(function (data) {
                    // TODO: check data
                    obj.data = data;
                    callback(null, obj);
                })
                .catch(function (error) {
                    logger.module().error('ERROR: unable to get record ' + error);
                    throw 'ERROR: unable to get record ' + error;
                });
        }
    }

    function create_display_record (obj, callback) {

        let timer = setInterval(function () {

            if (obj.data.length === 0) {
                clearInterval(timer);
                console.log('complete');
                return false;
            }

            let record = obj.data.pop();

            modslibdisplay.create_display_record(record, function (display_record) {

                let recordObj = JSON.parse(display_record);

                knex(REPO_OBJECTS)
                    .where({
                        is_member_of_collection: recordObj.is_member_of_collection,
                        pid: recordObj.pid
                    })
                    .update({
                        display_record: display_record
                    })
                    .then(function (data) {

                        // TODO: check data
                        // console.log(data);

                    })
                    .catch(function (error) {
                        logger.module().error('ERROR: unable to save collection record ' + error);
                        throw 'ERROR: unable to save collection record ' + error;
                    });
            });

        }, 3000);
    }

    async.waterfall([
        get_data,
        create_display_record
    ], function (error, obj) {

        if (error) {
            logger.module().error('ERROR: async (reset_display_record)');
        }

        console.log(obj);
    });

    callback({
        status: 201,
        message: 'updating display record(s).'
    });

};