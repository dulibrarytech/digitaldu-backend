'use strict';

var fs = require('fs'),
    Config = require('../config/config'),
    // es = require('elasticsearch'),
    async = require('async'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.dbHost,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    });

/*
var client = new es.Client({
    host: Config.elasticSearch
    // log: 'trace'
});
*/

exports.get_stats = function (req, callback) {

    async.waterfall([
        getPublishedCollectionCount,
        getPublishedObjectCount,
        getTotalCollectionCount,
        getTotalObjectCount,
        getTotalImageCount,
        getTotalPdfCount,
        getTotalAudioCount,
        getTotalVideoCount
        // getTotalUserCount
    ], function (err, results) {
        // console.log(results);
        callback({
            status: 200,
            content_type: {'Content-Type': 'application/json'},
            data: results,
            message: 'Counts retrieved.'
        });
    });

    function getPublishedCollectionCount(callback) {

        // published collection count
        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }

    function getPublishedObjectCount(results, callback) {

        // published object count
        knex('tbl_objects')
            .count('object_type as published_object_count')
            .where({
                object_type: 'object',
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {

                results.published_object_count = data[0].published_object_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalCollectionCount(results, callback) {

        // total collection count
        knex('tbl_objects')
            .count('object_type as total_collection_count')
            .where({
                object_type: 'collection',
                is_active: 1
            })
            .then(function (data) {

                results.total_collection_count = data[0].total_collection_count;
                callback(null, results);
                return null;
            })
            .catch(function (error) {
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalObjectCount(results, callback) {

        // total object count
        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalImageCount(results, callback) {

        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalPdfCount(results, callback) {

        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalAudioCount(results, callback) {

        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }

    function getTotalVideoCount(results, callback) {

        knex('tbl_objects')
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
                // TODO: add error callback
                console.log(error);
            });
    }
};