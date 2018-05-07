'use strict';

exports.identifier = function (array, index) {

    var identifier = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['lang'] !== undefined) {
            identifier += '<identifier lang="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['type'] !== undefined) {
            identifier += '<identifier type="' + array[index].attr['type'] + '">';
        } else if (array[index].attr['typeURI'] !== undefined) {
            identifier += '<identifier typeURI="' + array[index].attr['typeURI'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            identifier += '<identifier displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['invalid'] !== undefined) {
            identifier += '<identifier invalid="' + array[index].attr['invalid'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            identifier += '<identifier altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else {
            identifier += '<identifier>';
        }

        identifier += array[index].val.trim();
        identifier += '</identifier>';
    }

    return identifier;
};