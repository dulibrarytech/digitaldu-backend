var config = require('../config/config'),
    request = require('request');

exports.create_handle = function (pid, callback) {

    'use strict';

    var handleHost = config.handleHost,
        handlePrefix = config.handlePrefix,
        handleUser = config.handleUsername,
        handlePassword = config.handlePwd,
        handleTarget = config.handleTarget,
        handleServer = config.handleServer;

    var handlUrl = handleHost + handlePrefix + '/' + encodeURIComponent(pid) + '?target=' + handleTarget + encodeURIComponent(pid),
        auth = new Buffer(handleUser + ':' + handlePassword).toString('base64');

    var options = {
        url: handlUrl,
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + auth
        }
    };

    request(options, function (error, response, body) {

        if (error) {
            console.log(error);
        }

        if (response.statusCode === 201) {

            console.log('Handle for object: ' + pid + ' had been created.');
            var handle = handleServer + handlePrefix + '/' + pid;
            callback(handle);

        } else if (response.statusCode === 409) {
            console.log('Error: Handle already exists (conflict)');
        } else {
            console.log('Error: Unable to create new handle');
        }
    });
};