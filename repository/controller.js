'use strict';

var Repo = require('../repository/model');

/* communities */
exports.get_communities = function (req, res) {
    Repo.get_communities(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.update_community = function (req, res) {
    Repo.update_community(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_community_tn = function (req, res) {

    Repo.get_community_tn(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

/* collections */
exports.get_collections = function (req, res) {
    Repo.get_collections(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_collection = function (req, res) {
    Repo.get_collection(req, function (data) {
        res.status(data.status).send(data.data);
    });
};


exports.get_collection_tn = function (req, res) {
    Repo.get_collection_tn(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_objects = function (req, res) {
    Repo.get_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_metadata = function (req, res) {
    Repo.get_metadata(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_tn = function (req, res) {
    Repo.get_tn(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_mods = function (req, res) {
    Repo.get_mods(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_object = function (req, res) {
    console.log('meow');
    Repo.get_object_file(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_image_jpg = function (req, res) {
    Repo.get_image_jpg(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_image_tiff = function (req, res) {
    Repo.get_image_tiff(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_image_jp2 = function (req, res) {
    Repo.get_image_jp2(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_pdf = function (req, res) {
    Repo.get_pdf(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_video = function (req, res) {
    Repo.get_video(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

exports.get_video_mp4 = function (req, res) {
    Repo.get_video_mp4(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

/* used with single object request
 if (data.mime_type['Content-Type'] !== undefined && data.mime_type['Content-Type'] === 'application/json') {
 res.status(data.status).json(data.data);
 } else {
 res.writeHead(data.status, data.mime_type);
 res.end(data.data, 'binary');
 }
 */