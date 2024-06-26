/**
 Copyright 2021 fernando.reyes@du.edu

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

const VALIDATOR = require('validator');
const Ajv = require('ajv');
const ajv = new Ajv();

const VALIDATE_JSON = function (data, properties, required_properties) {

    let errors = '';
    let schema = {
        type: 'object',
        properties: properties,
        required: required_properties,
        additionalProperties: false
    };

    const VALIDATE_SCHEMA = ajv.compile(schema);
    const IS_VALID = VALIDATE_SCHEMA(data);

    if (!IS_VALID) {
        errors = VALIDATE_SCHEMA.errors;
    }

    return errors;
};

/**
 * Validates auth input fields
 * @param req
 * @param res
 * @param next
 */
exports.validate_auth = function (req, res, next) {

    let errors = [];

    if (req.body === undefined) {
        errors.push({
            status: 400,
            data: {
                message: 'Bad Request'
            }
        });
    }

    let properties = {
        username: {type: 'string'},
        password: {type: 'string'}
    };

    let required_properties = ['username', 'password'];
    let error = VALIDATE_JSON(req.body, properties, required_properties);

    if (error.length > 0) {
        errors.push(error);
    }

    if (req.body.username === undefined) {
        errors.push({
            field: 'username',
            message: 'username field is missing.'
        });
    } else if (req.body.username.length === 0 && req.body.username.length < 4) {
        errors.push({
            field: 'username',
            message: 'Username is required'
        });
    } else if (isNaN(req.body.username) === true) {
        errors.push({
            field: 'username',
            message: 'Please enter a DU ID. i.e. 871******'
        });
    }

    if (req.body.password === undefined) {
        errors.push({
            field: 'password',
            message: 'password field is missing.'
        });
    } else if (req.body.password.length === 0 || req.body.password.length < 5) {
        errors.push({
            field: 'password',
            message: 'Password required.'
        });
    }

    if (errors.length === 0) {
        next();
    } else {
        res.status(401).json({
            errors: errors
        });
    }
};

/**
 * Validates user input fields
 * @param req
 * @param res
 * @param next
 */
exports.validate_user = function (req, res, next) {

    let errors = [];

    if (req.body === undefined) {
        errors.push({
            status: 400,
            data: {
                message: 'Bad Request'
            }
        });
    }

    let properties = {
        du_id: {type: 'string'},
        email: {type: 'string'},
        first_name: {type: 'string'},
        last_name: {type: 'string'}
    };

    let required_properties = ['du_id', 'email', 'first_name', 'last_name'];
    let error = VALIDATE_JSON(req.body, properties, required_properties);

    if (error.length > 0) {
        errors.push(error);
    }

    if (req.body.du_id === undefined) {
        errors.push({
            field: 'du_id',
            message: 'du_id field is missing.'
        });
    } else if (req.body.du_id.length === 0 && req.body.username.length < 4) {
        errors.push({
            field: 'du_id',
            message: 'DU ID is required'
        });
    } else if (isNaN(req.body.du_id) === true) {
        errors.push({
            field: 'du_id',
            message: 'Please enter a DU ID. i.e. 871******'
        });
    }

    if (req.body.email === undefined) {
        errors.push({
            field: 'email',
            message: 'email field is missing.'
        });
    } else if (req.body.email.length === 0 && req.body.email.length < 3) {
        errors.push({
            field: 'email',
            message: 'email required.'
        });
    } else if (!VALIDATOR.isEmail(req.body.email)) {
        errors.push({
            field: 'email',
            message: 'A valid email is required.'
        });
    }

    if (req.body.first_name === undefined) {
        errors.push('first_name field is missing.');
    } else if (req.body.first_name.length === 0 && req.body.first_name.length < 3) {
        errors.push({
            field: 'first_name',
            message: 'First name required.'
        });
    }

    if (req.body.last_name === undefined) {
        errors.push({
            field: 'last_name',
            message: 'last_name field is missing.'
        });
    } else if (req.body.last_name.length === 0 && req.body.last_name.length < 3) {
        errors.push({
            field: 'last_name',
            message: 'Last name required.'
        });
    }

    if (errors.length === 0) {
        next();
    } else {
        res.status(400).json({
            errors: errors
        });
    }
};
