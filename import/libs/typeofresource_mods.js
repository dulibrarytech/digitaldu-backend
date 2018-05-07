'use strict';

exports.typeOfResource = function (array, index) {

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        var typeOfResource = '';

        if (array[index].attr['collection'] !== undefined) {
            typeOfResource += '<typeOfResource collection="' + array[index].attr['collection'] + '">';
        } else if (array[index].attr['manuscript'] !== undefined) {
            typeOfResource += '<typeOfResource manuscript="' + array[index].attr['manuscript'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            typeOfResource += '<typeOfResource displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            typeOfResource += '<typeOfResource usage="' + array[index].attr['usage'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            typeOfResource += '<typeOfResource altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else {
            typeOfResource += '<typeOfResource>';
        }

        typeOfResource += array[index].val.trim();
        typeOfResource += '</typeOfResource>';

        return typeOfResource;
    }
};