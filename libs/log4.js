'use strict';

const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: './logs/application.log' }
    },
    categories: {
        default: { appenders: [ 'out', 'app' ], level: 'debug' }
    }
});

exports.module = function () {
    return log4js.getLogger();
};