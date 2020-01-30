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

const Utils = require('../utils/controller'),
    apikey = require('../libs/api-key');

module.exports = function (app) {

    app.route('/api/admin/v1/utils/objects')
        .get(Utils.check_objects);

    app.route('/api/admin/v1/utils/reindex')
        .post(apikey.verify, Utils.reindex);

    app.route('/api/admin/v1/utils/uuids')
        .get(apikey.verify, Utils.get_uuids);

    app.route('/api/admin/v1/utils/objects/ids')
        .get(Utils.get_archivesspace_ids);

    app.route('/api/admin/v1/utils/objects/fix-compounds')
        .get(Utils.fix_compound_objects);

    /*
    app.route('api/admin/v1/utils/restart')
        .post(Utils.restart);
        */
};

// curl --data "collection=9eded850-fb8e-4e39-bf9c-ea26dd7893d4" http://localhost:8000/api/admin/v1/import/start_transfer