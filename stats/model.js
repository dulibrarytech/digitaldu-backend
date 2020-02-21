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
    DB =require('../config/db')(),
    LOGGER = require('../libs/log4'),
    REPO_OBJECTS = 'tbl_objects';

exports.get_stats = function (req, callback) {

    ASYNC.waterfall([
        getPublishedCollectionCount,
        getPublishedObjectCount,
        getTotalCollectionCount,
        getTotalObjectCount,
        getTotalImageCount,
        getTotalPdfCount,
        getTotalAudioCount,
        getTotalVideoCount
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

    function getPublishedCollectionCount(callback) {

        // published collection count
        DB(REPO_OBJECTS)
            .count('object_type as published_collection_count')
            .where({
                object_type: 'collection',
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {

                callback(null, data[0]);
                return null;

            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getPublishedCollectionCount)] unable to get published collection count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getPublishedCollectionCount)] unable to get published collection count ' + error;
            });
    }

    function getPublishedObjectCount(results, callback) {

        // published object count
        DB(REPO_OBJECTS)
            .count('object_type as published_object_count')
            .where({
                object_type: 'object',
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {

                results.published_object_count = parseInt(data[0].published_object_count);
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getPublishedObjectCount)] unable to get published object count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getPublishedObjectCount)] unable to get published object count ' + error;
            });
    }

    function getTotalCollectionCount(results, callback) {

        // total collection count
        DB(REPO_OBJECTS)
            .count('object_type as total_collection_count')
            .where({
                object_type: 'collection',
                is_active: 1
            })
            .then(function (data) {

                results.total_collection_count = parseInt(data[0].total_collection_count);
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalCollectionCount)] unable to get total collection count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalCollectionCount)] unable to get total collection count ' + error;
            });
    }

    function getTotalObjectCount(results, callback) {

        // total object count
        DB(REPO_OBJECTS)
            .count('object_type as total_object_count')
            .where({
                object_type: 'object',
                is_active: 1
            })
            .then(function (data) {

                results.total_object_count = data[0].total_object_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalObjectCount)] unable to get total object count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalObjectCount)] unable to get total object count ' + error;
            });
    }

    function getTotalImageCount(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_image_count')
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

                results.total_image_count = data[0].total_image_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalImageCount)] unable to get total image count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalImageCount)] unable to get total image count ' + error;
            });
    }

    function getTotalPdfCount(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_pdf_count')
            .where({
                mime_type: 'application/pdf',
                is_active: 1
            })
            .then(function (data) {

                results.total_pdf_count = data[0].total_pdf_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalPdfCount)] unable to get total pdf count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalPdfCount)] unable to get total pdf count ' + error;
            });
    }

    function getTotalAudioCount(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_audio_count')
            .where({
                mime_type: 'audio/x-wav',
                is_active: 1
            })
            .then(function (data) {

                results.total_audio_count = data[0].total_audio_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalAudioCount)] unable to get total audio count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalAudioCount)] unable to get total audio count ' + error;
            });
    }

    function getTotalVideoCount(results, callback) {

        DB(REPO_OBJECTS)
            .count('mime_type as total_video_count')
            .where({
                mime_type: 'video/mp4',
                is_active: 1
            })
            .then(function (data) {

                results.total_video_count = data[0].total_video_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                LOGGER.module().fatal('FATAL: [/stats/model module (get_stats/getTotalVideoCount)] unable to get total video count ' + error);
                throw 'FATAL: [/stats/model module (get_stats/getTotalVideoCount)] unable to get total video count ' + error;
            });
    }
};