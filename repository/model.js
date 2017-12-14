'use strict';

var fs = require('fs'),
    Config = require('../config/config'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.host,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    });

// localhost:8000/collections?type=root // gets top level collections
// localhost:8000/collections?type=child&pid=codu:19716  // gets child collections
// localhost:8000/object?&type=all&pid=codu:19717  // gets collection objects
exports.get_collections = function (req, callback) {

    var type = req.query.type,
        pid = req.query.pid;

    switch (type) {
        case 'root':
            get_root_collections(function (data) {
                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: data,
                    message: 'Root level collections'
                });
            });
            break;
        case 'child':
            get_child_collections(pid, function (data) {
                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: data,
                    message: 'Child level collections'
                });
            });
            break;
    }

};

// TODO: apply error catching
var get_root_collections = function (callback) {

    knex('tbl_collections')
        .select('id', 'pid', 'title', 'description')
        .where({
            is_root: 1,
            is_active: 1,
            is_published: 1
        })
        .then(function (collections) {
            callback(collections);
        })
        .catch(function (error) {
            console.log(error);
        });
};

var get_child_collections = function (pid, callback) {

    knex('tbl_collections')
        .select('id', 'pid', 'title', 'description', 'is_member_of')
        .where({
            is_member_of: pid,
            is_root: 0,
            is_child: 1,
            is_active: 1,
            is_published: 1
        })
        .then(function (collections) {
            callback(collections);
        })
        .catch(function (error) {
            console.log(error);
        });
};

// localhost:8000/object?pid=codu:37705&type=video&master=true
// localhost:8000/object?pid=codu:37705&type=video
// localhost:8000/object?pid=codu:37705&type=mods
exports.get_object = function (req, callback) {

    var pid = req.query.pid.replace(/:/g, '_'),
        type = req.query.type,
        is_master = false;

    if (req.query.master !== undefined && req.query.master === 'true') {
        is_master = true;
    }

    switch (type) {
        case 'mods':
            get_mods(pid, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback({
                    status: 200,
                    mime_type: {'Content-Type': 'application/xml'},
                    data: data,
                    message: 'MODS record'
                });
            });

            break;
        case 'video':

            // TODO: account for .MOV files
            var obj = {};
            obj.pid = pid;
            obj.is_master = is_master;
            obj.type = 'video';
            obj.message = 'Video object';

            if (is_master === true) {
                obj.ds = 'master';
                obj.ext = 'MP4.mp4';
                obj.content_type = 'video/mp4';
            } else {
                obj.ds = 'access';
                obj.ext = 'MP4.mp4';
                obj.content_type = 'video/mp4';
            }

            get_object(obj, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback(data);
            });

            break;
        case 'pdf':

            var obj = {};
            obj.pid = pid;
            obj.is_master = is_master;
            obj.type = 'pdf';
            obj.ext = 'PDF object';
            obj.ds = 'master';
            obj.ext = 'PDF.pdf';
            obj.content_type = 'application/pdf';

            get_object(obj, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback(data);
            });

            break;
        case 'large_image':

            var obj = {};
            obj.pid = pid;
            obj.is_master = is_master;
            obj.type = 'image';
            obj.message = 'Large image object';

            if (is_master === true) {
                obj.ds = 'master';
                obj.ext = 'TIFF.tif';
                obj.content_type = 'image/tiff';
            } else {
                obj.ds = 'access';
                obj.ext = 'JP2.jp2';
                obj.content_type = 'image/jp2';
            }

            get_object(obj, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback(data);
            });

            break;
        case 'small_image':
            /*
            get_pdf(pid, is_master, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback({
                    status: 200,
                    mime_type: {'Content-Type': 'application/pdf'},
                    data: data,
                    message: 'PDF object'
                });
            });
            */

            break;
        case 'tn':
            get_tn(pid, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback({
                    status: 200,
                    mime_type: {'Content-Type': 'image/jpeg'},
                    data: data,
                    message: 'TN object'
                });
            });

            break;
        case 'all':
            get_objects(pid, function (data) {

                if (data === 'error') {
                    // TODO: return error
                }

                callback({
                    status: 200,
                    mime_type: {'Content-Type': 'application/json'},
                    data: data,
                    message: 'Objects'
                });

            });

            break;
        default:

            callback({
                status: 404,
                mime_type: {'Content-Type': 'application/json'}
            });

            break;
    }
};

// TODO: move these into a lib
var get_objects = function (pid, callback) {

    knex('tbl_rels')
        .join('tbl_metadata', 'tbl_rels.pid', 'tbl_metadata.pid')
        .join('tbl_object_data', 'tbl_metadata.pid', 'tbl_object_data.pid')
        .select('*')
        .where('tbl_rels.is_member_of_collection', pid.replace(/_/g, ':'))
        .then(function (data) {
            callback(data);
        })
        .catch(function (error) {
            console.log(error);
        });
};

var get_tn = function (pid, callback) {
    var tn = fs.readFileSync(Config.objectPath + pid + '/tn/' + pid + '_TN.jpg');
    callback(tn);
};

var get_mods = function (pid, callback) {
    var mods = fs.readFileSync(Config.objectPath + pid + '/metadata/mods/' + pid + '_MODS.xml');
    callback(mods);
};

var get_object = function (obj, callback) {

    try {
        var data = fs.readFileSync(Config.objectPath + obj.pid + '/obj/' + obj.type + '/' + obj.ds + '/' + obj.pid + '_' + obj.ext);
        callback({
            status: 200,
            mime_type: {'Content-Type': obj.content_type},
            data: data,
            message: obj.message
        });
    } catch (e) {
        console.log(e);
        callback({
            status: 404,
            mime_type: {'Content-Type': 'application/json'}
        });
    }
};