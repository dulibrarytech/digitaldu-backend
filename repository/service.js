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
    ARCHIVEMATICA = require('../libs/archivematica'),
    ARCHIVESSPACE = require('../libs/archivespace'),
    DURACLOUD = require('../libs/duracloud'),
    OBJECT_SERVICE = require('../libs/object-service'),
    LOGGER = require('../libs/log4'),
    ASYNC = require('async'),
    ES = require('elasticsearch'),
    CLIENT = new ES.Client({
        host: CONFIG.elasticSearch
    });

/**
 * Pings third-party services to determine availability
 * @param req
 * @param callback
 */
exports.ping_services = function (req, callback) {

    function ping_archivematica(callback) {

        ARCHIVEMATICA.ping_api(function (response) {
            let obj = {};
            obj.archivematica = response.status;
            callback(null, obj);
        });
    }

    function ping_archivematica_storage(obj, callback) {

        ARCHIVEMATICA.ping_storage_api(function (response) {
            obj.archivematica_storage = response.status;
            callback(null, obj);
        });
    }

    function ping_archivesspace(obj, callback) {

        ARCHIVESSPACE.ping(function (response) {
            obj.archivespace = response.status;
            callback(null, obj);
        });

    }

    function ping_duracloud(obj, callback) {

        DURACLOUD.ping(function (response) {
            obj.duracloud = response.status;
            callback(null, obj);
        });
    }

    ASYNC.waterfall([
        ping_archivematica,
        ping_archivematica_storage,
        ping_archivesspace,
        ping_duracloud
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/service module (ping_services/async.waterfall)] unable to ping third-party services ' + error);
            return false;
        }

        callback({
            status: 200,
            message: 'Services pinged.',
            data: results
        });
    });
};

/**
 * Gets thumbnail
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.get_thumbnail = function (req, callback) {

    let tn = req.query.tn;

    if (tn === undefined || tn.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    DURACLOUD.get_thumbnail(tn, function (response) {
        callback(response);
    });
};

/**
 * Gets thumbnail from TN service
 * @param req
 * @param callback
 * @returns {boolean}
 */
exports.get_tn = function (req, callback) {

    let uuid = req.query.uuid,
        type = req.query.type;

    if (uuid === undefined || uuid.length === 0 || type === undefined) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    OBJECT_SERVICE.get_tn(uuid, type, function (response) {
        callback(response);
    });
};

/**
 * Gets object viewer
 * @param req
 * @param callback
 */
exports.get_viewer = function (req, callback) {

    let uuid = req.query.uuid;

    if (uuid === undefined || uuid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let apiUrl = CONFIG.tnService + 'discovery/viewer/' + uuid + '?key=' + CONFIG.tnServiceApiKey;

    callback({
        status: 200,
        data: apiUrl
    });
};

/**
 * Gets objects by collection
 * @param req
 * @param callback
 */
exports.get_admin_objects = function (req, callback) {

    if (req.query.pid === undefined || req.query.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let is_member_of_collection = req.query.pid,
        page = req.query.page,
        total_on_page = 10,
        sort = 'title.keyword:asc';

    if (req.query.total_on_page !== undefined) {
        total_on_page = req.query.total_on_page;
    }

    if (req.query.sort !== undefined) {
        sort = req.query.sort;
    }

    if (page === undefined) {
        page = 0;
    } else {
        page = (page - 1) * total_on_page;
    }

    let query = {
        'query': {
            'bool': {
                'must': {
                    'match': {
                        'is_member_of_collection.keyword': is_member_of_collection
                    }
                }
            }
        }
    };

    CLIENT.search({
        from: page,
        size: total_on_page,
        index: CONFIG.elasticSearchBackIndex,
        type: 'data',
        sort: sort,
        body: query
    }).then(function (body) {

        callback({
            status: 200,
            data: body.hits
        });
    }, function (error) {
        callback(error);
    });
};

/**
 * Gets unpublished objects by collection
 * @param req
 * @param callback
 */
exports.get_unpublished_admin_objects = function (req, callback) {

    if (req.query.pid === undefined || req.query.pid.length === 0) {

        callback({
            status: 400,
            message: 'Bad request.'
        });

        return false;
    }

    let is_member_of_collection = req.query.pid,
        page = req.query.page,
        total_on_page = 10,
        sort = 'title.keyword:asc';

    if (req.query.total_on_page !== undefined) {
        total_on_page = req.query.total_on_page;
    }

    if (req.query.sort !== undefined) {
        sort = req.query.sort;
    }

    if (page === undefined) {
        page = 0;
    } else {
        page = (page - 1) * total_on_page;
    }

    let query = {
        'query': {
            'bool': {
                'must': [{
                    'match': {
                        'is_member_of_collection.keyword': is_member_of_collection
                    }
                },
                    {
                        'match': {
                            'is_published': 0
                        }
                    }]
            }
        }
    };

    CLIENT.search({
        from: page,
        size: total_on_page,
        index: CONFIG.elasticSearchBackIndex,
        type: 'data',
        sort: sort,
        body: query
    }).then(function (body) {

        callback({
            status: 200,
            data: body.hits
        });
    }, function (error) {
        callback(error);
    });
};