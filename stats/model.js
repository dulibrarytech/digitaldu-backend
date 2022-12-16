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

const STATS_TASKS = require('../stats/tasks/stats_tasks');
const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const REPO_OBJECTS = DB_TABLES.repo.repo_objects;
const LOGGER = require('../libs/log4');

exports.get_stats = (callback) => {

    (async () => {

        try {

            let data = {};
            const TASKS = new STATS_TASKS(DB, REPO_OBJECTS);
            data.total_published_collections = await TASKS.get_total_published_collections();
            data.total_published_objects = await TASKS.get_total_published_objects();
            data.total_collections = await TASKS.get_total_collections();
            data.total_objects = await TASKS.get_total_objects();
            data.total_images = await TASKS.get_total_images();
            data.total_pdfs = await TASKS.get_total_pdfs();
            data.total_audio = await TASKS.get_total_audio();
            data.total_video = await TASKS.get_total_video();
            data.total_yearly_ingests = await TASKS.get_total_yearly_ingests();
            data.total_daily_ingests = await TASKS.get_total_daily_ingests();
            data.dip_storage_usage = await TASKS.get_dip_storage_usage();
            data.aip_storage_usage = await TASKS.get_aip_storage_usage();

            callback({
                status: 200,
                message: 'Stats retrieved.',
                data: data
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/model module (get_stats)] unable to get stats ' + error.message);
            callback({
                status: 204,
                message: 'Unable to get stats.'
            });
        }


    })();
};
