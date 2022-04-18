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
    ARCHIVESSPACE = require('../libs/archivespace'),
    DURACLOUD = require('../libs/duracloud'),
    HTTP = require('axios'),
    LOGGER = require('../libs/log4'),
    CACHE = require('../libs/cache'),
    PING_TASKS = require('../repository/tasks/ping_tasks'),
    ES = require('elasticsearch'),
    CLIENT = new ES.Client({
        host: CONFIG.elasticSearch
    }),
    {file} = require("elasticsearch/src/lib/loggers");

/**
 * Pings third-party services to determine availability
 * @param req
 * @param callback
 */
exports.ping_services = function (req, callback) {

    (async () => {

        try {

            let results = {};
            const TASKS = new PING_TASKS();
            results.archivematica_status = await TASKS.ping_archivematica();
            results.archivematica_storage_status = await TASKS.ping_archivematica_storage();
            results.archivesspace_status = await TASKS.ping_archivesspace();
            results.duracloud_status = await TASKS.ping_duracloud();
            results.handle_server_status = await TASKS.ping_handle_server();
            results.convert_service_status = await TASKS.ping_convert_service();
            results.transcript_service_status = await TASKS.ping_transcript_service();

            callback({
                status: 200,
                message: 'Services pinged.',
                data: results
            });

        } catch (error) {
            callback({
                status: 500,
                message: 'Unable to ping services ' + error.message
            });
        }

    })();
};

/**
 * Gets thumbnail from duracloud service
 * @param tn
 * @param callback
 * @returns response
 */
exports.get_duracloud_thumbnail = function (tn, callback) {
    DURACLOUD.get_thumbnail(tn, function (response) {
        callback(response);
    });
};

/**
 * Gets thumbnail from Front-end TN service
 * @param uuid
 * @param callback
 */
exports.get_tn_service_image = function (uuid, callback) {

    /* TODO: test and confirm type is not needed
    if (req.query.type !== undefined) {
        let type = VALIDATOR.unescape(req.query.type);
    }
     */

    (async () => {

        let missing_tn = '/images/image-tn.png';

        try {

            let endpoint = CONFIG.tnService + 'datastream/' + uuid + '/tn?key=' + CONFIG.tnServiceApiKey;
            let response = await HTTP.get(endpoint, {
                timeout: 45000,
                responseType: 'arraybuffer',
                headers: {
                    'x-api-key': CONFIG.tnServiceApiKey
                }
            });

            if (response.status !== 200) {

                LOGGER.module().error('ERROR: [/repository/service module (get_tn_service_image)] Unable to get thumbnail from TN service.');

                callback({
                    error: true,
                    status: 200,
                    data: missing_tn
                });

            } else if (response.status === 200) {
                CACHE.cache_tn(uuid, response.data);
                callback({
                    error: false,
                    status: 200,
                    data: response.data
                });
            }

            return false;

        } catch (error) {

            LOGGER.module().error('ERROR: [/repository/service module (get_tn_service_image)] Unable to get thumbnail from TN service. Request failed: ' + error.message);

            callback({
                error: true,
                status: 200,
                data: missing_tn
            });
        }

    })();
};

/**
 * Gets image from image server
 * @param obj
 * @param callback
 */
exports.get_convert_service_image = function (obj, callback) {

    (async () => {

        try {
            // TODO: place convert service endpoint in config file
            let endpoint = CONFIG.convertService + '/repository/v1/image?filename=' + obj.object_name + '&api_key=' + CONFIG.convertServiceApiKey;
            let response = await HTTP.get(endpoint, {
                timeout: 45000,
                responseType: 'arraybuffer'
            });

            if (response.status === 200) {
                callback({
                    error: false,
                    status: 200,
                    data: response.data
                });
            }

            return false;

        } catch (error) {
            LOGGER.module().error('ERROR: [/repository/service module (get_convert_service_image)] Unable to get image: ' + error.message);
            LOGGER.module().info('INFO: [/repository/service module (get_convert_service_image)] Sending data to image convert service');
            // create missing file
            setTimeout(function() {
                DURACLOUD.convert_service(obj);
            }, 5000);
        }

    })();
};

/**
 * Gets object viewer for non-images
 * @param uuid
 * @param callback
 */
exports.get_object_viewer = function (uuid, callback) {

    let apiUrl = CONFIG.tnService + 'viewer/' + uuid + '?key=' + CONFIG.tnServiceApiKey;

    callback({
        status: 200,
        data: apiUrl
    });
};

/**
 * Gets records by collection
 * @param is_member_of_collection
 * @param page
 * @param total_on_page
 * @param sort
 * @param callback
 */
exports.get_records = function (is_member_of_collection, page, total_on_page, sort, callback) {

    let total_on_page_default = 10;
    let sort_default = 'title.keyword:asc';

    if (total_on_page === undefined) {
        total_on_page = total_on_page_default;
    }

    if (sort === undefined) {
        sort = sort_default;
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
        sort: sort,
        body: query
    }).then(function (body) {

        callback({
            status: 200,
            data: body.hits
        });
    }, function (error) {

        LOGGER.module().error('ERROR: [/repository/service module (get_records)] Request to Elasticsearch failed: ' + error);

        callback({
            status: 500,
            data: error
        });
    });
};

/**
 * Gets suppressed records by collection
 * @param uuid
 * @param callback
 */
exports.get_suppressed_records = function (uuid, callback) {

    let is_member_of_collection = req.query.uuid,
        page = 0,
        total_on_page = 10000,
        sort = 'title.keyword:asc';

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
        sort: sort,
        body: query
    }).then(function (body) {

        callback({
            status: 200,
            data: body.hits
        });
    }, function (error) {

        LOGGER.module().error('ERROR: [/repository/service module (get_suppressed_records)] Request to Elasticsearch failed: ' + error);

        callback({
            status: 500,
            data: error
        });
    });
};

/** TODO: move to task obj?
 * Gets mods record
 * @param obj
 * @param callback
 */
exports.get_mods = function (obj, callback) {

    ARCHIVESSPACE.get_mods(obj.mods_id, obj.session, function (result) {

        if (result.error === false) {
            obj.error = result.error;
            obj.mods = JSON.stringify(result.mods.data);
        } else {
            obj.error = result.error;
            obj.mods = null;
        }

        callback(obj);
    });
};