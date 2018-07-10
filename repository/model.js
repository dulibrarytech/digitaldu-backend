'use strict';

var fs = require('fs'),
    Config = require('../config/config'),
    es = require('elasticsearch'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.dbHost,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    });

var client = new es.Client({
    host: Config.elasticSearch
    // log: 'trace'
});

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