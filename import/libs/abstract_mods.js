'use strict';

exports.abstract = function (array, index) {

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        var abstract = '';

        if (array[index].attr['type'] !== undefined) {
            abstract += '<abstract type="' + array[index].attr['type'] + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            abstract += '<abstract altFormat="' + array[index].attr['altFormat'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            abstract += '<abstract displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['altContent'] !== undefined) {
            abstract += '<abstract altContent="' + array[index].attr['altContent'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            abstract += '<abstract altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            abstract += '<abstract shareable="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            abstract += '<abstract lang="' + array[index].attr['lang'] + '">';
        } else {
            abstract += '<abstract>';
        }

        abstract += array[index].val.trim();
        abstract += '</abstract>';

        return abstract;
    }
};