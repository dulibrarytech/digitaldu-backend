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
    token = require('../libs/tokens');

module.exports = function (app) {

    app.route('/')
        .get(Utils.default);

    app.get('/robots.txt', function (req, res) {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
    });

    //--- Updates metadata ---//
    // updates all metadata
    /*
    app.route('/api/admin/v1/utils/batch/update/metadata')
        .post(token.verify, Utils.batch_update_metadata);
    */
    app.route('/api/admin/v1/utils/batch/update/metadata/collection')
        .post(token.verify, Utils.batch_update_collection_metadata);

    app.route('/api/v1/utils/metadata/update')
        .put(token.verify, Utils.update_metadata_record);

    //--- Re-index repository data ---//
    app.route('/api/admin/v1/utils/reindex')
        .post(token.verify, Utils.reindex);

    //--- Delete tasks ---//
    app.route('/api/admin/v1/utils/objects/delete')
        .post(token.verify, Utils.delete_objects);

    app.route('/api/admin/v1/utils/object/delete')
        .post(token.verify, Utils.delete_object);

    /*
    app.route('/api/admin/v1/utils/objects/delete')
        .post(token.verify, Utils.batch_delete_objects);
    */
    // temporary
    /*
    app.route('/api/admin/v1/utils/objects/uuids/delete')
        .post(token.verify, Utils.get_sip_uuids);
    */

    //--- misc. tasks ---//
    app.route('/api/admin/v1/utils/objects')
        .get(token.verify, Utils.check_objects);

    app.route('/api/admin/v1/utils/objects/ids')
        .get(token.verify, Utils.get_archivesspace_ids);

    app.route('/api/admin/v1/utils/objects/fix-compounds')
        .get(token.verify, Utils.fix_compound_objects);

    app.route('/api/admin/v1/utils/objects/fix-display-records')
        .post(token.verify, Utils.fix_display_records);

    app.route('/api/admin/v1/utils/confirm-dip')
        .get(token.verify, Utils.confirm_dip_file);
};