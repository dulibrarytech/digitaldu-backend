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

exports.default = function (req, res) {
    res.status(403).send({
        info: 'University of Denver Libraries - Digital Object Repository'
    });
};

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

    if (!VALIDATOR.isAlpha(req.body.type) && req.body.type.length < 11) {
        res.status(400).send({
            message: 'Bad Request'
        });
        return false;
    }

    const uuid = req.body.pid;
    const type = req.body.type;

    MODEL.publish(uuid, type, function (data) {

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

    if (!VALIDATOR.isAlpha(req.body.type) && req.body.type.length < 11) {
        res.status(400).send({
            message: 'Bad Request'
        });
        return false;
    }

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

exports.get_recent_ingests = function (req, res) {
    MODEL.get_recent_ingests(function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_unpublished_records = function (req, res) {
    MODEL.get_unpublished_records(function (data) {
        res.status(data.status).send(data.data);
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

    if (req.body.pid === undefined || req.body.pid.length === 0) {
        res.status(400).send('Bad request');
        return false;
    }

    const pid = req.body.pid;
    const thumbnail = req.body.thumbnail_url;

    MODEL.update_thumbnail(pid, thumbnail, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_tn = function (req, res) {

    let cache = CACHE.get_tn_cache(req);

    if (cache) {
        res.sendFile(cache);
    } else {

        let uuid = req.query.uuid;

        if (req.query.type !== undefined) {
            let type = VALIDATOR.unescape(req.query.type);
        }

        if (uuid === undefined || uuid.length === 0) {
            res.status(400).send('Bad request.');
            return false;
        }

        SERVICE.get_tn(uuid, function (data) {
            if (data.error === true) {
                res.sendFile(PATH.join(__dirname, '../public', data.data));
            } else {
                res.status(data.status).end(data.data, 'binary');
            }
        });
    }
};

exports.delete_object = function (req, res) {
    MODEL.delete_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
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

exports.get_dc_thumbnail = function (req, res) {

    const tn = VALIDATOR.unescape(req.query.tn);

    if (tn === undefined || tn.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    SERVICE.get_dc_thumbnail(tn, function (data) {

        const missing_tn = '/images/image-tn.png';
        res.set('Content-Type', 'image/jpeg');

        if (data.error !== undefined && data.error === true) {
            res.sendFile(PATH.join(__dirname, '../public', missing_tn));
        } else {
            res.end(data, 'binary');
        }
    });
};
