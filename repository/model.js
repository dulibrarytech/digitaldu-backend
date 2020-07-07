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
    REQUEST = require('request'),
    HTTP = require('../libs/http'),
    ASYNC = require('async'),
    UUID = require('node-uuid'),
    VALIDATOR = require('validator'),
    HANDLES = require('../libs/handles'),
    MODS = require('../libs/display-record'),
    ARCHIVEMATICA = require('../libs/archivematica'),
    DELETEDIP = require('../libs/delete-dip'),
    SERVICE = require('../repository/service'),
    LOGGER = require('../libs/log4'),
    DB = require('../config/db')(),
    DBQ = require('../config/dbqueue')(),
    REPO_OBJECTS = 'tbl_objects',
    ARCHIVESSPACE_QUEUE = 'tbl_archivesspace_queue';

/**
 * Gets object display record
 * @param req
 * @param callback
 */
exports.get_display_record = function (req, callback) {

    let pid = req.query.pid;

    if (pid === undefined || pid.length === 0) {
        callback({
            status: 400,
            message: 'Bad request.',
            data: []
        });

        return false;
    }

    DB(REPO_OBJECTS)
        .select('display_record')
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
            LOGGER.module().fatal('FATAL: [/repository/model module (get_display_record)] Unable to get display record ' + error);
            throw 'FATAL: [/repository/model module (get_display_record)] Unable to get display record ' + error;
        });
};

/**
 * Updates thumbnail
 * @param req
 * @param callback
 */
exports.update_thumbnail = function (req, callback) {

    if (req.body.pid === undefined || req.body.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }

    let pid = req.body.pid;
    let thumbnail = req.body.thumbnail_url;
    let obj = {};
    obj.pid = pid;
    obj.thumbnail = thumbnail;

    DB(REPO_OBJECTS)
        .where({
            pid: obj.pid,
            is_active: 1
        })
        .update({
            thumbnail: obj.thumbnail
        })
        .then(function (data) {

            // Get existing record from repository
            DB(REPO_OBJECTS)
                .select('*')
                .where({
                    pid: obj.pid,
                    is_active: 1
                })
                .then(function (data) {

                    if (data.length === 0) {
                        LOGGER.module().info('INFO: [/repository/model module (update_thumbnail)] There were no repository records found to update');
                        return false;
                    }

                    let recordObj = {};
                    recordObj.pid = VALIDATOR.escape(data[0].pid);
                    recordObj.is_member_of_collection = VALIDATOR.escape(data[0].is_member_of_collection);
                    recordObj.object_type = VALIDATOR.escape(data[0].object_type);
                    recordObj.sip_uuid = VALIDATOR.escape(data[0].sip_uuid);
                    recordObj.handle = data[0].handle;
                    recordObj.entry_id = data[0].entry_id;
                    recordObj.thumbnail = data[0].thumbnail;
                    recordObj.object = data[0].file_name;
                    recordObj.mime_type = data[0].mime_type;
                    recordObj.mods = data[0].mods;
                    recordObj.is_published = data[0].is_published;

                    MODS.create_display_record(recordObj, function (result) {

                        let tmp = JSON.parse(result);

                        if (tmp.is_compound === 1 && tmp.object_type !== 'collection') {

                            let currentRecord = JSON.parse(data[0].display_record),
                                currentCompoundParts = currentRecord.display_record.parts;

                            delete tmp.display_record.parts;
                            delete tmp.compound;

                            if (currentCompoundParts !== undefined) {
                                tmp.display_record.parts = currentCompoundParts;
                                tmp.compound = currentCompoundParts;
                            }

                            obj.display_record = JSON.stringify(tmp);

                        } else if (tmp.is_compound === 0 || tmp.object_type === 'collection') {

                            obj.display_record = result;

                        }

                        DB(REPO_OBJECTS)
                            .where({
                                is_member_of_collection: recordObj.is_member_of_collection,
                                pid: recordObj.pid,
                                is_active: 1
                            })
                            .update({
                                display_record: obj.display_record
                            })
                            .then(function (data) {

                                // re-index admin record
                                REQUEST.post({
                                    url: CONFIG.apiUrl + '/api/admin/v1/indexer?api_key=' + CONFIG.apiKey,
                                    form: {
                                        'sip_uuid': recordObj.sip_uuid
                                    }
                                }, function (error, httpResponse, body) {

                                    if (error) {
                                        LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] ' + error);
                                        return false;
                                    }

                                    if (httpResponse.statusCode === 201) {

                                        // re-index record to public index if already published
                                        if (recordObj.is_published === 1) {

                                            // wait to make sure updated admin record is ready
                                            setTimeout(function () {

                                                let reindex_url = CONFIG.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + CONFIG.apiKey,
                                                    query = {
                                                        'bool': {
                                                            'must': {
                                                                'match_phrase': {
                                                                    'pid': recordObj.sip_uuid
                                                                }
                                                            }
                                                        }
                                                    };

                                                REQUEST.post({
                                                    url: reindex_url,
                                                    form: {
                                                        'query': query
                                                    },
                                                    timeout: 25000
                                                }, function (error, httpResponse, body) {

                                                    if (error) {
                                                        LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail ' + error);
                                                        return false;
                                                    }

                                                    if (httpResponse.statusCode === 201) {
                                                        return false;
                                                    } else {
                                                        LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] unable to update thumbnail ' + httpResponse.statusCode + '/' + body);
                                                        return false;
                                                    }

                                                });

                                            }, 7000);
                                        }

                                        return false;
                                    } else {
                                        LOGGER.module().error('ERROR: [/repository/model module (update_thumbnail)] http error ' + httpResponse.statusCode + '/' + body);
                                        return false;
                                    }
                                });

                            })
                            .catch(function (error) {
                                LOGGER.module().fatal('FATAL: [/repository/model module (update_thumbnail/create_display_record/MODS.create_display_record)] unable to update display record ' + error);
                                throw 'FATAL: [/repository/model module (update_thumbnail/create_display_record/MODS.create_display_record)] unable to update display record ' + error;
                            });
                    });

                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (update_thumbnail)] unable to get mods update records ' + error);
                    throw 'FATAL: [/repository/model module (update_thumbnail)] unable to get mods update records ' + error;
                });

            callback({
                status: 201,
                message: 'Thumbnail updated.'
            });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error);
            throw 'FATAL: [/repository/model module (update_thumbnail)] unable to update mods records ' + error;
        });
};

