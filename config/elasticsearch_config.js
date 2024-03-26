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

const HELPER = require('../libs/helper');
const ELASTICSEARCH_CONFIG = {
    elasticsearch_host: process.env.ELASTICSEARCH_HOST,
    elasticsearch_index_front: process.env.ELASTIC_SEARCH_FRONT_INDEX,
    elasticsearch_index_back: process.env.ELASTIC_SEARCH_BACK_INDEX,
    elasticsearch_shards: process.env.ELASTICSEARCH_SHARDS,
    elasticsearch_replicas: process.env.ELASTICSEARCH_REPLICAS
};

module.exports = function () {
    const HELPER_TASK = new HELPER();
    return HELPER_TASK.check_config(ELASTICSEARCH_CONFIG);
};
