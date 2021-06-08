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

const UTILS = require('../utils/controller'),
    TOKEN = require('../libs/tokens');

module.exports = function (app) {

    app.route('/')
        .get(UTILS.default);

    app.get('/robots.txt', function (req, res) {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
    });

    app.route('/api/admin/v1/utils/reindex')
        .post(TOKEN.verify, UTILS.reindex);

    app.route('/api/admin/v1/utils/clear_cache')
        .post(TOKEN.verify, UTILS.clear_cache);

    app.route('/api/admin/v1/utils/batch_convert')
        .post(TOKEN.verify, UTILS.batch_convert);

    app.route('/api/admin/v1/utils/batch_fix')
        .post(TOKEN.verify, UTILS.batch_fix);
};