/**
 * Updates MODS record in db
 * @param record
 * @param updated_record
 * @param obj
 * @param callback
 */
const update_mods = function (record, updated_record, obj, callback) {

    DB(REPO_OBJECTS)
        .where({
            mods_id: record.mods_id,
            is_active: 1
        })
        .update({
            mods: updated_record.mods,
            display_record: obj.display_record
        })
        .then(function (data) {

            DBQ(ARCHIVESSPACE_QUEUE)
                .where({
                    mods_id: record.mods_id
                })
                .update({
                    is_updated: 1
                })
                .then(function (data) {
                    obj.updates = true;
                    callback(obj);
                    return null;
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error);
                    throw 'FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error;
                });

            return null;
        })
        .catch(function (error) {
            LOGGER.module().fatal('FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error);
            throw 'FATAL: [/repository/model module (update_mods)] unable to update mods records ' + error;
        });
};

/**
 * Creates repository collection (admin dashboard)
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.create_collection_object = function (req, callback) {

    let data = req.body;

    if (data.uri === undefined || data.is_member_of_collection === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    function check_uri(callback) {

        let obj = {};

        DB(REPO_OBJECTS)
            .count('uri as uri')
            .where('uri', data.uri)
            .then(function (result) {

                if (result[0].uri === 1) {
                    obj.dupe = true;
                    callback(null, obj);
                    return false;
                }

                obj.dupe = false;
                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (create_collection_object)] unable to check uri ' + error);
            });
    }

    function get_session_token(obj, callback) {

        if (obj.dupe === true) {
            obj.session = null;
            callback(null, obj);
            return false;
        }

        (async() => {

            let uriArr = data.uri.split('/');
            let response = await HTTP.get({
                endpoint: '/api/admin/v1/import/metadata/session'
            });

            if (response.error === true) {
                obj.session = null;
                callback(null, obj);
            } else {
                obj.mods_id = uriArr[uriArr.length - 1];
                obj.uri = data.uri;
                obj.session = response.data.session;
                callback(null, obj);
            }

            return false;

        })();
    }

    function get_mods(obj, callback) {

        if (obj.session === null || obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        obj.mods_id = obj.uri;

        SERVICE.get_mods(obj, function(response) {

            if (response.error !== undefined && response.error === true) {

                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_mods)] unable to get mods ' + response.error_message);

                obj.mods = null;
                callback(null, obj);
                return false;
            }

            obj.object_type = 'collection';
            obj.is_member_of_collection = data.is_member_of_collection;
            delete obj.session;
            callback(null, obj);
        });
    }

    function get_pid(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        try {
            obj.pid = UUID(CONFIG.uuidDomain, UUID.DNS);
            obj.sip_uuid = obj.pid;
            callback(null, obj);
        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_pid)] unable to generate uuid');
            obj.pid = null;
            callback(null, obj);
        }
    }

    function get_handle(obj, callback) {

        if (obj.pid === null || obj.dupe === true) {
            obj.handle = null;
            callback(null, obj);
            return false;
        }

        LOGGER.module().info('INFO: [/repository/model module (create_collection_object/get_handle)] getting handle');

        HANDLES.create_handle(obj.pid, function (handle) {

            if (handle.error !== undefined && handle.error === true) {
                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/get_handle/handles.create_handle)] handle error');
                obj.handle = handle.message;
                callback(null, obj);
                return false;
            }

            obj.handle = handle;
            callback(null, obj);
        });
    }

    function create_display_record(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        let uriArr = obj.mods_id.split('/');
        obj.mods_id = uriArr[uriArr.length - 1];

        MODS.create_display_record(obj, function (result) {
            obj.display_record = result;
            callback(null, obj);
        });
    }

    function save_record(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        let record = {};
            record.mods_id = obj.mods_id;
            record.uri = obj.uri;
            record.mods = obj.mods;
            record.object_type = obj.object_type;
            record.is_member_of_collection = obj.is_member_of_collection;
            record.pid = obj.pid;
            record.sip_uuid = obj.sip_uuid;
            record.display_record = obj.display_record;

        DB(REPO_OBJECTS)
            .insert(record)
            .then(function (data) {
                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (create_collection_object/save_record)] unable to save collection record ' + error);
                obj.error = 'FATAL: unable to save collection record ' + error;
                callback(null, obj);
            });
    }

    function index_collection(obj, callback) {

        if (obj.dupe === true) {
            callback(null, obj);
            return false;
        }

        REQUEST.post({
            url: CONFIG.apiUrl + '/api/admin/v1/indexer?api_key=' + CONFIG.apiKey,
            form: {
                'sip_uuid': obj.sip_uuid
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record ' + error);
                obj.indexed = false;
                return false;
            }

            if (httpResponse.statusCode === 201) {
                obj.indexed = true;
                callback(null, obj);
                return false;
            } else {
                obj.indexed = false;
                LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/index_collection)] unable to index collection record ' + body);
            }
        });
    }

    ASYNC.waterfall([
        check_uri,
        get_session_token,
        get_mods,
        get_pid,
        // get_handle,
        create_display_record,
        save_record,
        index_collection
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (create_collection_object/async.waterfall)] ' + error);
        }

        if (results.dupe !== undefined && results.dupe === true) {

            callback({
                status: 200,
                message: 'Cannot create duplicate collection object.'
            });

        } else {

            LOGGER.module().info('INFO: [/repository/model module (create_collection_object/async.waterfall)] collection record saved');

            callback({
                status: 201,
                message: 'Object created.',
                data: [{'pid': results.pid}]
            });
        }
    });
};

/**
 * Publishes object(s)
 * @param req
 * @param callback
 */
