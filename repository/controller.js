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

const REPO = require('../repository/model'),
    SERVICE = require('../repository/service'),
    CACHE = require('../libs/cache'),
    PATH = require('path');

exports.get_admin_objects = function (req, res) {

    let cache = CACHE.get_cache(req);

    if (cache) {
        res.send(cache);
    } else {
        SERVICE.get_admin_objects(req, function (data) {
            CACHE.cache_request(req, data.data);
            res.status(data.status).send(data.data);
        });
    }
};

exports.get_display_record = function (req, res) {
    REPO.get_display_record(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_collection_object = function (req, res) {
    REPO.create_collection_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_thumbnail = function (req, res) {
    REPO.update_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.publish_objects = function (req, res) {
    CACHE.clear_cache();
    REPO.publish_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.unpublish_objects = function (req, res) {
    CACHE.clear_cache();
    REPO.unpublish_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.reset_display_record = function (req, res) {
    REPO.reset_display_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.delete_object = function (req, res) {
    REPO.delete_object(req, function (data) {
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
    REPO.save_transcript(req, function (data) {
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