'use strict';

const config = require('../config/config'),
    archivematica = require('../libs/archivematica'),
    uuid = require('uuid'),
    async = require('async'),
    request = require('request'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    });

/**
 * Gets incomplete records in repo
 * @param req
 * @param callback
 */
exports.get_import_incomplete = function (req, callback) {

    knex('tbl_objects')
        .select('id', 'sip_uuid', 'is_member_of_collection', 'pid', 'handle', 'mods_id', 'mods', 'display_record', 'thumbnail', 'file_name', 'mime_type', 'created')
        .where({
            is_complete: 0,
            object_type: 'object'
        })
        .then(function (data) {

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Incomplete records.',
                data: data
            });

            return null;
        })
        .catch(function (error) {
            console.log(error);
        });
};