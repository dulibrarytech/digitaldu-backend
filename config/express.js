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

const HTTP = require('http'),
    EXPRESS = require('express'),
    COMPRESS = require('compression'),
    BODYPARSER = require('body-parser'),
    METHODOVERRIDE = require('method-override'),
    HELMET = require('helmet'),
    XSS = require('../libs/dom');

module.exports = function() {

    const APP = EXPRESS(),
        SERVER = HTTP.createServer(APP);

    SERVER.listen(process.env.APP_PORT);

    if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    } else if (process.env.NODE_ENV === 'production') {
        APP.use(COMPRESS());
    }

    APP.use(BODYPARSER.urlencoded({
        extended: true
    }));
    APP.use(BODYPARSER.json());
    APP.use(METHODOVERRIDE());
    APP.use(HELMET());

    APP.use(EXPRESS.static('./public'));
    APP.use(XSS.sanitize_req_query);
    APP.use(XSS.sanitize_req_body);
    APP.set('views', './views');
    APP.set('view engine', 'ejs');

    require('../auth/routes.js')(APP);
    require('../users/routes.js')(APP);
    require('../repository/routes.js')(APP);
    require('../indexer/routes.js')(APP);
    require('../dashboard/routes.js')(APP);
    require('../stats/routes.js')(APP);
    require('../import/routes.js')(APP);
    require('../search/routes.js')(APP);
    require('../utils/routes.js')(APP);
    require('../uploads/index.js')(APP);
};