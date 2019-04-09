const dom = (function () {

    'use strict';

    let obj = {};

    obj.appendById = function (id, data) {

        if (id === undefined || data === undefined) {
            return false;
        }

        let el = document.querySelector('#' + id);
        // el.append(data);
        el.innerHTML = data;

        return false;
    };

    obj.emptyById = function (id) {

        if (id === undefined) {
            return false;
        }

        let el = document.querySelector('#' + id);
        el.innerHTML = '';

        return false;
    };

    return obj;

}());