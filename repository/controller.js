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

const Repo = require('../repository/model'),
    Service = require('../repository/service'),
    path = require('path');

/* gets objects by is_member_of_collection pid for discovery layer */
exports.get_objects = function (req, res) {
    Repo.get_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets single object for discovery layer */
exports.get_object = function (req, res) {
    Repo.get_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets objects for administrators */
exports.get_admin_objects = function (req, res) {
    Service.get_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* gets single administrator object */
exports.get_admin_object = function (req, res) {
    Repo.get_admin_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.create_collection_object = function (req, res) {
    Repo.create_collection_object(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_thumbnail = function (req, res) {
    Service.get_thumbnail(req, function (data) {

        if (data.error === true) {
            res.sendFile(path.join(__dirname, '../public', data.data));
        } else {
            res.status(data.status).end(data.data, 'binary');
        }
    });
};

exports.update_thumbnail = function (req, res) {
    Repo.update_thumbnail(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_metadata_cron = function (req, res) {
    Repo.update_metadata_cron(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

/* imports object(s) for administrators */
exports.get_import_admin_objects = function (req, res) {
    Repo.get_import_admin_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.publish_objects = function (req, res) {
    Repo.publish_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.unpublish_objects = function (req, res) {
    Repo.unpublish_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.reset_display_record = function (req, res) {
    Repo.reset_display_record(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.get_object_download = function (req, res) {
    Repo.get_object_download(req, function (data) {

        if (data.file === undefined) {
            res.status(data.status).send(data);
            return false;
        }

        res.set('Content-Type', data.content_type);
        res.download(data.file);
    });
};

exports.ping = function (req, res) {
    Service.ping_services(req, function (data) {
        res.status(data.status).send(data.data);
    });
};