'use strict';

var Repo = require('../repository/controller');

// TODO: apply api security.  i.e. API key (for discovery layer)
module.exports = function (app) {

    /* communities used by discovery layer and repo */
    /*
    app.route('/api/communities')
        .get(Repo.get_communities)
        .put(Repo.update_community);
    */
    /*  used by discovery layer and repo */
    /*
    app.route('/api/community/tn')
        .get(Repo.get_community_tn);
        // .put(Repo.update_community_tn);
    */
    /* collections used by discovery layer and repo */
    app.route('/api/collections')
        .get(Repo.get_collections);

    /* retrieves single collection record for edit used by repo*/
    app.route('/api/collection')
        .get(Repo.get_collection)
        .put(Repo.update_collection);

    app.route('/api/collection/name')
        .get(Repo.get_collection_name);

    // used by discovery layer and repo
    app.route('/api/collection/tn')
        .get(Repo.get_collection_tn);
    // .put(Repo.update_collection_tn);

    /* objects used by discovery layer*/
    app.route('/api/objects')
        .get(Repo.get_objects);

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

    /*

    app.route('/api/object/video/mov')
        .get(Repo.get_video_mov);

    app.route('/api/object/audio/mp3')
        .get(Repo.get_audio_mp3);

    */
};