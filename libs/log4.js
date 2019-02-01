'use strict';

const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        repo: {
            type: 'dateFile',
            filename: './logs/repo.log',
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ['out', 'repo'],
            level: 'debug'
        }
    }
});

exports.module = function () {
    return log4js.getLogger();
};