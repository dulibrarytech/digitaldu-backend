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
    SERVICE = require('../indexer/service'),
    VALIDATOR = require('validator'),
    DB = require('../config/db')(),
    logger = require('../libs/log4'),
    REPO_OBJECTS = 'tbl_objects';

/**
 * Gets index record
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.get_index_record = function (req, callback) {

    if (req.body.sip_uuid === undefined || req.body.sip_uuid.length === 0) {
        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let sip_uuid = req.body.sip_uuid,
        elasticSearchIndex;

    if (req.body.publish !== undefined && req.body.publish === 'true') {
        elasticSearchIndex = CONFIG.elasticSearchFrontIndex;
    } else {
        elasticSearchIndex = CONFIG.elasticSearchBackIndex;
    }

    DB(REPO_OBJECTS)
        .select('*')
        .where({
            sip_uuid: sip_uuid,
            is_active: 1
        })
        .then(function (data) {

            let record = JSON.parse(data[0].display_record);

            if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                let collection_record = {};
                collection_record.pid = VALIDATOR.escape(data[0].pid);
                collection_record.uri = data[0].uri;
                collection_record.is_member_of_collection = VALIDATOR.escape(data[0].is_member_of_collection);
                collection_record.handle = data[0].handle;
                collection_record.object_type = VALIDATOR.escape(data[0].object_type);
                collection_record.title = record.display_record.title;
                collection_record.thumbnail = data[0].thumbnail;
                collection_record.is_published = data[0].is_published;
                collection_record.date = data[0].created;

                // get collection abstract
                if (record.display_record.notes !== undefined) {

                    for (let i=0;i<record.display_record.notes.length;i++) {

                        if (record.display_record.notes[i].type === 'abstract') {
                            collection_record.abstract = record.display_record.notes[i].content.toString();
                        }
                    }
                }

                collection_record.display_record = {
                    title: record.display_record.title,
                    abstract: collection_record.abstract
                };

                record = collection_record;

            } else {
                record.display_record.t_language = record.display_record.language;
                delete record.display_record.language;
            }

            SERVICE.index_record({
                index: elasticSearchIndex,
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

                    logger.module().error('ERROR: [/indexer/model module (get_index_record)] unable to index record');

                    callback({
                        status: 200,
                        message: 'record not indexed'
                    });
                }

            });
        })
        .catch(function (error) {
            logger.module().fatal('FATAL: [/indexer/model module (get_index_record)] unable get index record ' + error);
            throw 'FATAL: [/indexer/model module (get_index_record)] unable get index record ' + error;
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
        index_name = CONFIG.elasticSearchBackIndex;
    }

    function index (index_name) {

        DB(REPO_OBJECTS)
            .select('pid', 'is_member_of_collection', 'uri', 'handle', 'object_type', 'display_record', 'thumbnail', 'is_published', 'created')
            .where({
                is_indexed: 0,
                is_active: 1
            })
            .whereNot({
                display_record: null
            })
            .limit(1)
            .then(function (data) {

                if (data.length > 0) {

                    let record = JSON.parse(data[0].display_record);

                    // collection record
                    if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                        let collection_record = {};
                        collection_record.pid = VALIDATOR.escape(data[0].pid);
                        collection_record.uri = data[0].uri;
                        collection_record.is_member_of_collection = VALIDATOR.escape(data[0].is_member_of_collection);
                        collection_record.handle = data[0].handle;
                        collection_record.object_type = VALIDATOR.escape(data[0].object_type);
                        collection_record.title = record.display_record.title;
                        collection_record.thumbnail = data[0].thumbnail;
                        collection_record.is_published = data[0].is_published;
                        collection_record.date = data[0].created;

                        // get collection abstract
                        if (record.display_record.notes !== undefined) {

                            for (let i=0;i<record.display_record.notes.length;i++) {

                                if (record.display_record.notes[i].type === 'abstract') {
                                    collection_record.abstract = record.display_record.notes[i].content.toString();
                                }
                            }
                        }

                        collection_record.display_record = {
                            title: record.display_record.title,
                            abstract: collection_record.abstract
                        };

                        record = collection_record;

                    } else {

                        if (record.display_record.language !== undefined) {

                            if (typeof record.display_record.language !== 'object') {

                                let language = {
                                    language: record.display_record.language
                                };

                                record.display_record.t_language = language;
                                delete record.display_record.language;

                            } else {
                                record.display_record.t_language = record.display_record.language;
                                delete record.display_record.language;
                            }
                        }

                        record.created = data[0].created;
                    }

                    SERVICE.index_record({
                        index: index_name,
                        type: 'data',
                        id: record.pid.replace('codu:', ''),
                        body: record
                    }, function (response) {

                        if (response.result === 'created' || response.result === 'updated') {

                            DB(REPO_OBJECTS)
                                .where({
                                    pid: record.pid
                                })
                                .update({
                                    is_indexed: 1
                                })
                                .then(function (data) {

                                    if (data === 1) {

                                        setTimeout(function () {
                                            // index next record
                                            index(index_name);
                                        }, CONFIG.indexTimer);

                                    } else {
                                        logger.module().error('ERROR: [/indexer/model module (index_records)] more than one record was updated');
                                    }

                                })
                                .catch(function (error) {
                                    logger.module().fatal('FATAL: [/indexer/model module (index_records)] unable to update is_indexed field ' + error);
                                    throw 'FATAL: [/indexer/model module (index_records)] unable to update is_indexed field ' + error;
                                });

                        } else {
                            logger.module().error('ERROR: [/indexer/model module (index_records)] unable to index record');
                        }
                    });

                } else {
                    logger.module().info('INFO: [/indexer/model module (index_records)] indexing complete');
                }
            })
            .catch(function (error) {
                logger.module().error('ERROR: [/indexer/model module (index_records)] unable to get record ' + error);
                throw error;
            });
    }

    // reset is_indexed fields
    DB(REPO_OBJECTS)
        .where({
            is_indexed: 1,
            is_active: 1
        })
        .update({
            is_indexed: 0,
            is_active: 1
        })
        .then(function (data) {
            index(index_name);
        })
        .catch(function (error) {
            logger.module().error('ERROR: [/indexer/model module (index_records)] unable to reset is_indexed fields ' + error);
            throw error;
        });

    callback({
        status: 200,
        message: 'Indexing repository records...'
    });
};

/**
 * updates document fragment
 * @param req
 * @param callback
 */
