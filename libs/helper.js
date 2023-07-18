/**

 Copyright 2023 University of Denver

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

const {v4: uuidv4} = require('uuid');
const VALIDATOR = require('validator');
const LOGGER = require('../libs/log4');

/**
 * Object contains helper tasks
 * @type {Helper}
 */
const Helper = class {

    constructor() {}

    /**
     * Generates uuid
     * @returns Promise string
     */
    create_uuid() {

        try {
            return uuidv4();
        } catch (error) {
            LOGGER.module().error('ERROR: [/libs/helper (create_uuid)] unable to generate uuid ' + error.message);
            return false;
        }
    }

    /**
     * Checks if required env config values are set
     * @param config
     */
    check_config(config) {

        let obj = {};
        let keys = Object.keys(config);

        keys.map((prop) => {

            if (config[prop].length === 0) {
                LOGGER.module().error('ERROR: [/config/app_config] ' + prop + ' env is missing config value');
                return false;
            }

            if (VALIDATOR.isURL(config[prop]) === true) {
                obj[prop] = encodeURI(config[prop]);
            }

            obj[prop] = VALIDATOR.trim(config[prop]);
        });

        return obj;
    }

    /**
     * Converts byte size to human readable format
     * @param bytes
     * @param decimals
     * @return {string|{batch_size: number, size_type: string}}
     */
    format_bytes(bytes, decimals = 2) {

        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return {
            size_type:sizes[i],
            batch_size: parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
        };
    };
};

module.exports = Helper;
