'use strict';

var fs = require('fs'),
    Config = require('../config/config'),
    es = require('elasticsearch'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.dbHost,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    });

var client = new es.Client({
    host: Config.elasticSearch
    // log: 'trace'
});

exports.get_objects = function (req, callback) {

    var pid = req.query.pid; // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            is_member_of_collection: pid,
            is_active: 1
            // is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Collection'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_object = function (req, callback) {

    var pid = req.query.pid;  // TODO: sanitize

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'mime_type', 'is_compound', 'created')
        .where({
            // is_member_of_collection: pid,
            pid: pid,
            is_active: 1
            // is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Collection'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

/*
 knex('tbl_rels')
 .join('tbl_metadata', 'tbl_rels.pid', 'tbl_metadata.pid')
 .join('tbl_object_data', 'tbl_metadata.pid', 'tbl_object_data.pid')
 .select('*')
 .where('tbl_rels.is_member_of_collection', pid)
 .then(function (data) {
 callback({
 status: 200,
 content_type: {'Content-Type': 'application/json'},
 data: data,
 message: 'Objects'
 });
 })
 .catch(function (error) {
 console.log(error);
 });
 */

/* gets root collections */
exports.get_collections = function (req, callback) {

    knex('tbl_objects')
        .select('is_member_of_collection', 'pid', 'object_type', 'display_record', 'created')
        .where({
            is_member_of_collection: 'codu:root',
            is_active: 1,
            is_published: 1
        })
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Root collections'
            });
        })
        .catch(function (error) {
            // TODO: add error callback
            console.log(error);
        });
};

exports.get_collection = function (req, callback) {

    var id = req.query.collection_pid;
    var pid = req.query.pid;

    if (id !== undefined && pid !== undefined) {

        knex('tbl_objects')
            .select('*')
            .where({
                collection_pid: pid,
                pid: pid,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: data,
                    message: 'Collection'
                });
            })
            .catch(function (error) {
                // TODO: add error callback
                console.log(error);
            });
    }
};

exports.get_collection_name = function (req, callback) {

    var pid = req.query.pid;

    if (pid !== undefined) {

        knex('tbl_collections')
            .select('pid', 'title', 'description')
            .where({
                pid: pid,
                is_active: 1,
                is_published: 1
            })
            .then(function (data) {
                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: data,
                    message: 'Collection info'
                });
            })
            .catch(function (error) {
                // TODO: add error callback
                console.log(error);
            });
    }
};

exports.update_collection = function (req, callback) {

    var updateObj = {};
    updateObj.title = req.body.title;

    if (req.body.description !== undefined) {
        updateObj.description = req.body.description;
    }

    updateObj.is_active = req.body.is_active;
    updateObj.is_published = req.body.is_published;

    knex('tbl_collections')
        .where({
            id: req.body.id,
            pid: req.body.pid
        })
        .update(updateObj)
        .then(function (data) {
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Collection updated'
            });
        })
        .catch(function (error) {
            console.log(error);
        });
};

exports.get_collection_tn = function (req, callback) {

    var id = req.query.collection_id,
        data = null;

    try {

        var tn = Config.collectionTnPath;
        data = fs.readFileSync(tn + id + '.jpg');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jpeg'},
            data: data,
            message: 'Collection TN object'
        });

    } catch(e) {

        console.log(e);
        // TODO: log to file
        data = fs.readFileSync(Config.errorTn);
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jpeg'},
            data: data,
            message: 'Collection TN object'
        });
    }
};

exports.get_object_metadata = function (req, callback) {

    var pid = req.query.pid.replace(/_/g, ':');

    knex('tbl_rels')
        .join('tbl_metadata', 'tbl_rels.pid', 'tbl_metadata.pid')
        .join('tbl_object_data', 'tbl_metadata.pid', 'tbl_object_data.pid')
        .select('*')
        .where('tbl_rels.pid', pid)
        .then(function (data) {
            console.log(data);
            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                data: data,
                message: 'Objects'
            });
        })
        .catch(function (error) {
            console.log(error);
        });
};

exports.get_object_tn = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/tn/' + pid + '_TN.jpg');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jpeg'},
            data: data,
            message: 'TN object'
        });
    } catch(e) {

        console.log(e);
        // TODO: log to file
        data = fs.readFileSync(Config.errorTn);
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jpeg'},
            data: data,
            message: 'Object TN object'
        });
    }
};

exports.get_mods = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/metadata/mods/' + pid + '_MODS.xml');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'application/xml'},
            data: data,
            message: 'MODS record'
        });
    } catch(e) {
        console.log(e);
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
    }
};

exports.get_image_jpg = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/image/access/' + pid + '_JPG.jpg');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jpeg'},
            data: data,
            message: 'Image object'
        });
    } catch(e) {
        console.log(e);
        // TODO: return default thumbnail
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.get_image_tiff = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/image/master/' + pid + '_TIFF.tif');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/tiff'},
            data: data,
            message: 'Image object'
        });
    } catch(e) {
        console.log(e);
        // TODO: return default thumbnail
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.get_image_jp2 = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/image/access/' + pid + '_JP2.jp2');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'image/jp2'},
            data: data,
            message: 'Image object'
        });
    } catch(e) {
        console.log(e);
        // TODO: return default thumbnail
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.get_pdf = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/pdf/master/' + pid + '_PDF.pdf');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'application/pdf'},
            data: data,
            message: 'PDF object'
        });
    } catch(e) {
        console.log(e);
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.get_video_mp4 = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/video/access/' + pid + '_MP4.mp4');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'video/mp4'},
            data: data,
            message: 'Video object'
        });
    } catch(e) {
        console.log(e);
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.get_video_mov = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        data = null;

    try {
        data = fs.readFileSync(Config.objectPath + pid + '/obj/video/access/' + pid + '_MOV.mov');
        callback({
            status: 200,
            mime_type: {'Content-Type': 'video/mov'},
            data: data,
            message: 'Video object'
        });
    } catch(e) {
        console.log(e);
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
        /*
         callback({
         status: 200,
         mime_type: {'Content-Type': 'image/jpeg'},
         data: data,
         message: 'No TN object'
         });
         */
    }
};

exports.do_search = function (req, callback) {

    var q = req.query.q;

    client.search({
        // from: 0, // search.from,
        // size: 40, // search.size,
        index: Config.elasticSearchIndex,
        q: q
    }).then(function (body) {
        // console.log(body.hits.hits);
        // callback(body.hits.hits);

        callback({
            status: 200,
            data: body.hits.hits,
            message: 'Search Results'
        });

    }, function (error) {
       // callback(error);
    });
};