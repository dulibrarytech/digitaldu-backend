/**

 Copyright 2022 University of Denver

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

exports.ping = (req, res) => {
    SERVICE.ping_services((data) => {
        res.status(data.status).send(data.data);
    });
};

exports.get_record = (req, res) => {

    let uuid = req.query.uuid;

    if (req.query.uuid === undefined || req.query.uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.get_display_record(uuid, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.get_records = (req, res) => {

    if (req.query.uuid === undefined || req.query.uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    let cache = CACHE.get_cache(req);

    if (cache) {
        res.send(cache);
    } else {

        let is_member_of_collection = req.query.uuid;
        let page = req.query.page;
        let total_on_page = req.query.total_on_page;
        let sort = req.query.sort;

        SERVICE.get_records(is_member_of_collection, page, total_on_page, sort, (data) => {
            CACHE.cache_request(req, data.data);
            res.status(data.status).send(data.data);
        });
    }
};

exports.update_thumbnail_url = (req, res) => {

    let uuid = req.body.uuid;
    let thumbnail_url = req.body.thumbnail_url;

    if (uuid === undefined || thumbnail_url === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.update_thumbnail_url(uuid, thumbnail_url, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.create_collection_record = (req, res) => {

    let uri = req.body.uri;
    let is_member_of_collection = req.body.is_member_of_collection;

    if (uri === undefined || is_member_of_collection === undefined) {
        res.status(400).send('Bad request.');
    }

    MODEL.create_collection_record(uri, is_member_of_collection, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.publish = (req, res) => {

    let uuid = req.body.uuid;
    let type = req.body.type;

    if (uuid === undefined || type === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.publish(uuid, type, (data) => {
        CACHE.clear_cache();
        res.status(data.status).send(data.data);
    });
};

exports.suppress = (req, res) => {

    let uuid = req.body.uuid;
    let type = req.body.type;

    if (uuid === undefined || type === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.suppress(uuid, type, (data) => {
        CACHE.clear_cache();
        res.status(data.status).send(data.data);
    });
};

exports.get_suppressed_records = (req, res) => {

    let uuid = req.query.uuid;

    if (uuid === undefined || uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    SERVICE.get_suppressed_records(uuid, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.delete_record = (req, res) => {

    let uuid = req.query.uuid;
    let delete_reason = req.query.delete_reason;

    if (uuid === undefined || delete_reason === undefined) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.delete_record(uuid, delete_reason, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.rebuild_display_record = (req, res) => {

    let uuid = req.body.uuid;

    if (uuid === undefined || uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    MODEL.rebuild_display_record(uuid, (data) => {
        res.status(data.status).send(data);
    });
};

exports.get_tn_service_image = (req, res) => {

    let cache = CACHE.get_tn_cache(req);

    if (cache) {
        res.sendFile(cache);
    } else {

        let uuid = req.query.uuid;

        if (uuid === undefined || uuid.length === 0) {
            res.status(400).send('Bad request.');
            return false;
        }

        SERVICE.get_tn_service_image(uuid, (data) => {
            if (data.error === true) {
                res.sendFile(PATH.join(__dirname, '../public', data.data));
            } else {
                res.status(data.status).end(data.data, 'binary');
            }
        });
    }
};

exports.get_convert_service_image = (req, res) => {

    let is_bad_request = false;
    let uuid = req.query.uuid;
    let full_path = req.query.full_path;
    let object_name = req.query.object_name;
    let mime_type = req.query.mime_type;

    if (uuid === undefined || uuid.length === 0) {
        is_bad_request = true;
    } else if (full_path === undefined || full_path.length === 0) {
        is_bad_request = true;
    } else if (object_name === undefined || object_name.length === 0) {
        is_bad_request = true;
    } else if (mime_type === undefined || mime_type.length === 0) {
        is_bad_request = true;
    }

    if (is_bad_request === true) {
        res.status(400).send('Bad request.');
        return false;
    }

    let obj = {
        sip_uuid: req.query.sip_uuid,
        full_path: VALIDATOR.unescape(req.query.full_path),
        object_name: req.query.object_name,
        mime_type: VALIDATOR.unescape(req.query.mime_type)
    };

    SERVICE.get_convert_service_image(obj, (data) => {
        res.set('Content-Type', 'image/jpeg');
        res.end(data.data, 'binary');
    });
};

exports.get_object_viewer = (req, res) => {

    let uuid = req.query.uuid;

    if (uuid === undefined || uuid.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    SERVICE.get_object_viewer(uuid, (data) => {
        res.redirect(data.data);
    });
};

exports.get_duracloud_thumbnail = (req, res) => {

    let tn = VALIDATOR.unescape(req.query.tn);

    if (tn === undefined || tn.length === 0) {
        res.status(400).send('Bad request.');
        return false;
    }

    SERVICE.get_duracloud_thumbnail(tn, (data) => {

        res.set('Content-Type', 'image/jpeg');

        if (data.error !== undefined && data.error === true) {
            res.sendFile(PATH.join(__dirname, '../public', data.data));
        } else {
            res.end(data, 'binary');
        }
    });
};