exports.publish_objects = function (req, callback) {

    if (req.body.pid === undefined || req.body.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    /*
     Publish collections and associated objects
     */
    const pid = req.body.pid,
        type = req.body.type;

    function update_collection_record(callback) {

        let obj = {};
        obj.is_member_of_collection = pid;
        //obj.api_url = CONFIG.apiUrl + '/api/admin/v1/indexer';

        DB(REPO_OBJECTS)
            .where({
                pid: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_collection_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

        REQUEST.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.is_member_of_collection,
                'fragment': {
                    doc: {
                        is_published: 1
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    function publish_collection(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = CONFIG.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + CONFIG.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'pid': obj.is_member_of_collection
                        }
                    }
                }
            };

        REQUEST.post({
            url: reindex_url,
            form: {
                'query': query
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    function update_collection_object_records(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_child_objects)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_collection_object_docs(obj, callback) {

        DB(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1,
                is_active: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length === 0) {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;

                    } else {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

                        REQUEST.put({
                            url: update_doc_url,
                            form: {
                                'sip_uuid': record.sip_uuid,
                                'fragment': {
                                    doc: {
                                        is_published: 1
                                    }
                                }
                            },
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                                obj.status = 'failed';
                                return false;
                            }

                            if (httpResponse.statusCode === 201) {
                                return false;
                            } else {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                                obj.status = 'failed';
                            }

                        });
                    }

                }, 150);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (publish_objects/index_objects)] unable to index published object ' + error);
                callback(null, obj);
            });
    }

    function publish_collection_objects(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = CONFIG.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + CONFIG.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'is_member_of_collection': obj.is_member_of_collection
                        }
                    }
                }
            };

        REQUEST.post({
            url: reindex_url,
            form: {
                'query': query
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    /*
     Publish single objects
     */

    /*
     gets object's collection uuid
     */
    function get_collection_uuid(callback) {

        let obj = {};
        obj.sip_uuid = pid;

        if (obj.sip_uuid === undefined || obj.sip_uuid.length === 0) {
            return false;
        }

        DB(REPO_OBJECTS)
            .select('is_member_of_collection')
            .where({
                sip_uuid: obj.sip_uuid,
                is_active: 1
            })
            .then(function (data) {
                obj.is_member_of_collection = VALIDATOR.escape(data[0].is_member_of_collection);
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error);
                throw 'FATAL: [/repository/model module (get_admin_object)] Unable to get object ' + error;
            });
    }

    /*
     checks if collection is published
     */
    function check_collection(obj, callback) {

        DB(REPO_OBJECTS)
            .select('is_published')
            .where({
                pid: obj.is_member_of_collection,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {

                if (data.length === 0) {
                    obj.is_published = false;
                } else if (data.length > 0) {
                    obj.is_published = true;
                }

                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (check_collection)] Unable to check collection ' + error);
                throw 'FATAL: [/repository/model module (check_collection)] Unable to check collection ' + error;
            });
    }

    function update_object_record(obj, callback) {

        if (obj.is_published === false) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                sip_uuid: obj.sip_uuid,
                is_active: 1
            })
            .update({
                is_published: 1
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    function update_object_doc(obj, callback) {

        if (obj.is_published === false) {
            callback(null, obj);
            return false;
        }

        setTimeout(function () {

            let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

            REQUEST.put({
                url: update_doc_url,
                form: {
                    'sip_uuid': obj.sip_uuid,
                    'fragment': {
                        doc: {
                            is_published: 1
                        }
                    }
                },
                timeout: 25000
            }, function (error, httpResponse, body) {

                if (error) {
                    LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                    obj.status = 'failed';
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    callback(null, obj);
                    return false;
                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                    obj.status = 'failed';
                    callback(null, obj);
                }
            });

        }, 500);
    }

    function publish_object(obj, callback) {

        if (obj.is_published === false || obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let reindex_url = CONFIG.apiUrl + '/api/admin/v1/indexer/reindex?api_key=' + CONFIG.apiKey,
            query = {
                'bool': {
                    'must': {
                        'match_phrase': {
                            'pid': obj.sip_uuid
                        }
                    }
                }
            };

        setTimeout(function () {

            REQUEST.post({
                url: reindex_url,
                form: {
                    'query': query
                },
                timeout: 25000
            }, function (error, httpResponse, body) {

                if (error) {
                    LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection admin record ' + error);
                    obj.status = 'failed';
                    callback(null, obj);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    callback(null, obj);
                    return false;
                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                    obj.status = 'failed';
                    callback(null, obj);
                }

            });

        }, 3000);
    }

    // publish collection and all of its objects
    if (type === 'collection') {

        ASYNC.waterfall([
            update_collection_record,
            update_collection_doc,
            publish_collection,
            update_collection_object_records,
            update_collection_object_docs,
            publish_collection_objects
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error);
                throw 'ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error;
            }

            LOGGER.module().info('INFO: [/repository/model module (publish_objects/async.waterfall)] collection published');
        });

        callback({
            status: 201,
            message: 'Collection Published',
            data: []
        });

        return false;
    }

    if (type === 'object') {

        ASYNC.waterfall([
            get_collection_uuid,
            check_collection,
            update_object_record,
            update_object_doc,
            publish_object
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error);
                throw 'ERROR: [/repository/model module (publish_objects/async.waterfall)] ' + error;
            }

            if (results.is_published === false) {

                callback({
                    status: 418,
                    message: 'Object not published',
                    data: []
                });

            } else {

                LOGGER.module().info('INFO: [/repository/model module (publish_objects/async.waterfall)] object published');

                callback({
                    status: 201,
                    message: 'Object Published',
                    data: []
                });
            }

        });

        return false;
    }
};

