'use strict';

exports.classification = function (array, index) {

    var classification = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['lang'] !== undefined) {
            classification += '<classification lang="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['authority'] !== undefined) {
            classification += '<classification authority="' + array[index].attr['authority'] + '">';
        } else if (array[index].attr['edition'] !== undefined) {
            classification += '<classification edition="' + array[index].attr['edition'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            classification += '<classification displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            classification += '<classification usage="' + array[index].attr['usage'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            classification += '<classification altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['generator'] !== undefined) {
            classification += '<classification generator="' + array[index].attr['generator'] + '">';
        } else {
            classification += '<classification>';
        }

        classification += array[index].val;
        classification += '</classification>';
    }

    return classification;
};