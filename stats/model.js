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

const DB = require('../config/db_config')();
const DB_TABLES = require('../config/db_tables_config')();
const ARCHIVEMATICA_CONFIG = require('../config/archivematica_config')();
const LIB = require('../libs/archivematica');
const STATS_TASKS = require('../stats/tasks/stats_tasks');
const LOGGER = require('../libs/log4');

exports.get_stats = function (callback) {

    try {

        (async function () {

            const TASKS = new STATS_TASKS(DB, DB_TABLES);
            const ARCHIVEMATICA = new LIB(ARCHIVEMATICA_CONFIG);
            let stats = {};
            stats.total_published_collections = await TASKS.get_total_published_collections();
            stats.total_published_objects = await TASKS.get_total_published_objects();
            stats.total_collections = await TASKS.get_total_collections();
            stats.total_objects = await TASKS.get_total_objects();
            stats.total_images = await TASKS.get_total_images();
            stats.total_pdfs = await TASKS.get_total_pdfs();
            stats.total_audio = await TASKS.get_total_audio();
            stats.total_video = await TASKS.get_total_video();
            stats.total_yearly_ingests = await TASKS.get_total_yearly_ingests();
            stats.total_fiscal_year_ingests = await TASKS.get_total_fiscal_year_ingests();
            stats.dip_storage_usage = await TASKS.get_dip_storage_usage(ARCHIVEMATICA);
            stats.aip_storage_usage = await TASKS.get_aip_storage_usage(ARCHIVEMATICA);

            callback({
                status: 200,
                data: stats
            });

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/stats/model module (get_stats)] Unable to get stats. ' + error.message);
    }
};
