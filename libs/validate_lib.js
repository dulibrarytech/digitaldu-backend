/**
 Copyright 2022

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

const AJV_LIB = require('ajv');
const AJV = new AJV_LIB();
const LOGGER = require('../libs/log4');

/**
 * Object validates index record(s)
 * @type {Validator}
 */
const Validator = class {

    constructor(SCHEMA_CONFIG) {
        this.SCHEMA_CONFIG = SCHEMA_CONFIG;
    }

    /**
     * Validates schema
     * @param data
     */
    validate = (data) => {

        try {

            const schema = {
                type: 'object',
                properties: this.SCHEMA_CONFIG,
                required: Object.keys(this.SCHEMA_CONFIG),
                additionalProperties: true // false
            };

            const VALIDATE_SCHEMA = AJV.compile(schema);
            let is_valid = VALIDATE_SCHEMA(data);

            if (is_valid === false) {
                is_valid = VALIDATE_SCHEMA.errors;
            }

            return is_valid;

        } catch (error) {
            LOGGER.module().error('ERROR: [/indexer/validate (index_record)] unable to validate record ' + error.message);
            return false;
        }
    }
};

module.exports = Validator;
