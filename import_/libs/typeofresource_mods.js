'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.typeOfResource = function (array, index) {

    var typeOfResource = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['collection'] !== undefined) {
            typeOfResource += '<typeOfResource collection="' + array[index].attr['collection'].toLowerCase() + '">';
        } else if (array[index].attr['manuscript'] !== undefined) {
            typeOfResource += '<typeOfResource manuscript="' + array[index].attr['manuscript'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            typeOfResource += '<typeOfResource displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            typeOfResource += '<typeOfResource usage="' + array[index].attr['usage'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            typeOfResource += '<typeOfResource altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else {
            typeOfResource += '<typeOfResource>';
        }

        if (array[index].val.trim() === 'still_image') {
            typeOfResource += 'still image';
        } else {
            typeOfResource += xmlString.encode(array[index].val.trim().toLowerCase());
        }

        typeOfResource += '</typeOfResource>';
    }

    return typeOfResource;
};