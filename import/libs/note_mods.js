'use strict';

exports.note = function (array, index) {

    var note = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['displayLabel'] !== undefined) {
            note += '<note displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['ID'] !== undefined) {
            note += '<note ID="' + array[index].attr['ID'] + '">';
        } else if (array[index].attr['authority'] !== undefined) {
            note += '<note altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['typeURI'] !== undefined) {
            note += '<note typeURI="' + array[index].attr['typeURI'] + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            note += '<note lang="' + array[index].attr['lang'] + '">';
        } else {
            note += '<note>';
        }

        note += array[index].val.trim();
        note += '</note>';
    }

    return note;
};