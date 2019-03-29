const helperModule = (function () {

    'use strict';

    let obj = {};

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

    obj.init = function () {
        npProgress();
    };

    return obj;

}());

helperModule.init();