/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const http = require('http'),
    // https = require('https'),
    express = require('express'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    helmet = require('helmet'),
    fs = require('fs'),
    config = require('../config/config');

module.exports = function () {

    const app = express();
    let server = http.createServer(app);

    /*
    if (process.env.NODE_ENV === 'production') {

        const key = fs.readFileSync(config.sslKey, 'utf8'),
            cert = fs.readFileSync(config.sslCert, 'utf8');

        let credentials = {
            key: key,
            cert: cert
        };

        server = https.createServer(credentials, app);
    }
    */
    server.listen(process.env.APP_PORT);

    // let io = require('socket.io')(server);

    // io.path('/api/admin/v1/import/status');

    // socket.io route
    // app.get('/socket', function (req, res) {});

    // accepts client connections
    /*
    io.on('connection', function(socket){
        // sends ingest status to client
        socket.on('ingest_status', function(status) {
            io.emit('ingest_status', status);
        });
    });
    */

    /*
    io.on('connection', function(socket){
        // sends transfer status to client
        socket.on('transfer_status', function(status) {
            io.emit('transfer_status', status);
        });
    });
    */

    /*
    io.on('connection', function(socket){
        // sends import status to client
        socket.on('import_status', function(status) {
            io.emit('import_status', status);
        });
    });
    */

    /*
    io.on('connection', function(socket){
        // sends import fail status to client
        socket.on('fail_status', function(status) {
            io.emit('fail_status', status);
        });
    });
    */

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
    require('../repository/routes.js')(app);
    require('../indexer/routes.js')(app);
    require('../dashboard/routes.js')(app);
    require('../stats/routes.js')(app);
    require('../import/routes.js')(app);
    require('../search/routes.js')(app);
};