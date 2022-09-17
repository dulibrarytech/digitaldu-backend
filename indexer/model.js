/**

 Copyright 2022 University of Denver

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

const ES = require('elasticsearch');
const TIMERS_CONFIG = require('../config/timers_config')();
const ES_CONFIG = require('../config/elasticsearch_config')();
const DB = require('../config/db_config')();
const HELPER = require('../indexer/helper');
const SERVICE = require('../indexer/service');
const INDEXER_DISPLAY_RECORD_TASKS = require('../indexer/tasks/indexer_display_record_tasks');
const INDEXER_INDEX_TASKS = require('../indexer/tasks/indexer_index_tasks');
const DB_TABLES = require('../config/db_tables_config')();
const REPO_OBJECTS = DB_TABLES.repo.repo_objects;
const LOGGER = require('../libs/log4');
const CLIENT = new ES.Client({
        host: ES_CONFIG.elasticsearch_host
    });

/**
 * Indexes single repository record
 * @param uuid
 * @param is_published
 * @param callback
 * @returns {boolean}
 */
exports.index_record = function (uuid, is_published, callback) {

    (async () => {

        try {

            const DISPLAY_RECORD_TASKS = new INDEXER_DISPLAY_RECORD_TASKS(DB, REPO_OBJECTS);
            const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
            let record = await DISPLAY_RECORD_TASKS.get_index_display_record_data(uuid);

            if (record.pid === undefined) {
                record = HELPER.uuid_pid(record);
            }

            let response = await INDEX_TASKS.index_record(uuid, is_published, record);

            if (response.result === 'created' || response.result === 'updated') {

                callback({
                    status: 201,
                    message: 'record indexed'
                });

            }

        } catch (error) {

            callback({
                status: 200,
                message: 'Unable to index record'
            });
        }

    })();
};

/**
 * Indexes all repository records
 * @param index
 * @param callback
 * @returns {boolean}
 */
exports.index_records = function (index, callback) {

    (async () => {

        console.log('indexing...');

        const INDEX_TASKS = new INDEXER_INDEX_TASKS(DB, REPO_OBJECTS, CLIENT, ES_CONFIG);
        const DISPLAY_RECORD_TASKS = new INDEXER_DISPLAY_RECORD_TASKS(DB, REPO_OBJECTS);
        let is_published = false;
        let where_obj = {};

        where_obj.is_indexed = 0;
        where_obj.is_active = 1;

        if (index === undefined) {
            index = 'backend';
        }

        if (index === 'frontend') {
            where_obj.is_published = 1;
            where_obj.is_active = 1;
            is_published = true;
        }

        let result = await INDEX_TASKS.reset_indexed_flags();

        if (result === false) {
            // TODO: log failure
            console.log('is_indexed flag reset failed.');
            // Stop index processs
            return false;
        }

        let timer = setInterval(async () => {

            try {

                let uuid;
                let result;
                let record;
                let response;

                uuid = await INDEX_TASKS.get_record_uuid(where_obj);

                if (uuid === 0) {
                    clearInterval(timer);
                    console.log('Full re-indexing complete.');
                    // TODO: log completion
                    return false;
                }

                record = await DISPLAY_RECORD_TASKS.get_index_display_record_data(uuid);

                if (record.pid === undefined) {
                    record = HELPER.uuid_pid(record);
                }

                response = await INDEX_TASKS.index_record(uuid, is_published, record);

                if (response.result === 'created' || response.result === 'updated') {
                    console.log(uuid + ' indexed.');
                    result = await INDEX_TASKS.update_indexing_status(uuid);

                    if (result !== true) {
                        // TODO: log
                        console.log('index status update failed.');
                    }
                }

            } catch (error) {
                // TODO: log error
                console.log(error.message);
            }

        }, TIMERS_CONFIG.index_timer);

    })();

    callback({
        status: 201,
        message: 'Indexing repository records...'
    });
};

/**
 * Copies doc(s) from admin to public index
 * @param req
 * @param callback
 */
exports.publish_records = function (req, callback) {

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
            'source': {
                'index': ES_CONFIG.elasticsearch_back_index,
                'query': query
            },
            'dest': {
                'index': ES_CONFIG.elasticsearch_front_index
            }
        }
    }, function (response) {

        callback({
            status: 201,
            message: 'record(s) published'
        });
    });
};

/** // TODO:
 * Removes record from public index
 * @param uuid
 * @param index
 * @param callback
 */
