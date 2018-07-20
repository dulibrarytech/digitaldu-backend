'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.abstract = function (array, index) {

    var abstract = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['type'] !== undefined) {
            abstract += '<abstract type="' + array[index].attr['type'].toLowerCase() + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            abstract += '<abstract altFormat="' + array[index].attr['altFormat'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            abstract += '<abstract displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['altContent'] !== undefined) {
            abstract += '<abstract altContent="' + array[index].attr['altContent'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            abstract += '<abstract altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            abstract += '<abstract shareable="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            abstract += '<abstract lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else {
            abstract += '<abstract>';
        }

        abstract += xmlString.encode(array[index].val.trim());
        abstract += '</abstract>';
    }

    return abstract;
};