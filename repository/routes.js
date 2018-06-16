'use strict';

var Repo = require('../repository/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {


    /* Used by discovery layer*/
    app.route('/api/objects')
        .get(Repo.get_objects);

    app.route('/api/object')
        .get(Repo.get_object);


    /* collections used by discovery layer and repo */
    /* gets top level collections */
    app.route('/api/collections')
        .get(Repo.get_collections);

    /* retrieves single collection record for edit used by repo*/
    app.route('/api/collection')
        .get(Repo.get_collection)
        .put(Repo.update_collection);

    /*
    app.route('/api/collection/name')
        .get(Repo.get_collection_name);
    */

    // used by discovery layer and repo
    app.route('/api/collection/tn')
        .get(Repo.get_collection_tn);
    // .put(Repo.update_collection_tn);

    app.route('/api/object/metadata')
        .get(Repo.get_object_metadata);

    // used by discovery layer
    app.route('/api/object/tn')
        .get(Repo.get_object_tn);

    app.route('/api/object/mods')
        .get(Repo.get_mods);

    // used by discovery layer
    app.route('/api/object/image/jpg')
        .get(Repo.get_image_jpg);

    app.route('/api/object/image/tiff')
        .get(Repo.get_image_tiff);

    app.route('/api/object/image/jp2')
        .get(Repo.get_image_jp2);

    app.route('/api/object/pdf')
        .get(Repo.get_pdf);

    app.route('/api/object/video/mp4')
        .get(Repo.get_video_mp4);

    app.route('/api/search')
        .get(Repo.do_search);
};