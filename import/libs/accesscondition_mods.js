'use strict';

exports.accessCondition = function (array, index) {

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        var accessCondition = '';

        if (array[index].attr['lang'] !== undefined) {
            accessCondition += '<accessCondition lang="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['type'] !== undefined) {
            accessCondition += '<accessCondition type="' + array[index].attr['type'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            accessCondition += '<accessCondition displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['invalid'] !== undefined) {
            accessCondition += '<accessCondition altFormat="' + array[index].attr['altFormat'] + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            accessCondition += '<accessCondition altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else {
            accessCondition += '<accessCondition>';
        }

        accessCondition += array[index].val.trim();
        accessCondition += '</accessCondition>';

        return accessCondition;
    }
};