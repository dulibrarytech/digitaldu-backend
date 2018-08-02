'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.genre = function (array, index) {

    var genre = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        // check for element attributes
        if (array[index].attr['authority'] !== undefined) {
            genre += '<genre authority="' + array[index].attr['authority'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            genre += '<genre lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['type'] !== undefined) {
            genre += '<genre type="' + array[index].attr['type'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            genre += '<genre displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            genre += '<genre usage="' + array[index].attr['usage'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            genre += '<genre altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else {
            genre += '<genre>';
        }

        genre += xmlString.encode(array[index].val.trim());
        genre += '</genre>';
    }

    return genre;
};