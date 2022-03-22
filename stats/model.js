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

const ASYNC = require('async'),
    DB = require('../config/db')(),
    LOGGER = require('../libs/log4'),
    ARCHIVEMATICA = require('../libs/archivematica'),
    REPO_OBJECTS = 'tbl_objects';

exports.get_stats = function (req, callback) {

    ASYNC.waterfall([
        get_total_published_collections,
        get_total_published_objects,
        get_total_collections,
        get_total_objects,
        get_total_images,
        get_total_pdfs,
        get_total_audio,
        get_total_video,
        get_total_yearly_ingests,
        get_total_daily_ingests,
        // getMonthlyIngestCount,
        get_dip_storage_usage,
        get_aip_storage_usage
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/stats/model module (get_stats/async.waterfall)] unable to generate stats ' + error);
            return false;
        }

        callback({
            status: 200,
            data: results,
            message: 'Counts retrieved.'
        });
    });

    function get_total_published_collections(callback) {

        DB(REPO_OBJECTS)
            .count('object_type as total_published_collections')
            .where({
                object_type: 'collection',
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                let results = {};
                results.total_published_collections = parseInt(data[0].total_published_collections);
                callback(null, results);
                return null;

            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_published_collections)] unable to get published collection total ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_published_collections)] unable to get published collection total ' + error;
            });
    }

    function get_total_published_objects(results, callback) {

        DB(REPO_OBJECTS)
            .count('object_type as total_published_objects')
            .where({
                object_type: 'object',
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                results.total_published_objects = parseInt(data[0].total_published_objects);
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_published_objects)] unable to get published object total ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_published_objects)] unable to get published object total ' + error;
            });
    }

    function get_total_collections(results, callback) {

        DB(REPO_OBJECTS)
            .count('object_type as total_collections')
            .where({
                object_type: 'collection',
                is_active: 1
            })
            .then(function (data) {

                results.total_collections = parseInt(data[0].total_collections);
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_collections)] unable to get total collections ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_collections)] unable to get total collections ' + error;
            });
    }

    function get_total_objects(results, callback) {

        DB(REPO_OBJECTS)
            .count('object_type as total_objects')
            .where({
                object_type: 'object',
                is_active: 1
            })
            .then(function (data) {

                results.total_objects = data[0].total_objects;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_objects)] unable to get total objects ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_objects)] unable to get total objects ' + error;
            });
    }

    function get_total_images(results, callback) {

        DB(REPO_OBJECTS)
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
            .then(function (data) {

                results.total_images = data[0].total_images;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_images)] unable to get total images ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_images)] unable to get total images ' + error;
            });
    }

    function get_total_pdfs(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_pdfs')
            .where({
                mime_type: 'application/pdf',
                is_active: 1
            })
            .then(function (data) {

                results.total_pdfs = data[0].total_pdfs;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_pdfs)] unable to get total pdfs ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_pdfs)] unable to get total pdfs ' + error;
            });
    }

    function get_total_audio(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_audio')
            .where({
                mime_type: 'audio/x-wav',
                is_active: 1
            })
            .orWhere({
                mime_type: 'audio/mpeg',
                is_active: 1
            })
            .then(function (data) {

                results.total_audio = data[0].total_audio;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_audio)] unable to get total audio ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_audio)] unable to get total audio ' + error;
            });
    }

    function get_total_video(results, callback) {

        DB(REPO_OBJECTS)
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
            .then(function (data) {

                results.total_video = data[0].total_video;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_video)] unable to get total video ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_video)] unable to get total video ' + error;
            });
    }

    function get_total_yearly_ingests(results, callback) {
        DB.raw('SELECT COUNT(id) as \'total\', DATE_FORMAT(created, \'%Y\') as \'year\' FROM tbl_objects WHERE is_active=1 GROUP BY DATE_FORMAT(created, \'%Y\')')
            .then(function(data) {
                results.total_yearly_ingests = data[0];
                callback(null, results);
                return null;
            })
            .catch(function(error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_yearly_ingests)] unable to get yearly ingest total ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_yearly_ingests)] unable to get yearly ingest total ' + error;
            });
    }

    // TODO: ingests by month - storage usage by month (from duracloud)
    function getMonthlyIngestCount(results, callback) {
        DB.raw('SELECT count(id) as \'total\', DATE_FORMAT(created, \'%m\') as \'month\' FROM tbl_objects WHERE is_active=1 GROUP BY DATE_FORMAT(created, \'%m\')')
            .then(function(data) {
                console.log(data[0]);
                // results.monthly_ingest_counts = data[0];
                callback(null, results);
                return null;
            })
            .catch(function(error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getMonthlyIngestCount)] unable to get monthly ingest count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getMonthlyIngestCount)] unable to get monthly ingest count ' + error;
            });
    }

    function get_total_daily_ingests(results, callback) {
        DB.raw('SELECT count(id) as \'total_daily_ingests\' FROM tbl_objects WHERE is_active=1 AND DATE(created) = CURDATE()')
            .then(function(data) {
                let result = data[0].pop();
                results.total_daily_ingests = result.total_daily_ingests;
                callback(null, results);
                return null;
            })
            .catch(function(error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/get_total_daily_ingests)] unable to get daily ingests ' + error);
                throw 'FATAL: [/stats/model module (get_stats/get_total_daily_ingests)] unable to get daily ingests ' + error;
            });
    }

    function get_dip_storage_usage(results, callback) {

        ARCHIVEMATICA.get_dip_storage_usage(function(result) {
            results.dip_storage_usage = result.data
            callback(null, results);
        });

    }

    function get_aip_storage_usage(results, callback) {

        ARCHIVEMATICA.get_aip_storage_usage(function(result) {
            results.aip_storage_usage = result.data
            callback(null, results);
        });
    }
};
