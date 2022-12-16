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

const HTTP = require('axios');
const {Client} = require("@elastic/elasticsearch");
const ES_CONFIG = require('../config/elasticsearch_config')();
const ARCHIVESSPACE_CONFIG = require('../config/archivesspace_config')();
const ARCHIVEMATICA_CONFIG = require('../config/archivematica_config')();
const DURACLOUD_CONFIG = require('../config/duracloud_config')();
const HANDLE_CONFIG = require('../config/handle_config')();
const WEBSERVICES_CONFIG = require('../config/webservices_config')();
const HANDLES = require('../libs/handles');
const DURACLOUD = require('../libs/duracloud');
const ARCHIVEMATICA = require('../libs/archivematica');
const ARCHIVESSPACE = require('../libs/archivesspace');
const CACHE = require('../libs/cache');
const PING_TASKS = require('../repository/tasks/ping_tasks');
const SEARCH_TASKS = require('../search/tasks/search_tasks');
const LOGGER = require('../libs/log4');
const CLIENT = new Client({
    node: ES_CONFIG.elasticsearch_host
});

/**
 * Pings third-party services to determine availability
 * @param callback
 */
exports.ping_services = function (callback) {

    (async () => {

        try {

            let results = {};
            const ARCHIVEMATICA_LIB = new ARCHIVEMATICA(ARCHIVEMATICA_CONFIG);
            const DURACLOUD_LIB = new DURACLOUD(DURACLOUD_CONFIG);
            const HANDLES_LIB = new HANDLES(HANDLE_CONFIG);
            const ARCHIVESSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
            const TASKS = new PING_TASKS(ARCHIVEMATICA_LIB, DURACLOUD_LIB, HANDLES_LIB, ARCHIVESSPACE_LIB, ARCHIVESSPACE_LIB);
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
            LOGGER.module().error('ERROR: [/repository/service module (ping_services)] Unable to ping third-party services.');
            callback({
                status: 500,
                message: 'Unable to ping services ' + error.message
            });
        }

    })();
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

    (async () => {

        try {

            const TASK = new SEARCH_TASKS(CLIENT, ES_CONFIG);
            let data = await TASK.get_records(is_member_of_collection, page, total_on_page, sort);

            if (data !== false) {
                callback({
                    status: 200,
                    data: data
                });
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/repository/service module (get_records)] Request to Elasticsearch failed: ' + error.message);

            callback({
                status: 500,
                data: error
            });
        }

    })();
};

/**
 * Gets thumbnail from duracloud service
 * @param tn
 * @param callback
 */
exports.get_duracloud_thumbnail = function (tn, callback) {

    (async () => {

        try {
            const DURACLOUD_LIB = new DURACLOUD(DURACLOUD_CONFIG);
            let response = await DURACLOUD_LIB.get_thumbnail(tn);
            callback(response);
        } catch (error) {
            callback(error);
        }

    })();
};

/**
 * Gets thumbnail from Front-end TN service
 * @param uuid
 * @param callback
 */
exports.get_tn_service_image = function (uuid, callback) {

    (async () => {

        let missing_tn = '/images/image-tn.png';

        try {

            let endpoint = WEBSERVICES_CONFIG.tn_service + 'datastream/' + uuid + '/tn?key=' + WEBSERVICES_CONFIG.tn_service_api_key;
            let response = await HTTP.get(endpoint, {
                timeout: 45000,
                responseType: 'arraybuffer',
                headers: {
                    'x-api-key': WEBSERVICES_CONFIG.tn_service_api_key
                }
            });

            if (response.status === 200) {
                CACHE.cache_tn(uuid, response.data);
                callback({
                    error: false,
                    status: 200,
                    data: response.data
                });
            }

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

            let endpoint = WEBSERVICES_CONFIG.convert_service + WEBSERVICES_CONFIG.convert_service_endpoint + obj.object_name + '&api_key=' + WEBSERVICES_CONFIG.convert_service_api_key;
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

    let apiUrl =  WEBSERVICES_CONFIG.tn_service + 'viewer/' + uuid + '?key=' + WEBSERVICES_CONFIG.tn_service_api_key;

    callback({
        status: 200,
        data: apiUrl
    });
};

/**
 * Gets suppressed records by collection
 * @param uuid
 * @param callback
 */
exports.get_suppressed_records = function (uuid, callback) {

    (async () => {

        try {

            const TASK = new SEARCH_TASKS(CLIENT, ES_CONFIG);
            let data = await TASK.get_suppressed_records(uuid);

            if (data !== false) {
                callback({
                    status: 200,
                    data: data
                });
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [/repository/service module (get_suppressed_records)] Request to Elasticsearch failed: ' + error.message);

            callback({
                status: 500,
                data: error
            });
        }

    })();
};
