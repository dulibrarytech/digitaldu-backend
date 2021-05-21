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

const DB = require('../config/db')(),
    LOGGER = require('../libs/log4'),
    REPO_USERS = 'tbl_users',
    REPO_OBJECTS = 'tbl_objects';

// https://stackoverflow.com/questions/35089571/knex-js-create-table-and-insert-data
const create_users_table = function () {

    DB.schema.createTable(REPO_USERS, function (table) {
        table.increments();
        table.string('du_id');
        table.string('email');
        table.string('first_name');
        table.string('last_name');
        table.integer('is_active').defaultTo(1);
        table.timestamp('created').defaultTo(DB.raw('CURRENT_TIMESTAMP'));
    })
        .then(function () {
            console.log(REPO_USERS + ' table created.');
        })
        .catch(function (error) {
            console.log(error);
        });
};

const create_objects_table = function () {
    // .notNullable()
    DB.schema.createTable(REPO_OBJECTS, function (table) {
        table.increments();
        table.string('is_member_of_collection', 255);
        table.string('pid', 255);
        table.string('handle', 255);
        table.string('object_type', 255);
        table.text('mods');
        table.string('thumbnail', 255);
        table.string('file_name', 255);
        table.text('display_record');
        table.string('mods_id', 20);
        table.string('uri', 255);
        table.string('mime_type', 255);
        table.string('entry_id', 255);
        table.string('delete_id', 255);
        table.string('checksum', 255);
        table.integer('file_size');
        table.string('sip_uuid', 255);
        table.integer('is_compound').defaultTo(0);
        table.integer('is_published').defaultTo(0);
        table.integer('is_restricted').defaultTo(0);
        table.integer('is_active').defaultTo(1);
        table.integer('is_complete').defaultTo(1);
        table.integer('is_indexed').defaultTo(1);
        table.integer('is_updated').defaultTo(1);
        table.timestamp('created').defaultTo(DB.raw('CURRENT_TIMESTAMP'));
    })
        .then(function () {
            console.log(REPO_OBJECTS + ' table created.');
        })
        .catch(function (error) {
            console.log(error);
        });
};

/**
 *  Creates db test tables
 */
exports.up = function () {
    create_users_table();
    create_objects_table();
};

/**
 *
 */
exports.down = function () {

    DB.schema
        .dropTable(REPO_USERS)
        .dropTable(REPO_OBJECTS)
        .then(function() {
            console.log('Removing test tables');
        })
        .catch(function(error) {
            console.log(error);
        });
};