/**

 Copyright 2023 University of Denver

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

const LOGGER = require('../../libs/log4');

/**
 * Object contains tasks used get repository stats
 * @param DB
 * @param TABLE
 * @type {Stats_tasks}
 */
const Stats_tasks = class {

    constructor(DB, TABLE) {
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Gets total published collections
     */
    async get_total_published_collections() {

        try {

            const data = await this.DB(this.TABLE)
            .count('object_type as total_published_collections')
            .where({
                object_type: 'collection',
                is_active: 1,
                is_published: 1
            });

            return parseInt(data[0].total_published_collections);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_published_collections)] unable to get published collection total ' + error.message);
        }
    }

    /**
     * Gets total published records
     */
    async get_total_published_objects() {

        try {

            const data = await this.DB(this.TABLE)
            .count('object_type as total_published_objects')
            .where({
                object_type: 'object',
                is_active: 1,
                is_published: 1
            });

            return parseInt(data[0].total_published_objects);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_published_objects)] unable to get published object total ' + error.message);
        }
    }

    /**
     * Gets total collections
     */
    async get_total_collections() {

        try {

            const data = await this.DB(this.TABLE)
            .count('object_type as total_collections')
            .where({
                object_type: 'collection',
                is_active: 1
            });

          return parseInt(data[0].total_collections);

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_collections)] unable to get total collections ' + error.message);
        }
    }

    /**
     * Gets total objects
     */
    async get_total_objects() {

        try {

            const data = await this.DB(this.TABLE)
            .count('object_type as total_objects')
            .where({
                object_type: 'object',
                is_active: 1
            });

            return data[0].total_objects;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_objects)] unable to get total objects ' + error.message);
        }
    }

    /**
     * Gets total image count
     */
    async get_total_images() {

        try {

            const data = await this.DB(this.TABLE)
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

            return data[0].total_images;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_images)] unable to get total images ' + error.message);
        }
    }

    /**
     * Gets total pdf count
     */
    async get_total_pdfs() {

        try {

            const data = await this.DB(this.TABLE)
            .count('mime_type as total_pdfs')
            .where({
                mime_type: 'application/pdf',
                is_active: 1
            });

            return data[0].total_pdfs;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_pdfs)] unable to get total pdfs ' + error.message);
        }
    }

    /**
     * Gets total audio count
     */
    async get_total_audio() {

        try {

            const data = await this.DB(this.TABLE)
            .count('mime_type as total_audio')
            .where({
                mime_type: 'audio/x-wav',
                is_active: 1
            })
            .orWhere({
                mime_type: 'audio/mpeg',
                is_active: 1
            });

            return data[0].total_audio;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_audio)] unable to get total audio ' + error.message);
        }
    }

    /**
     * Get total video count
     */
    async get_total_video() {

        try {

            const data = await this.DB(this.TABLE)
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

            return data[0].total_video;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_video)] unable to get total video ' + error);
        }
    }

    /**
     * Gets yearly ingest totals
     */
    async get_total_yearly_ingests() {

        try {

            const data = await this.DB.raw('SELECT COUNT(id) as \'total\', DATE_FORMAT(created, \'%Y\') as \'year\' FROM ' + this.TABLE + ' WHERE is_active=1 GROUP BY DATE_FORMAT(created, \'%Y\')');
            return data[0];

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_yearly_ingests)] unable to get yearly ingest total ' + error.message);
        }
    }

    /**
     * Get daily ingest total
     */
    async get_total_daily_ingests() {

        try {

            const data = await this.DB.raw('SELECT count(id) as \'total_daily_ingests\' FROM ' + this.TABLE + ' WHERE is_active=1 AND DATE(created) = CURDATE()');
            const result = data[0].pop();
            return result.total_daily_ingests;

        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_total_daily_ingests)] unable to get daily ingests ' + error.message);
        }
    }

    /**
     * Gets amount dip storage used
     * @param ARCHIVEMATICA
     */
    async get_dip_storage_usage(ARCHIVEMATICA) {

        try {
            return await ARCHIVEMATICA.get_dip_storage_usage();
        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_dip_storage_usage)] unable to get dip storage usage ' + error.message);
        }
    }

    /**
     * Gets amount aip storage used
     * @param ARCHIVEMATICA
     */
    async get_aip_storage_usage(ARCHIVEMATICA) {

        try {
            return await ARCHIVEMATICA.get_aip_storage_usage();
        } catch (error) {
            LOGGER.module().error('ERROR: [/stats/tasks (get_aip_storage_usage)] unable to get aip storage usage ' + error.message);
        }
    }
};

module.exports = Stats_tasks;
