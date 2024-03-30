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

const MODEL = require('../repository/model');
const SERVICE = require('../repository/service');
const CACHE = require('../libs/cache');
const PATH = require('path');
const VALIDATOR = require('validator');

exports.get_records = function (req, res) {

    let cache = CACHE.get_cache(req);

    if (cache) {
        res.send(cache);
    } else {

        if (req.query.pid === undefined || req.query.pid.length === 0) {

            res.status(400).send({
                status: 400,
                message: 'Bad request.'
            });

            return false;
        }

        // TODO validate
        const pid = req.query.pid;
        const total_on_page = 10;
        let search = {};
        search.from = req.query.page;
        search.size = total_on_page;

        SERVICE.get_records(pid, search, function (data) {
            CACHE.cache_request(req, data.data);
            res.status(data.status).send(data.data);
        });
    }
};

/**
 * publishes records
 * @param req
 * @param res
 */
exports.publish = function (req, res) {

    if (req.body.pid === undefined || req.body.type === undefined) {
        res.status(400).send({
            message: 'Bad Request'
        });
        return false;
    }

    // TODO sanitize
    const uuid = req.body.pid;
    const type = req.body.type;

    MODEL.publish(uuid, type, function (data) {
        console.log('response ', data);
        CACHE.clear_cache();
        let obj = {};

        if (data === true) {
            obj.status = 201;
        } else {
            obj.status = 200;
        }

        res.status(obj.status).send({});
    });
};

/**
 * Suppresses records
 * @param req
 * @param res
 */
exports.suppress = function (req, res) {

    if (req.body.pid === undefined || req.body.type === undefined) {
        res.status(400).send({
            message: 'Bad Request'
        });
        return false;
    }

    // TODO: validate
    const uuid = req.body.pid;
    const type = req.body.type;

    MODEL.suppress(uuid, type, function (data) {

        CACHE.clear_cache();
        let obj = {};

        if (data === true) {
            obj.status = 201;
        } else {
            obj.status = 200;
        }

        res.status(obj.status).send({});
    });
};

exports.get_display_record = function (req, res) {
    MODEL.get_display_record(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_collection_object = function (req, res) {
    MODEL.create_collection_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_thumbnail = function (req, res) {
    MODEL.update_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.reset_display_record = function (req, res) {
    MODEL.reset_display_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.delete_object = function (req, res) {
    MODEL.delete_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_tn = function (req, res) {

    let cache = CACHE.get_tn_cache(req);

    if (cache) {
        res.sendFile(cache);
    } else {
        SERVICE.get_tn(req, function (data) {
            if (data.error === true) {
                res.sendFile(PATH.join(__dirname, '../public', data.data));
            } else {
                res.status(data.status).end(data.data, 'binary');
            }
        });
    }
};

exports.get_image = function (req, res) {
    SERVICE.get_image(req, function (data) {
        res.set('Content-Type', 'image/jpeg');
        res.end(data.data, 'binary');
    });
};

exports.get_viewer = function (req, res) {
    SERVICE.get_viewer(req, function (data) {
        res.redirect(data.data);
    });
};

exports.save_transcript = function (req, res) {
    MODEL.save_transcript(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.ping = function (req, res) {
    SERVICE.ping_services(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_thumbnail = function (req, res) {
    SERVICE.get_thumbnail(req, function (data) {

        res.set('Content-Type', 'image/jpeg');

        if (data.error !== undefined && data.error === true) {
            res.sendFile(PATH.join(__dirname, '../public', data.data));
        } else {
            res.end(data, 'binary');
        }
    });
};

exports.get_unpublished_admin_objects = function (req, res) {
    SERVICE.get_unpublished_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};