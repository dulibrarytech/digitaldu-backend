'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.language = function (array, index) {

    var language = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return language;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return language;
    }

    if (array[index].children[1].val == undefined) {
        return language;
    }

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        if (array[index].attr['objectPart'] !== undefined) {
            language += '<language objectPart="' + array[index].attr['objectPart'].toLowerCase() + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            language += '<language lang="' + array[index].attr['lang'].toLowerCase() + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            language += '<language displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            language += '<language usage="' + array[index].attr['usage'].toLowerCase() + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            language += '<language altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
        } else {
            language += '<language>';
        }

        array[index].eachChild(function (child, index, array) {

            if (array[index].name === 'languageTerm' && array[index].val.length > 0) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    // check for element attributes
                    if (array[index].attr['type'] !== undefined) {
                        language += '<languageTerm type="' + array[index].attr['type'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        language += '<languageTerm authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        language += '<languageTerm lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    }
                    else {
                        language += '<languageTerm>';
                    }

                    language += xmlString.encode(array[index].val.trim());
                    language += '</languageTerm>';
                }
            }

            if (array[index].name === 'scriptTerm' && array[index].val.length > 0) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    // check for element attributes
                    if (array[index].attr['type'] !== undefined) {
                        language += '<scriptTerm type="' + array[index].attr['type'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        language += '<scriptTerm authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        language += '<scriptTerm lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    }
                    else {
                        language += '<scriptTerm>';
                    }

                    language += xmlString.encode(array[index].val.trim());
                    language += '</scriptTerm>';
                }
            }
        });

        language += '</language>';
    }

    return language;
};