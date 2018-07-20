'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.targetAudience = function (array, index) {

    var targetAudience = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['displayLabel'] !== undefined) {
            targetAudience += '<targetAudience displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            targetAudience += '<targetAudience altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['authority'] !== undefined) {
            targetAudience += '<targetAudience authority="' + array[index].attr['authority'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            targetAudience += '<targetAudience altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            targetAudience += '<targetAudience shareable="' + array[index].attr['shareable'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            targetAudience += '<targetAudience lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else {
            targetAudience += '<targetAudience>';
        }

        targetAudience += xmlString.encode(array[index].val.trim());
        targetAudience += '</targetAudience>';
    }

    return targetAudience;
};