exports.update_fragment = function (req, callback) {

    let sip_uuid = req.body.sip_uuid,
        doc_fragment = req.body.fragment;

    if (sip_uuid === undefined || doc_fragment === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.update_fragment({
        index: CONFIG.elasticSearchBackIndex,
        type: 'data',
        id: sip_uuid,
        body: doc_fragment
    }, function (response) {

        if (response.result === 'updated') {
            callback({
                status: 200,
                message: 'fragment updated'
            });
        } else {

            logger.module().error('ERROR: [/indexer/model module (update_fragment)] unable to update record fragment ' + response);

            callback({
                status: 200,
                message: 'fragment update failed'
            });
        }
    });
};

/**
 * Copies doc from admin to public index
 * @param req
 * @param callback
 */
exports.reindex = function (req, callback) {

    let query = req.body.query;

    if (query === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.reindex({
        body: {
            "source": {
                "index": CONFIG.elasticSearchBackIndex,
                "type": 'data',
                "query": query
            },
            "dest": {
                "index": CONFIG.elasticSearchFrontIndex
            }
        }
    }, function (response) {

        callback({
            status: 200,
            message: 'records reindexed'
        });
    });
};

/**
 * Removes record from public index
 * @param req
 * @param callback
 */
exports.unindex_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.unindex_record({
        index: CONFIG.elasticSearchFrontIndex,
        type: 'data',
        id: pid.replace('codu:', '')
    }, function (response) {

        if (response.result === 'deleted') {

            callback({
                status: 204,
                message: 'record unindexed'
            });

        } else {

            callback({
                status: 500,
                data: 'unable to remove record from index'
            });
        }
    });
};

/**
 * Removes record from admin index
 * @param req
 * @param callback
 */
exports.unindex_admin_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.unindex_record({
        index: CONFIG.elasticSearchBackIndex,
        type: 'data',
        id: pid.replace('codu:', '')
    }, function (response) {

        if (response.result === 'deleted') {

            callback({
                status: 204,
                message: 'record admin unindexed'
            });

        } else {

            callback({
                status: 500,
                data: 'unable to remove admin record from index'
            });
        }
    });
};