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

const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used to index record(s)
 * @param CLIENT
 * @param INDEX
 * @type {Indexer_index_tasks}
 */
const Search_tasks = class {

    constructor(CLIENT) {
        this.CLIENT = CLIENT;
    }

    /**
     * Searches indexed records
     * @param search (q, page, total_on_page, sort, index, query)
     * @return {Promise<boolean>}
     */
    async search_records(search) {

        try {

            let response = await this.CLIENT.search(search);

            if (response._shards.failed === 0) {
                return response.hits;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/search/Search_tasks (search_records)] unable to search ' + error.message);
            return false;
        }
    }
};

module.exports = Search_tasks;
