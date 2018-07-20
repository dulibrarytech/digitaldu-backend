'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.extension = function (array, index) {

    var extension = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['displayLabel'] !== undefined) {
            extension += '<extension displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else {
            extension += '<extension>';
        }

        extension += xmlString.encode(array[index].val.trim());
        extension += '</extension>';
    }

    return extension;
};