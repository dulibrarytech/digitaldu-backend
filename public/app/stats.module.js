var statsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#stats').html('Error: Unable to retrieve stats');
    };

    var api = configModule.getApi();

    var renderStats = function (data) {

        $('#published-collection-count').html(data.published_collection_count.toLocaleString('en'));
        $('#total-collection-count').html(data.total_collection_count.toLocaleString('en'));
        $('#published-object-count').html(data.published_object_count.toLocaleString('en'));
        $('#total-object-count').html(data.total_object_count.toLocaleString('en'));
        $('#total-image-count').html(data.total_image_count.toLocaleString('en'));
        $('#total-pdf-count').html(data.total_pdf_count.toLocaleString('en'));
        $('#total-audio-count').html(data.total_audio_count.toLocaleString('en'));
        $('#total-video-count').html(data.total_video_count.toLocaleString('en'));

        $('#loading-published-collection-count').html('');
        $('#loading-total-collection-count').html('');
        $('#loading-published-object-count').html('');
        $('#loading-total-object-count').html('');
        $('#loading-image-count').html('');
        $('#loading-pdf-count').html('');
        $('#loading-audio-count').html('');
        $('#loading-video-count').html('');
        $('a').tooltip();
    };

    obj.getStats = function () {

        $.ajax(api + '/api/admin/v1/stats')
            .done(function(data) {
                renderStats(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.init = function () {
        obj.getStats();
    };

    return obj;

}());