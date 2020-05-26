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
    ARCHIVEMATICA = require('../libs/archivematica'),
    DURACLOUD = require('../libs/duracloud'),
    METS = require('../libs/mets'),
    LOGGER = require('../libs/log4'),
    _ = require('lodash');

exports.delete_dip = function (data, callback) {

    function get_dip_path(callback) {

        let obj = data;

        ARCHIVEMATICA.get_dip_path(obj.pid, function (dip_path) {

            obj.sip_uuid = obj.pid;
            obj.dip_path = dip_path;
            delete obj.pid;

            callback(null, obj);
        });
    }

    function get_mets(obj, callback) {

        DURACLOUD.get_mets(data, function (result) {
            obj.mets = result.mets;
            callback(null, obj);
        });
    }

    function construct_dip_files(obj, callback) {

        let files = [];
        let results = METS.process_mets(obj.sip_uuid, obj.dip_path, obj.mets);
        let file_obj = {};
        obj.mets_xml = obj.dip_path + '/METS.' + obj.sip_uuid + '.xml';
        obj.mcp_xml = obj.dip_path + '/processingMCP.xml';

        for (let i=0;i<results.length;i++) {

            if (results[i].type === 'object') {
                file_obj.thumbnail = obj.dip_path + '/thumbnails/' + results[i].uuid + '.jpg';
                file_obj.master = obj.dip_path + '/objects/' + results[i].uuid + '-' + results[i].file;
            } else if (results[i].type === 'txt') {
                file_obj.uri = obj.dip_path + '/objects/' + results[i].uuid + '-uri.txt';
            }

            files.push(file_obj);
            file_obj = {};
        }

        obj.files = files;
        delete obj.mets;
        callback(null, obj);
    }

    function delete_dip_files(obj, callback) {

        obj.files.push({
            mets_xml: obj.mets_xml,
            mcp_xml: obj.mcp_xml
        });

        delete obj.mets_xml;
        delete obj.mcp_xml;

        let timer = setInterval(function() {

            if (obj.files.length === 0) {
                clearInterval(timer);
                callback(null, obj);
                return false;
            }

            let record = obj.files.pop();

            for (let prop in record) {

                let file = record[prop];

                DURACLOUD.confirm_dip_file(file, function(result) {

                    if (result.error === true) {
                        LOGGER.module().error('ERROR: [delete_dip_files lib (delete_dip_files/confirm_dip_file)] ' + result.error_message);
                        return false;
                    }

                    DURACLOUD.delete_dip_file(file, function(result) {

                        if (result.error === true) {
                            LOGGER.module().error('ERROR: [delete_dip_files lib (delete_dip_files/delete_dip_file)] ' + result.error_message);
                            return false;
                        }

                    });
                });
            }

        }, 1000);

        return false;
    }

    ASYNC.waterfall([
        get_dip_path,
        get_mets,
        construct_dip_files,
        delete_dip_files
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        callback({
            message: 'dip files deleted.',
            data: results
        });

        LOGGER.module().info('INFO: [/repository/model module (delete_object/async.waterfall)] object deleted');
    });
};