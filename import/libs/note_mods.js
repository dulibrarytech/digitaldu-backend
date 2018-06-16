'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.note = function (array, index) {

    var note = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['displayLabel'] !== undefined) {
            note += '<note displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['ID'] !== undefined) {
            note += '<note ID="' + array[index].attr['ID'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            note += '<note altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['typeURI'] !== undefined) {
            note += '<note typeURI="' + array[index].attr['typeURI'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            note += '<note lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['type'] !== undefined) {
            note += '<note type="' + array[index].attr['type'].toLowerCase() + '">';
        } else {
            note += '<note>';
        }

        note += xmlString.encode(array[index].val.trim());

        note += '</note>';
    }

    return note;
};