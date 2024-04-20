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
const ARCHIVEMATICA = require("../../libs/archivematica");

/**
 * Object contains repository tasks
 * @param DB
 * @param DB_TABLE
 * @type {Stats_tasks}
 */
const Stats_tasks = class {

    constructor(DB, DB_TABLES) {
        this.DB = DB;
        this.DB_TABLES = DB_TABLES;
    }

    /**
     * Gets total published collection count
     */
    async get_total_published_collections() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('object_type as total_published_collections')
            .where({
                object_type: 'collection',
                is_active: 1,
                is_published: 1
            });

            return parseInt(total[0].total_published_collections);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_published_collections)] unable to get published collection total ' + error.message);
        }
    }

    /**
     * Gets total published object count
     */
    async get_total_published_objects() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('object_type as total_published_objects')
            .where({
                object_type: 'object',
                is_active: 1,
                is_published: 1
            });

            return parseInt(total[0].total_published_objects);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_published_objects)] unable to get published object total ' + error.message);
        }
    }

    /**
     * Gets total collection count
     */
    async get_total_collections() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('object_type as total_collections')
            .where({
                object_type: 'collection',
                is_active: 1
            });

            return parseInt(total[0].total_collections)

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_collections)] unable to get collection total ' + error.message);
        }
    }

    /**
     * Gets total object count
     */
    async get_total_objects() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('object_type as total_objects')
            .where({
                object_type: 'object',
                is_active: 1
            });

            return parseInt(total[0].total_objects);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_objects)] unable to get object total ' + error.message);
        }
    }

    /**
     * Gets total image count
     */
    async get_total_images() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('mime_type as total_images')
            .where({
                mime_type: 'image/tiff',
                is_active: 1
            })
            .orWhere({
                mime_type: 'image/jpeg',
                is_active: 1
            })
            .orWhere({
                mime_type: 'image/png',
                is_active: 1
            });

            return parseInt(total[0].total_images);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_images)] unable to get image total ' + error.message);
        }
    }

    /**
     * Gets total pdf count
     */
    async get_total_pdfs() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('mime_type as total_pdfs')
            .where({
                mime_type: 'application/pdf',
                is_active: 1
            });

            return parseInt(total[0].total_pdfs);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_images)] unable to get pdf total ' + error.message);
        }
    }

    /**
     * Gets total audio file count
     */
    async get_total_audio() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('mime_type as total_audio')
            .where({
                mime_type: 'audio/x-wav',
                is_active: 1
            })
            .orWhere({
                mime_type: 'audio/mpeg',
                is_active: 1
            });

            return parseInt(total[0].total_audio);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_audio)] unable to get audio file total ' + error.message);
        }
    }

    /**
     * Gets total video count
     */
    async get_total_video() {

        try {

            const total = await this.DB(this.DB_TABLES.repo.repo_records)
            .count('mime_type as total_video')
            .where({
                mime_type: 'video/mp4',
                is_active: 1
            })
            .orWhere({
                mime_type: 'video/quicktime',
                is_active: 1
            })
            .orWhere({
                mime_type: 'video/mpeg',
                is_active: 1
            });

            return parseInt(total[0].total_video);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_video)] unable to get video file total ' + error.message);
        }
    }

    /**
     * Gets yearly ingest totals
     */
    async get_total_yearly_ingests() {

        try {

            let query = 'SELECT COUNT(id) as \'total\', DATE_FORMAT(created, \'%Y\') as \'year\' FROM ' + this.DB_TABLES.repo.repo_records + ' WHERE is_active=1 GROUP BY DATE_FORMAT(created, \'%Y\')';
            const total = await this.DB.raw(query);
            total[0].shift(); // removes 2019 migration
            return total[0];

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_fiscal_yearly_ingests)] unable to get yearly totals ' + error.message);
        }
    }

    /**
     * Gets fiscal year ingest totals
     */
    async get_total_fiscal_year_ingests() {

        try {

            const start_year = new Date().getFullYear() - 1;
            const end_year = new Date().getFullYear()
            let query = 'SELECT COUNT(id) as \'total\' FROM ' + this.DB_TABLES.repo.repo_records + ' WHERE (created BETWEEN \'' + start_year + '-07-01\' AND \'' + end_year + '-06-30\' AND is_active = 1)';
            const total = await this.DB.raw(query);
            return parseInt(total[0][0].total);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_total_fiscal_year_ingests)] unable to get fiscal year total ' + error.message);
        }
    }

    /**
     * Gets total DIP storage usage
     * @param ARCHIVEMATICA object
     */
    async get_dip_storage_usage(ARCHIVEMATICA) {

        try {

            let total = await ARCHIVEMATICA.get_dip_storage_usage();
            return parseInt(total);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_dip_storage_usage)] unable to get dip storage total ' + error.message);
        }
    }

    /**
     * Gets total AIP storage usage
     * @param ARCHIVEMATICA object
     */
    async get_aip_storage_usage(ARCHIVEMATICA) {

        try {

            let total = await ARCHIVEMATICA.get_aip_storage_usage();
            return parseInt(total);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/stats_tasks (get_dip_storage_usage)] unable to get aip storage total ' + error.message);
        }
    }
};

module.exports = Stats_tasks;