/**
 * Unpublishes records
 * @param req
 * @param callback
 */
exports.unpublish_objects = function (req, callback) {

    const type = req.body.type,
        pid = req.body.pid;

    if (pid === undefined || pid.length === 0 || type === undefined) {
        return false;
    }

    // remove record from public index
    function unpublish_collection(callback) {

        let obj = {};
        obj.is_member_of_collection = pid;

        REQUEST.delete({
            url: CONFIG.apiUrl + '/api/admin/v1/indexer?pid=' + obj.is_member_of_collection + '&api_key=' + CONFIG.apiKey,
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection)] unable to remove published record from index ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 204) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unpublish_collection)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }
        });
    }

    // unpublish objects
    function unpublish_collection_docs(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .select('sip_uuid')
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_published: 1,
                is_active: 1
            })
            .then(function (data) {

                let timer = setInterval(function () {

                    if (data.length > 0) {

                        let record = data.pop();

                        if (record.sip_uuid === null) {
                            return false;
                        }

                        // remove objects from public index
                        REQUEST.delete({
                            url: CONFIG.apiUrl + '/api/admin/v1/indexer?pid=' + record.sip_uuid + '&api_key=' + CONFIG.apiKey,
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                                return false;
                            }

                            if (httpResponse.statusCode === 204) {
                                return false;
                            } else {
                                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                            }
                        });

                        // update admin objects to unpublished status
                        let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

                        REQUEST.put({
                            url: update_doc_url,
                            form: {
                                'sip_uuid': record.sip_uuid,
                                'fragment': {
                                    doc: {
                                        is_published: 0
                                    }
                                }
                            },
                            timeout: 25000
                        }, function (error, httpResponse, body) {

                            if (error) {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                                obj.status = 'failed';
                                return false;
                            }

                            if (httpResponse.statusCode === 201) {
                                return false;
                            } else {
                                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                                obj.status = 'failed';
                            }
                        });

                    } else {

                        clearInterval(timer);
                        callback(null, obj);
                        return false;
                    }

                }, 250);

                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                callback(null, obj);
            });
    }

    // update indexed admin collection record
    function update_collection_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

        REQUEST.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.is_member_of_collection,
                'fragment': {
                    doc: {
                        is_published: 0
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    // update db record
    function update_collection_record(obj, callback) {

        DB(REPO_OBJECTS)
            .where({
                sip_uuid: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_collection)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    // update db records
    function update_collection_object_records(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                is_member_of_collection: obj.is_member_of_collection,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/publish_child_objects)] unable to publish collection pid ' + error);
                callback(null, 'failed');
            });
    }

    /*
     unpublish single objects
     */

    // remove record from public index
    function unpublish_object(callback) {

        let obj = {};
        // obj.api_url = CONFIG.apiUrl + '/api/admin/v1/indexer';
        obj.pid = pid;

        if (obj.pid === undefined || obj.pid.length === 0) {
            return false;
        }

        REQUEST.delete({
            url: CONFIG.apiUrl + '/api/admin/v1/indexer?pid=' + obj.pid + '&api_key=' + CONFIG.apiKey,
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 204) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                callback(null, obj);
            }
        });
    }

    // update indexed admin object record
    function update_object_doc(obj, callback) {

        if (obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        let update_doc_url = CONFIG.apiUrl + '/api/admin/v1/indexer/update_fragment?api_key=' + CONFIG.apiKey;

        REQUEST.put({
            url: update_doc_url,
            form: {
                'sip_uuid': obj.pid,
                'fragment': {
                    doc: {
                        is_published: 0
                    }
                }
            },
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (publish_objects/reindex_admin_collection)] unable to update collection admin record ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }

        });
    }

    // update db record
    function update_object_record(obj, callback) {

        if (obj.status !== undefined && obj.status === 'failed') {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                pid: obj.pid,
                is_active: 1
            })
            .update({
                is_published: 0
            })
            .then(function (data) {
                callback(null, obj);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/update_object_record)] unable to unpublish object ' + error);
                obj.status = 'failed';
                callback(null, obj);
            });
    }

    // unpublish collection and all of its objects
    if (type === 'collection') {

        ASYNC.waterfall([
            unpublish_collection,
            unpublish_collection_docs,
            update_collection_doc,
            update_collection_record,
            update_collection_object_records
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            LOGGER.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] collection unpublished');
        });

        callback({
            status: 201,
            message: 'Collection unpublished',
            data: []
        });

        return false;

    } else if (type === 'object') {

        ASYNC.waterfall([
            unpublish_object,
            update_object_doc,
            update_object_record
        ], function (error, results) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/async.waterfall)] ' + error);
                throw 'ERROR: async (unpublish_object)';
            }

            LOGGER.module().info('INFO: [/repository/model module (unpublish_objects/async.waterfall)] object unpublished');
        });

        callback({
            status: 201,
            message: 'Object unpublished',
            data: []
        });

        return false;

    } else {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }
};

