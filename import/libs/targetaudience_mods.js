'use strict';

exports.targetAudience = function (array, index) {

    var targetAudience = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['displayLabel'] !== undefined) {
            targetAudience += '<targetAudience displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            targetAudience += '<targetAudience altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['authority'] !== undefined) {
            targetAudience += '<targetAudience authority="' + array[index].attr['authority'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            targetAudience += '<targetAudience altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            targetAudience += '<targetAudience shareable="' + array[index].attr['shareable'] + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            targetAudience += '<targetAudience lang="' + array[index].attr['lang'] + '">';
        } else {
            targetAudience += '<targetAudience>';
        }

        targetAudience += array[index].val.trim();
        targetAudience += '</targetAudience>';
    }

    return targetAudience;
};