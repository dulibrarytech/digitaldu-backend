'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.physicalDescription = function (array, index) {

    var physicalDescription = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return physicalDescription;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return physicalDescription;
    }

    if (array[index].children[1].val == undefined) {
        return physicalDescription;
    }

    if (array[index].attr['lang'] !== undefined) {
        physicalDescription += '<physicalDescription lang="' + array[index].attr['lang'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        physicalDescription += '<physicalDescription displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        physicalDescription += '<physicalDescription altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else {
        physicalDescription += '<physicalDescription>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'form' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['type'] !== undefined) {
                    physicalDescription += '<form type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    physicalDescription += '<form authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<form lang="' + array[index].attr['lang'].toLowerCase() + '">';
                }
                else {
                    physicalDescription += '<form>';
                }

                physicalDescription += xmlString.encode(array[index].val.trim());
                physicalDescription += '</form>';
            }
        }

        if (array[index].name === 'reformattingQuality' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {
                physicalDescription += '<reformattingQuality>';
                physicalDescription += xmlString.encode(array[index].val.trim());
                physicalDescription += '</reformattingQuality>';
            }
        }

        if (array[index].name === 'internetMediaType' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<internetMediaType lang="' + array[index].attr['lang'].toLowerCase() + '">';
                }
                else {
                    physicalDescription += '<internetMediaType>';
                }

                physicalDescription += xmlString.encode(array[index].val.trim());
                physicalDescription += '</internetMediaType>';
            }

        }

        if (array[index].name === 'extent' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['supplied'] !== undefined) {
                    physicalDescription += '<extent supplied="' + array[index].attr['supplied'].toLowerCase() + '">';
                } else if (array[index].attr['unit'] !== undefined) {
                    physicalDescription += '<extent unit="' + array[index].attr['unit'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<extent lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    physicalDescription += '<extent>';
                }

                physicalDescription += xmlString.encode(array[index].val.trim());
                physicalDescription += '</extent>';
            }
        }

        if (array[index].name === 'digitalOrigin' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {
                physicalDescription += '<digitalOrigin>';
                physicalDescription += xmlString.encode(array[index].val.trim().toLowerCase());
                physicalDescription += '</digitalOrigin>';
            }
        }

        if (array[index].name === 'note' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['typeURI'] !== undefined) {
                    physicalDescription += '<note typeURI="' + array[index].attr['typeURI'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<note lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    physicalDescription += '<note displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    physicalDescription += '<note type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['ID'] !== undefined) {
                    physicalDescription += '<note ID="' + array[index].attr['ID'].toLowerCase() + '">';
                }
                else {
                    physicalDescription += '<note>';
                }

                physicalDescription += xmlString.encode(array[index].val.trim());
                physicalDescription += '</note>';
            }
        }
    });

    physicalDescription += '</physicalDescription>';

    return physicalDescription;
};