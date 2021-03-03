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

const HTTP = require('axios'),
    CONFIG = require('../config/config'),
    LOGGER = require('../libs/log4'),
    TIMEOUT = 25000;

/**
 * constructs query string
 * @param request_obj
 * @returns {*}
 */
const serialize_params = function(request_obj) {

    let url;

    // overrides app endpoints when making request to third-party service
    if (request_obj.url !== undefined && request_obj.endpoint === undefined) {

        url = request_obj.url;
        delete request_obj.url;
        delete request_obj.endpoint;
        return url;

    } else {

        let params = request_obj.params;
        let query_string = '';
        let url = CONFIG.apiUrl;
        url += request_obj.endpoint;
        url += '?api_key=' + CONFIG.apiKey;

        if (params !== undefined) {

            for (let prop in params) {
                query_string += '&' + prop + '=' + params[prop];
            }

            url += query_string;
        }

        return url;
    }
};

/**
 * GET requests
 * @param request_obj
 * @returns {*}
 */
exports.get = function(request_obj) {

    if (request_obj === undefined) {
        LOGGER.module().error('ERROR: [HTTP libs (get)] Missing request object.');
        return false;
    }

    let url = serialize_params(request_obj);

    if (request_obj.timeout === undefined) {
        request_obj.timeout = TIMEOUT;
    }

    async function get() {
        console.log(request_obj);
        try {

            let response = await HTTP.get(url, request_obj);

            if (response.status === 200) {

                return {
                    error: false,
                    message: response.statusText,
                    data: response.data
                };

            } else {

                LOGGER.module().error('ERROR: [HTTP libs (get)] HTTP GET request failed.');

                return {
                    error: true,
                    message: response.statusText,
                    data: null
                };
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [HTTP libs (get)] HTTP GET request failed. ' + error);

            return {
                error: true,
                message: error,
                data: null
            };
        }
    }

    return get();
};

/**
 * POST request
 * @param request_obj
 * @returns {*}
 */
exports.post = function(request_obj) {

    if (request_obj === undefined) {
        LOGGER.module().error('ERROR: [HTTP libs (post)] Missing request object.');
        return false;
    }

    async function post() {

        let data = request_obj.data;
        let url = serialize_params(request_obj);

        if (request_obj.timeout === undefined) {
            request_obj.timeout = TIMEOUT;
        }

        try {

            let response = await HTTP.post(url, data, request_obj);

            if (response.status === 201 || response.status === 200) {

                return {
                    error: false,
                    message: response.statusText,
                    data: response.data
                };

            } else {

                LOGGER.module().error('ERROR: [HTTP libs (post)] HTTP POST request failed.');

                return {
                    error: true,
                    message: response.statusText,
                    data: null
                };
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [HTTP libs (post)] HTTP POST request failed. ' + error);

            return {
                error: true,
                message: error,
                data: null
            };
        }
    }

    return post();
};

/**
 * PUT request
 * @param request_obj
 * @returns {*}
 */
exports.put = function(request_obj) {

    if (request_obj === undefined) {
        LOGGER.module().error('ERROR: [HTTP libs (put)] Missing request object.');
        return false;
    }

    async function put() {

        let data = request_obj.data;
        let url = serialize_params(request_obj);

        if (request_obj.timeout === undefined) {
            request_obj.timeout = TIMEOUT;
        }

        try {

            let response = await HTTP.put(url, data, request_obj);

            if (response.status === 201 || response.status === 200) {

                return {
                    error: false,
                    message: response.statusText,
                    data: response.data
                };

            } else {

                LOGGER.module().error('ERROR: [HTTP libs (put)] HTTP PUT request failed.');

                return {
                    error: true,
                    message: response.statusText,
                    data: null
                };
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [HTTP libs (put)] HTTP PUT request failed. ' + error);

            return {
                error: true,
                message: error,
                data: null
            };
        }
    }

    return put();
};

/**
 * DELETE request
 * @param request_obj
 */
exports.delete = function(request_obj) {

    if (request_obj === undefined) {
        LOGGER.module().error('ERROR: [HTTP libs (delete)] Missing request object.');
        return false;
    }

    async function del() {

        let url = serialize_params(request_obj);

        if (request_obj.timeout === undefined) {
            request_obj.timeout = TIMEOUT;
        }

        try {

            let response = await HTTP.delete(url);

            if (response.status === 204) {

                return {
                    error: false,
                    message: response.statusText,
                    data: response.data
                };

            } else {

                LOGGER.module().error('ERROR: [HTTP libs (delete)] HTTP DELETE request failed.');

                return {
                    error: true,
                    message: response.statusText,
                    data: null
                };
            }

        } catch (error) {

            LOGGER.module().error('ERROR: [HTTP libs (delete)] HTTP DELETE request failed. ' + error);

            return {
                error: true,
                message: error,
                data: null
            };
        }
    }

    return del();
};

/**
 * TODO:
 * @param request_obj
 */
exports.head = function(request_obj) {

};
