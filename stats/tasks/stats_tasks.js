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
     *
     * @returns {Promise<unknown>}
     */
    get_total_published_collections = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('object_type as total_published_collections')
                .where({
                    object_type: 'collection',
                    is_active: 1,
                    is_published: 1
                })
                .then((data) => {
                    resolve(parseInt(data[0].total_published_collections));
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_published_collections)] unable to get published collection total ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_published_objects = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('object_type as total_published_objects')
                .where({
                    object_type: 'object',
                    is_active: 1,
                    is_published: 1
                })
                .then((data) => {
                    resolve(parseInt(data[0].total_published_objects));
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_published_objects)] unable to get published object total ' + error);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_collections() {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('object_type as total_collections')
                .where({
                    object_type: 'collection',
                    is_active: 1
                })
                .then(function (data) {
                    resolve(parseInt(data[0].total_collections));
                })
                .catch(function (error) {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_collections)] unable to get total collections ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_objects = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('object_type as total_objects')
                .where({
                    object_type: 'object',
                    is_active: 1
                })
                .then((data) => {
                    resolve(data[0].total_objects);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_objects)] unable to get total objects ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_images = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
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
                })
                .then((data) => {
                    resolve(data[0].total_images);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_images)] unable to get total images ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_pdfs = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('mime_type as total_pdfs')
                .where({
                    mime_type: 'application/pdf',
                    is_active: 1
                })
                .then((data) => {
                    resolve(data[0].total_pdfs);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_pdfs)] unable to get total pdfs ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_audio = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
                .count('mime_type as total_audio')
                .where({
                    mime_type: 'audio/x-wav',
                    is_active: 1
                })
                .orWhere({
                    mime_type: 'audio/mpeg',
                    is_active: 1
                })
                .then((data) => {
                    resolve(data[0].total_audio);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_audio)] unable to get total audio ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_video = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB(this.TABLE)
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
                })
                .then((data) => {
                    resolve(data[0].total_video);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_video)] unable to get total video ' + error);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_yearly_ingests = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB.raw('SELECT COUNT(id) as \'total\', DATE_FORMAT(created, \'%Y\') as \'year\' FROM ' + this.TABLE + ' WHERE is_active=1 GROUP BY DATE_FORMAT(created, \'%Y\')')
                .then((data) => {
                    resolve(data[0]);
                })
                .catch((error) => {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_yearly_ingests)] unable to get yearly ingest total ' + error.message);
                    reject('error');
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    get_total_daily_ingests = () => {

        let promise = new Promise((resolve, reject) => {

            this.DB.raw('SELECT count(id) as \'total_daily_ingests\' FROM ' + this.TABLE + ' WHERE is_active=1 AND DATE(created) = CURDATE()')
                .then(function(data) {
                    let result = data[0].pop();
                    resolve(result.total_daily_ingests);
                })
                .catch(function(error) {
                    LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_daily_ingests)] unable to get daily ingests ' + error.message);
                    reject(0);
                });
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     * @param ARCHIVEMATICA
     * @returns {Promise<unknown>}
     */
    get_dip_storage_usage = (ARCHIVEMATICA) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    let result = ARCHIVEMATICA.get_dip_storage_usage();
                    resolve(result.data);
                } catch (error) {
                    LOGGER.module().error('ERROR: [/stats/model module (get_stats/get_dip_storage_usage)] unable to get dip storage usage ' + error.message);
                    reject(0);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /**
     *
     * @param ARCHIVEMATICA
     * @returns {Promise<unknown>}
     */
    get_aip_storage_usage = (ARCHIVEMATICA) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {
                    let result = ARCHIVEMATICA.get_aip_storage_usage();
                    resolve(result.data);
                } catch (error) {
                    LOGGER.module().error('ERROR: [/stats/model module (get_stats/get_aip_storage_usage)] unable to get aip storage usage ' + error.message);
                    reject(0);
                }

            })();
        });

        return promise.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }
};

module.exports = Stats_tasks;
