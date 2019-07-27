const configModule = (function () {

    'use strict';

    let obj = {};

    /**
     * Resolves repo api url
     * @returns {string}
     */
    obj.getApi = function () {

        var api = 'http://localhost:8000';

        if (document.domain !== 'localhost') {
            api = location.protocol + '//' + document.domain + ':' + location.port;
        }

        return api;
    };

    /**
     * Contains urls for default thumbnails
     * @returns {{duracloud: string, default: string, default_pdf: string, default_audio: string, default_video: string}}
     */
    obj.getTnUrls = function () {
        return {
            tn_service: 'http://libspecc01-vlp.du.edu/discovery_v2/datastream/',
            duracloud: 'https://archivesdu.duracloud.org/durastore/dip-store/dip-store/',
            default_collection: configModule.getApi() + '/images/media.jpg',
            default: configModule.getApi() + '/images/media.jpg',
            default_pdf: configModule.getApi() + '/images/media.jpg',
            default_audio: configModule.getApi() + '/images/media.jpg',
            default_video: configModule.getApi() + '/images/media.jpg'
        };
    };

    return obj;

}());