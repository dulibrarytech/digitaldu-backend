var config = require('../config/config'),
    logger = require('../libs/log4'),
    request = require('request');

/** DEPRECATE
 * Makes HTTP request to get pid
 * @param callback
 */
exports.get_next_pid = function (callback) {

    'use strict';

    request.post({
        url: config.apiUrl + '/api/admin/v1/repo/pid'
    }, function(error, httpResponse, body){

        if (error) {
            logger.module().error('ERROR: Unable to get next pid ' + error);

            callback({
                error: true,
                message: 'ERROR: Unable to get next pid ' + error
            });

            return false;
        }

        if (httpResponse.statusCode === 200) {

            var json = JSON.parse(body);
            callback(json.pid);

        } else {
            logger.module().error('ERROR: Unable to get next pid ' + error);

            callback({
                error: true,
                message: 'ERROR: Unable to get next pid ' + error
            });
        }
    });
};