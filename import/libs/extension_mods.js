'use strict';

exports.extension = function (array, index) {

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        var extension = '';

        if (array[index].attr['displayLabel'] !== undefined) {
            extension += '<extension displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else {
            extension += '<extension>';
        }

        extension += array[index].val.trim();
        extension += '</extension>';

        return extension;
    }
};