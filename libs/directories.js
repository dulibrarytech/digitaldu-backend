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

const FS = require('fs'),
    LOGGER = require('../libs/log4'),
    TMP = './tmp',
    TN = './public/tn',
    TN_CACHE = './public/tn_cache';

/**
 * Checks if required directories exist, creates them if they don't
 */
exports.check_directories = function () {

    try {

        if (!FS.existsSync(TMP)) {

            LOGGER.module().info('INFO: [/libs/directories (check_directories)] tmp directory not found. Creating directory...');

            FS.mkdir(TMP, function(error) {

                if (error) {
                    throw error;
                }

                LOGGER.module().info('INFO: [/libs/directories (check_directories)] tmp directory created.');
            });
        }

    } catch (error) {
        throw error;
    }

    try {

        if (!FS.existsSync(TN)) {

            LOGGER.module().info('INFO: [/libs/directories (check_directories)] tn directory not found. Creating directory...');

            FS.mkdir(TN, function(error) {

                if (error) {
                    throw error;
                }

                LOGGER.module().info('INFO: [/libs/directories (check_directories)] tn directory created.');
            });
        }

    } catch (error) {
        throw error;
    }

    try {

        if (!FS.existsSync(TN_CACHE)) {

            LOGGER.module().info('INFO: [/libs/directories (check_directories)] tn_cache directory not found. Creating directory...');

            FS.mkdir(TN_CACHE, function(error) {

                if (error) {
                    throw error;
                }

                LOGGER.module().info('INFO: [/libs/directories (check_directories)] tn_cache directory created.');
            });
        }

    } catch (error) {
        throw error;
    }
};