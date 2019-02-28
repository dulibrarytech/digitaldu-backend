'use strict';

require('dotenv').load();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var express = require('./config/express');
var app = express();

// app.listen(process.env.APP_PORT);

console.log('Repository application running at http://' + process.env.APP_HOST + ':' + process.env.APP_PORT + ' in ' + process.env.NODE_ENV + ' mode.');

module.exports = app;