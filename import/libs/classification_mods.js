'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.classification = function (array, index) {

    var classification = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['lang'] !== undefined) {
            classification += '<classification lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['authority'] !== undefined) {
            classification += '<classification authority="' + array[index].attr['authority'].toLowerCase() + '">';
        } else if (array[index].attr['edition'] !== undefined) {
            classification += '<classification edition="' + array[index].attr['edition'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            classification += '<classification displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            classification += '<classification usage="' + array[index].attr['usage'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            classification += '<classification altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['generator'] !== undefined) {
            classification += '<classification generator="' + array[index].attr['generator'].toLowerCase() + '">';
        } else {
            classification += '<classification>';
        }

        classification += xmlString.encode(array[index].val.trim());
        classification += '</classification>';
    }

    return classification;
};