/**
 * Recreates display record
 * @param req
 * @param callback
 */
exports.reset_display_record = function (req, callback) {

    if (req.body.pid === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    function get_data(callback) {

        let obj = {};
        let sip_uuid = req.body.pid;

        // single record
        DB(REPO_OBJECTS)
            .select('*')
            .where({
                pid: sip_uuid,
                is_active: 1
            })
            .then(function (data) {
                obj.data = data;
                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error);
                throw 'FATAL: [/repository/model module (reset_display_record/get_data)] unable to get record ' + error;
            });
    }

    function create_display_record(obj, callback) {

        let record = obj.data.pop();

        MODS.create_display_record(record, function (display_record) {

            let recordObj = JSON.parse(display_record);

            DB(REPO_OBJECTS)
                .where({
                    is_member_of_collection: recordObj.is_member_of_collection,
                    pid: recordObj.pid,
                    is_active: 1
                })
                .update({
                    display_record: display_record
                })
                .then(function (data) {
                    obj.sip_uuid = recordObj.pid;
                    obj.is_published = recordObj.is_published;
                    callback(null, obj);
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/repository/model module (reset_display_record/create_display_record/MODS.create_display_record)] unable to save collection record ' + error);
                    throw 'FATAL: [/repository/model module (reset_display_record/create_display_record/MODS.create_display_record)] unable to save collection record ' + error;
                });
        });
    }

    function admin_index(obj, callback) {

        // update admin index
        REQUEST.post({
            url: CONFIG.apiUrl + '/api/admin/v1/indexer?api_key=' + CONFIG.apiKey,
            form: {
                'sip_uuid': obj.sip_uuid
            }
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] indexer error ' + error);
                return false;
            }

            if (httpResponse.statusCode === 201) {
                obj.admin_index = true;
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/admin_index)] http error ' + httpResponse.statusCode + '/' + body);
                obj.admin_index = false;
                callback(null, obj);
                return false;
            }
        });
    }

    function public_index(obj, callback) {

        if (obj.is_published === 1) {

            // update public index
            REQUEST.post({
                url: CONFIG.apiUrl + '/api/admin/v1/indexer?api_key=' + CONFIG.apiKey,
                form: {
                    'sip_uuid': obj.sip_uuid,
                    'publish': true
                }
            }, function (error, httpResponse, body) {

                if (error) {
                    LOGGER.module().error('ERROR: [/repository/model module (update_metadata_cron/update_records/update_mods)] indexer error ' + error);
                    return false;
                }

                if (httpResponse.statusCode === 201) {
                    obj.public_index = true;
                    callback(null, obj);
                    return false;
                } else {
                    LOGGER.module().error('ERROR: [/repository/model module (update_metadata_cron/update_records/update_mods)] http error ' + httpResponse.statusCode + '/' + body);
                    obj.public_index = false;
                    callback(null, obj);
                    return false;
                }
            });
        } else {
            obj.public_index = false;
            callback(null, obj);
        }
    }

    ASYNC.waterfall([
        get_data,
        create_display_record,
        admin_index,
        public_index
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        LOGGER.module().info('INFO: [/repository/model module (reset_display_record/async.waterfall)] display record reset');
    });

    callback({
        status: 201,
        message: 'updating display record(s).'
    });
};

