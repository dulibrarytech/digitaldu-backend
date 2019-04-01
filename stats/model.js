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

    function getTotalUserCount(callback) {
        // arg1 now equals 'three'
        callback(null, results);
        return null;
    }
};

/*
exports.get_objects = function (req, callback) {

    var pid = req.query.pid; // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Objects retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};
*/

/*
exports.get_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Object retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};
*/

/*
exports.get_admin_objects = function (req, callback) {

    var pid = req.query.pid; // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'is_published', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Collections for administrators'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};
*/

/*
exports.get_admin_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_published', 'is_compound', 'created')
        .where({
            pid: pid,
            is_active: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Object retrieved.'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};
*/

/*
exports.update_collection = function (req, callback) {

    var updateObj = {};
    updateObj.title = req.body.title;

    if (req.body.description !== undefined) {
        updateObj.description = req.body.description;
    }

    updateObj.is_active = req.body.is_active;
    updateObj.is_published = req.body.is_published;

    knex('tbl_collections')
        .where({
            id: req.body.id,
            pid: req.body.pid
        })
        .update(updateObj)
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Collection updated'
            });
        })
        .catch(function (error) {
            console.log(error);
        });
};
*/

/*
exports.do_search = function (req, callback) {

    var q = req.query.q;

    client.search({
        // from: 0, // search.from,
        // size: 40, // search.size,
        index: Config.elasticSearchIndex,
        q: q
    }).then(function (body) {
        // console.log(body.hits.hits);
        // callback(body.hits.hits);

        callback({
            status: 200,
            data: body.hits.hits,
            message: 'Search Results'
        });

    }, function (error) {
       // callback(error);
    });
};
    */