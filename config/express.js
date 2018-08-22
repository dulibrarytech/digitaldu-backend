'use strict';

var http = require('http'),
    express = require('express'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    helmet = require('helmet');

module.exports = function () {

    var app = express(),
        server = http.createServer(app);

    if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(helmet());

    app.use(express.static('./public'));
    app.set('views', './views');
    app.set('view engine', 'ejs');

    require('../auth/routes.js')(app);
    require('../users/routes.js')(app);
    require('../groups/routes.js')(app);
    require('../repository/routes.js')(app);
    require('../indexer/routes.js')(app);
    require('../dashboard/routes.js')(app);
    require('../stats/routes.js')(app);
    require('../import/routes.js')(app);
    require('../archivematica/routes.js')(app);

    return server;
};