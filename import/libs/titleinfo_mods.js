'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.titleInfo = function (array, index) {

    var titleInfo = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return titleInfo;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return titleInfo;
    }

    if (array[index].children[1].val === undefined) {
        return titleInfo;
    }

    if (array[index].attr['ID'] !== undefined) {
        titleInfo += '<titleInfo ID="' + array[index].attr['ID'].toLowerCase() + '">';
    } else if (array[index].attr['type'] !== undefined) {
        titleInfo += '<titleInfo type="' + array[index].attr['type'].toLowerCase() + '">';
    } else if (array[index].attr['otherType'] !== undefined) {
        titleInfo += '<titleInfo otherType="' + array[index].attr['otherType'].toLowerCase() + '">';
    } else if (array[index].attr['authority'] !== undefined) {
        titleInfo += '<titleInfo authority="' + array[index].attr['authority'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        titleInfo += '<titleInfo displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['supplied'] !== undefined) {
        titleInfo += '<titleInfo supplied="' + array[index].attr['supplied'].toLowerCase() + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        titleInfo += '<titleInfo usage="' + array[index].attr['usage'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        titleInfo += '<titleInfo altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else if (array[index].attr['nameTitleGroup'] !== undefined) {
        titleInfo += '<titleInfo nameTitleGroup="' + array[index].attr['nameTitleGroup'].toLowerCase() + '">';
    } else if (array[index].attr['altFormat'] !== undefined) {
        titleInfo += '<titleInfo altFormat="' + array[index].attr['altFormat'].toLowerCase() + '">';
    } else if (array[index].attr['altContent'] !== undefined) {
        titleInfo += '<titleInfo altContent="' + array[index].attr['altContent'].toLowerCase() + '">';
    } else {
        titleInfo += '<titleInfo>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'title') {

            if (array[index].val.length !== 0) {

                titleInfo += '<title>' + xmlString.encode(array[index].val.trim()) + '</title>';
            }
        }

        if (array[index].name === 'subTitle') {
            if (array[index].val.length !== 0) {
                titleInfo += '<subTitle>' + xmlString.encode(array[index].val.trim()) + '</subTitle>';
            }
        }

        if (array[index].name === 'partNumber') {
            if (array[index].val.length !== 0) {
                titleInfo += '<partNumber>' + xmlString.encode(array[index].val.trim()) + '</partNumber>';
            }
        }

        if (array[index].name === 'partName') {
            if (array[index].val.length !== 0) {
                titleInfo += '<partName>' + xmlString.encode(array[index].val.trim()) + '</partName>';
            }
        }

        if (array[index].name === 'nonSort') {
            if (array[index].val.length !== 0) {
                titleInfo += '<nonSort>' + xmlString.encode(array[index].val.trim()) + '</nonSort>';
            }
        }
    });

    titleInfo += '</titleInfo>';

    return titleInfo;
};