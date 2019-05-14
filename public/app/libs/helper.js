const helperModule = (function () {

    'use strict';

    let obj = {};

    const renderError = function (message) {
        $('#message').html(message);
    };

    /**
     * Renders progress bar and spinner when pages load
     */
    const npProgress = function () {

        if (typeof NProgress != 'undefined') {
            $(document).ready(function () {
                NProgress.start();
            });

            $(window).load(function () {
                NProgress.done();
            });
        }
    };

    /**
     * Gets url parameter
     * @param name
     * @param url
     * @returns {*}
     */
    obj.getParameterByName = function (name, url) {

        if (!url) {
            url = window.location.href;
        }

        name = name.replace(/[\[\]]/g, "\\$&");

        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) {
            return null;
        }

        if (!results[2]) {
            return '';
        }

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    obj.getCurrentYear = function () {
        let cdate = new Date().getFullYear();
        document.querySelector('#cdate').innerHTML = cdate;
    };

    /**
     * Resolves repo thumbnails
     * @param pid
     * @returns {string}
     */
    obj.getTn = function (tn, mime_type, pid) {

        let tnObj = configModule.getTnUrls();

        // set default TN based on mime type
        if (mime_type === 'audio/x-wav') {
            return tnObj.default_audio;
        } else if (mime_type === 'application/pdf') {
            return tnObj.default_pdf;
        } else if (mime_type === 'video/mp4') {
            return tnObj.default_video;
        } else if (tn === 'collection') {
            return tnObj.default_collection;
        } else if (tn === null) {
            return tnObj.default;
            //return 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + pid + '/datastreams/TN/content';
        } else {
            return tnObj.duracloud + tn;
        }
    };

    obj.ping = function () {

        $.ajax({
            url: configModule.getApi() + '/api/ping',
            type: 'GET'
        })
            .done(function (data) {

                let html = '';

                for (let prop in data) {

                    if (data[prop] === 'down') {
                        $('.import-link').hide();
                        html += '<div class="alert alert-danger"><strong>' + prop + ' is currently not available.  Ingests are not possible at this time.</strong></div>';
                    }
                }

                $('#ping').html(html);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to check third-party services.</div>';
                    renderError(message);

                    if (jqXHR.status === 401) {

                        setTimeout(function () {
                            window.location.replace('/dashboard/error');
                        }, 2000);

                        return false;
                    }
                }
            });
    };

    obj.init = function () {
        npProgress();
    };

    return obj;

}());

helperModule.init();