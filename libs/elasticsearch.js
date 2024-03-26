/**

 Copyright 2024 University of Denver

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

const LOGGER = require('../libs/log4');
const {Client} = require("@elastic/elasticsearch");
const ES_CONFIG = require('../config/elasticsearch_config')();

/**
 * Object contains Elasticsearch tasks
 * @type {Helper}
 */
const Elasticsearch_client = class {

    constructor() {
    }

    /**
     * Generates elasticsearch client
     * @returns Promise string
     */
    get_es() {

        try {

            let obj = {}
                obj.es_client = new Client({
                node: ES_CONFIG.elasticsearch_host
            });

            obj.es_config = ES_CONFIG;
            return obj;

        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/elasticsearch (create_client)] unable to create es client ' + error.message);
            return false;
        }
    }
};

module.exports = Elasticsearch_client;
