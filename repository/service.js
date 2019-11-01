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

const archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    duracloud = require('../libs/duracloud'),
    logger = require('../libs/log4'),
    async = require('async'),
    config = require('../config/config'),
    es = require('elasticsearch'),
    client = new es.Client({
        host: config.elasticSearch
    });

/**
 * Pings third-party services to determine availability
 * @param req
 * @param callback
 */
exports.ping_services = function (req, callback) {

    function ping_archivematica(callback) {

        archivematica.ping_api(function (response) {
            let obj = {};
            obj.archivematica = response.status;
            callback(null, obj);
        });
    }

    function ping_archivematica_storage(obj, callback) {

        archivematica.ping_storage_api(function (response) {
            obj.archivematica_storage = response.status;
            callback(null, obj);
        });
    }

    function ping_archivespace(obj, callback) {

        archivespace.ping(function (response) {
            obj.archivespace = response.status;
            callback(null, obj);
        });

    }

    function ping_duracloud(obj, callback) {

        duracloud.ping(function (response) {
            obj.duracloud = response.status;
            callback(null, obj);
        });
    }

    async.waterfall([
        ping_archivematica,
        ping_archivematica_storage,
        ping_archivespace,
        ping_duracloud
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: [/repository/service module (ping_services/async.waterfall)] unable to ping third-party services ' + error);
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

    if (tn === undefined) {

        callback({
            status: 400,
            message: 'Bad request'
        });

        return false;
    }

    duracloud.get_thumbnail(tn, function (response) {
        callback(response);
    });
};

/**
 *
 * @param req
 * @param callback
 */
exports.get_admin_objects = function (req, callback) {

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
                        'is_member_of_collection': is_member_of_collection
                    }
                }
            }
        }
    };

    client.search({
        from: page,
        size: total_on_page,
        index: config.elasticSearchBackIndex,
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