exports.unindex_record = function (uuid, index, callback) {

    let index_type;

    if (index === 'backend') {
        index_type = ES_CONFIG.elasticsearch_back_index;
    } else if (index === 'frontend') {
        index_type = ES_CONFIG.elasticsearch_front_index;
    } else {
        callback({
            status: 500,
            data: 'unable to remove record from index'
        });
    }

    SERVICE.unindex_record({
        index: index_type,
        id: uuid
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
/*
exports.unindex_admin_record = function (req, callback) {

    let uuid = req.query.uuid;

    if (uuid === undefined || uuid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.unindex_record({
        index: CONFIG.elasticSearchBackIndex,
        id: uuid
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

 */

/** DEPRECATE
 * indexes all published records to public index after full reindex
 * @param req
 * @param callback
 * @returns {boolean}

exports.republish_record = function (req, callback) {

    let uuid = req.body.uuid;

    if (uuid === undefined || uuid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let index_name = CONFIG.elasticSearchFrontIndex;

    function index (uuid, index_name) {

        DB(REPO_OBJECTS)
            .select('*')
            .where({
                uuid: uuid,
                is_published: 1,
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
                    // TODO: update to use display record lib
                    // collection record
                    if (record.display_record.jsonmodel_type !== undefined && record.display_record.jsonmodel_type === 'resource') {

                        let collection_record = {};
                        collection_record.uuid = data[0].uuid;
                        collection_record.pid = data[0].uuid;
                        collection_record.uri = data[0].uri;
                        collection_record.is_member_of_collection = data[0].is_member_of_collection;
                        collection_record.handle = data[0].handle;
                        collection_record.object_type = data[0].object_type;
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

                    // TODO: figure out why some records are getting their is_published value changed to 0 (unpublished)
                    // Everything getting funneled through here is published
                    if (record.is_published === 0) {
                        record.is_published = 1;
                    }

                    if (record.pid === undefined) {
                        record = uuid_pid(record);
                    }

                    SERVICE.index_record({
                        index: index_name,
                        id: record.pid,
                        body: record
                    }, function (response) {

                        if (response.result === 'created' || response.result === 'updated') {

                            DB(REPO_OBJECTS)
                                .where({
                                    uuid: record.pid
                                })
                                .update({
                                    is_indexed: 1
                                })
                                .then(function (data) {

                                    if (data === 1) {

                                        setTimeout(function () {
                                            // index next record
                                            index(index_name);
                                        }, INDEX_TIMER);

                                    } else {
                                        LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] more than one record was updated');
                                    }

                                })
                                .catch(function (error) {
                                    LOGGER.module().fatal('FATAL: [/indexer/model module (republish_record)] unable to update is_indexed field ' + error);
                                    throw 'FATAL: [/indexer/model module (republish_record)] unable to update is_indexed field ' + error;
                                });

                        } else {
                            LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] unable to index record');
                        }
                    });

                } else {
                    LOGGER.module().info('INFO: [/indexer/model module (republish_record)] indexing complete');
                }
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/indexer/model module (republish_record)] unable to get record ' + error);
                throw error;
            });
    }

    // reset is_indexed fields
    DB(REPO_OBJECTS)
        .where({
            uuid: uuid,
            is_indexed: 1,
            is_active: 1,
            is_published: 1
        })
        .update({
            is_indexed: 0,
            is_active: 1
        })
        .then(function (data) {
            index(uuid, index_name);
        })
        .catch(function (error) {
            LOGGER.module().error('ERROR: [/indexer/model module (publish_records)] unable to reset is_indexed fields ' + error);
            throw error;
        });

    callback({
        status: 201,
        message: 'reindexing (publishing) repository records...'
    });
};
 */

/** DEPRECATE
 * updates document fragment
 * @param req
 * @param callback

exports.update_fragment = function (req, callback) {

    let uuid = req.body.uuid,
        doc_fragment = req.body.fragment;

    if (uuid === undefined || doc_fragment === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    SERVICE.update_fragment({
        index: CONFIG.elasticSearchBackIndex,
        id: uuid,
        body: doc_fragment
    }, function (response) {

        if (response.result === 'updated') {
            callback({
                status: 201,
                message: 'fragment updated'
            });
        } else if (response.result === 'noop') {
            callback({
                status: 201,
                message: 'published status is already set'
            });
        } else {

            LOGGER.module().error('ERROR: [/indexer/model module (update_fragment)] unable to update record fragment ' + response);

            callback({
                status: 201,
                message: 'fragment update failed'
            });
        }
    });
};
 */
