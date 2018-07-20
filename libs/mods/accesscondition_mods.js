'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.accessCondition = function (array, index) {

    var accessCondition = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['lang'] !== undefined) {
            accessCondition += '<accessCondition lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['type'] !== undefined) {
            accessCondition += '<accessCondition type="' + array[index].attr['type'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            accessCondition += '<accessCondition displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['invalid'] !== undefined) {
            accessCondition += '<accessCondition altFormat="' + array[index].attr['altFormat'].toLowerCase() + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            accessCondition += '<accessCondition altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else {
            accessCondition += '<accessCondition>';
        }

        accessCondition += xmlString.encode(array[index].val.trim());
        accessCondition += '</accessCondition>';
    }

    return accessCondition;
};