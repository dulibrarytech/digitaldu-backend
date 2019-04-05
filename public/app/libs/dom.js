const dom = (function () {

    'use strict';

    let obj = {};

    obj.appendById = function (id, data) {

        if (id === undefined || data === undefined) {
            return false;
        }

        let el = document.querySelector('#' + id);
        el.innerHTML = data;

        return false;
    };

    return obj;

}());