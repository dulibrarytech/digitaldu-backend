'use strict';

exports.tableOfContents = function (array, index) {

    var tableOfContents = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['type'] !== undefined) {
            tableOfContents += '<tableOfContents type="' + array[index].attr['type'] + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            tableOfContents += '<tableOfContents altFormat="' + array[index].attr['altFormat'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            tableOfContents += '<tableOfContents displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['altContent'] !== undefined) {
            tableOfContents += '<tableOfContents altContent="' + array[index].attr['altContent'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            tableOfContents += '<tableOfContents altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            tableOfContents += '<tableOfContents shareable="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            tableOfContents += '<tableOfContents lang="' + array[index].attr['lang'] + '">';
        } else {
            tableOfContents += '<tableOfContents>';
        }

        tableOfContents += array[index].val.trim();
        tableOfContents += '</tableOfContents>';
    }

    return tableOfContents;
};