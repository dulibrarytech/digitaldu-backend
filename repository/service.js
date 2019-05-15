'use strict';

const archivematica = require('../libs/archivematica'),
    archivespace = require('../libs/archivespace'),
    duracloud = require('../libs/duracloud'),
    logger = require('../libs/log4'),
    async = require('async');

/**
 * Pings third-party services to determine availability
 * @param req
 * @param callback
 */
exports.ping_services = function (req, callback) {

    async.waterfall([
        ping_archivematica,
        ping_archivematica_storage,
        ping_archivespace,
        ping_duracloud
    ], function (error, results) {

        if (error) {
            logger.module().error('ERROR: unable to ping third-party services ' + error);
            return false;
        }

        callback({
            status: 200,
            message: 'Services pinged.',
            data: results
        });
    });

    function ping_archivematica(callback) {

        archivematica.ping_api(function (response) {
            let obj = {};
            obj.archivematica = response.status;
            callback(null, obj);
        });
    }

    function ping_archivematica_storage(obj, callback) {

        archivematica.ping_storage_api(function (response) {
            obj.archivematica_storage = response.status;
            callback(null, obj);
        });
    }

    function ping_archivespace(obj, callback) {

        archivespace.ping(function (response) {
            obj.archivespace = response.status;
            callback(null, obj);
        });

    }

    function ping_duracloud(obj, callback) {

        duracloud.ping(function (response) {
            obj.duracloud = response.status;
            callback(null, obj);
        });
    }
};