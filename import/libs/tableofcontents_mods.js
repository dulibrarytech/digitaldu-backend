'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.tableOfContents = function (array, index) {

    var tableOfContents = '';

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['type'] !== undefined) {
            tableOfContents += '<tableOfContents type="' + array[index].attr['type'].toLowerCase() + '">';
        } else if (array[index].attr['altFormat'] !== undefined) {
            tableOfContents += '<tableOfContents altFormat="' + array[index].attr['altFormat'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            tableOfContents += '<tableOfContents displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['altContent'] !== undefined) {
            tableOfContents += '<tableOfContents altContent="' + array[index].attr['altContent'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            tableOfContents += '<tableOfContents altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else if (array[index].attr['shareable'] !== undefined) {
            tableOfContents += '<tableOfContents shareable="' + array[index].attr['shareable'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            tableOfContents += '<tableOfContents lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['xlink:href'] !== undefined) {
            tableOfContents += '<tableOfContents xlink:href="' + array[index].attr['xlink:href'].toLowerCase() + '">';
        } else {
            tableOfContents += '<tableOfContents>';
        }

        tableOfContents += xmlString.encode(array[index].val.trim());
        tableOfContents += '</tableOfContents>';
    }

    return tableOfContents;
};