/**
 * Deletes repository object (DB, Index, and creates archivematica delete request)
 * @param req
 * @param callback
 */
exports.delete_object = function (req, callback) {

    let pid = req.body.pid;
    let delete_reason = req.body.delete_reason;

    function check_if_published(callback) {

        let obj = {};
        obj.pid = pid;
        obj.delete_reason = delete_reason;

        DB(REPO_OBJECTS)
            .count('is_published as is_published')
            .where({
                pid: obj.pid,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                // delete only if object is not published
                if (data[0].is_published === 0) {
                    obj.is_published = false;
                } else {
                    obj.is_published = true;
                }

                callback(null, obj);
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object/check_if_published)] Unable to delete record ' + error;
            });
    }

    function delete_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        DB(REPO_OBJECTS)
            .where({
                pid: obj.pid
            })
            .update({
                is_active: 0
            })
            .then(function (data) {

                if (data === 1) {
                    callback(null, obj);
                }
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to delete record ' + error);
                throw 'FATAL: [/repository/model module (delete_object)] unable to delete record ' + error;
            });
    }

    function unindex_record(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        REQUEST.delete({
            url: CONFIG.apiUrl + '/api/admin/v1/indexer/delete?pid=' + obj.pid + '&api_key=' + CONFIG.apiKey,
            timeout: 25000
        }, function (error, httpResponse, body) {

            if (error) {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + error);
                obj.status = 'failed';
                callback(null, obj);
                return false;
            }

            if (httpResponse.statusCode === 204) {
                callback(null, obj);
                return false;
            } else {
                LOGGER.module().error('ERROR: [/repository/model module (unpublish_objects/unindex_objects)] unable to remove published record from index ' + httpResponse.statusCode + '/' + body);
                obj.status = 'failed';
                callback(null, obj);
            }
        });
    }

    function delete_aip_request(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        ARCHIVEMATICA.delete_aip_request(obj, function(result) {

            if (result.error === false) {

                obj.delete_id = result.data.id;

                DB(REPO_OBJECTS)
                    .where({
                        pid: obj.pid
                    })
                    .update({
                        delete_id: obj.delete_id
                    })
                    .then(function (data) {

                        if (data === 1) {
                            LOGGER.module().info('INFO: [/repository/model module (delete_object/delete_aip_request)] delete id ' + obj.delete_id + ' saved');
                            callback(null, obj);
                        }
                    })
                    .catch(function (error) {
                        LOGGER.module().fatal('FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error);
                        throw 'FATAL: [/repository/model module (delete_object)] unable to save delete id ' + error;
                    });

            } else {
                LOGGER.module().error('ERROR: [/repository/model module (delete_object/delete_aip_request)] unable to create delete aip request');
                obj.delete_id = false;
            }
        });
    }

    // TODO: doesn't work
    /*
    function delete_aip_request_approval(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        if (obj.delete_id !== false) {
            ARCHIVEMATICA.delete_aip_request_approval(obj, function(result) {
                callback(null, obj);
            });
        }
    }
    */

    // TODO: remove
    /*
    function delete_dip(obj, callback) {

        if (obj.is_published === true) {
            callback(null, obj);
            return false;
        }

        DELETEDIP.delete_dip(obj, function(result) {
            callback(null, result);
        });
    }
    */

    ASYNC.waterfall([
        check_if_published,
        delete_record,
        unindex_record,
        delete_aip_request
        // delete_aip_request_approval // approval not working (nightmare/electron dependency issue)
        // delete_dip  // occurs automatically when delete is approved in storage service
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] ' + error);
        }

        // delete link only appears when record is unpublished
        if (results.is_published === true) {

            LOGGER.module().error('ERROR: [/repository/model module (delete_object/async.waterfall)] Cannot delete published object. ');
            return false;
        }

        LOGGER.module().info('INFO: [/repository/model module (delete_object/async.waterfall)] object deleted.');
    });

    callback({
        status: 204,
        message: 'Delete object.'
    });
};