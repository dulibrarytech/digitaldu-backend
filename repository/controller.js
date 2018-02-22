'use strict';

var Repo = require('../repository/model');

/* communities */
/*
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
*/

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

exports.get_collection_name = function (req, res) {
    Repo.get_collection_name(req, function (data) {
        res.status(data.status).send(data.data);
    });
};


exports.update_collection = function (req, res) {
    Repo.update_collection(req, function (data) {
        res.status(data.status).send(data);
    });
};

exports.get_collection_tn = function (req, res) {
    Repo.get_collection_tn(req, function (data) {
        res.writeHead(data.status, data.mime_type);
        res.end(data.data, 'binary');
    });
};

/* objects */
exports.get_objects = function (req, res) {
    Repo.get_objects(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_object_metadata = function (req, res) {
    Repo.get_object_metadata(req, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.get_object_tn = function (req, res) {
    Repo.get_object_tn(req, function (data) {
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

/* search */
exports.do_search = function (req, res) {
    Repo.do_search(req, function (data) {
        res.status(data.status).send(data.data);
    });
};