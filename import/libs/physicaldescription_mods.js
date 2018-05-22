'use strict';

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
        physicalDescription += '<physicalDescription lang="' + array[index].attr['lang'] + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        physicalDescription += '<physicalDescription displayLabel="' + array[index].attr['displayLabel'] + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        physicalDescription += '<physicalDescription altRepGroup="' + array[index].attr['altRepGroup'] + '">';
    } else {
        physicalDescription += '<physicalDescription>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'form') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['type'] !== undefined) {
                    physicalDescription += '<form type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    physicalDescription += '<form authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<form lang="' + array[index].attr['lang'] + '">';
                }
                else {
                    physicalDescription += '<form>';
                }

                physicalDescription += array[index].val.trim();
                physicalDescription += '</form>';
            }
        }

        if (array[index].name === 'reformattingQuality') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {
                physicalDescription += '<reformattingQuality>';
                physicalDescription += array[index].val.trim();
                physicalDescription += '</reformattingQuality>';
            }
        }

        if (array[index].name === 'internetMediaType') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<internetMediaType lang="' + array[index].attr['lang'] + '">';
                }
                else {
                    physicalDescription += '<internetMediaType>';
                }

                physicalDescription += array[index].val.trim();
                physicalDescription += '</internetMediaType>';
            }

        }

        if (array[index].name === 'extent') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['supplied'] !== undefined) {
                    physicalDescription += '<extent supplied="' + array[index].attr['supplied'] + '">';
                } else if (array[index].attr['unit'] !== undefined) {
                    physicalDescription += '<extent unit="' + array[index].attr['unit'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<extent lang="' + array[index].attr['lang'] + '">';
                } else {
                    physicalDescription += '<extent>';
                }

                physicalDescription += array[index].val.trim();
                physicalDescription += '</extent>';
            }
        }

        if (array[index].name === 'digitalOrigin') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {
                physicalDescription += '<digitalOrigin>';
                physicalDescription += array[index].val.trim();
                physicalDescription += '</digitalOrigin>';
            }
        }

        if (array[index].name === 'note') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['typeURI'] !== undefined) {
                    physicalDescription += '<note typeURI="' + array[index].attr['typeURI'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    physicalDescription += '<note lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    physicalDescription += '<note displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    physicalDescription += '<note type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['ID'] !== undefined) {
                    physicalDescription += '<note ID="' + array[index].attr['ID'] + '">';
                }
                else {
                    physicalDescription += '<note>';
                }

                physicalDescription += array[index].val.trim();
                physicalDescription += '</note>';
            }
        }
    });

    physicalDescription += '</physicalDescription>';

    return physicalDescription;
};