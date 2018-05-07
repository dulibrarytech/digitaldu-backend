'use strict';

exports.language = function (array, index) {

    if (array[index].val !== undefined && array[index].val.length !== 0) {

        var language = '';

        if (array[index].attr['objectPart'] !== undefined) {
            language += '<language objectPart="' + array[index].attr['objectPart'] + '">';
        } else if (array[index].attr['lang'] !== undefined) {
            language += '<language lang="' + array[index].attr['lang'] + '">';
        } else if (array[index].attr['displayLabel'] !== undefined) {
            language += '<language displayLabel="' + array[index].attr['displayLabel'] + '">';
        } else if (array[index].attr['usage'] !== undefined) {
            language += '<language usage="' + array[index].attr['usage'] + '">';
        } else if (array[index].attr['altRepGroup'] !== undefined) {
            language += '<language altRepGroup="' + array[index].attr['altRepGroup'] + '">';
        } else {
            language += '<language>';
        }

        array[index].eachChild(function (child, index, array) {

            if (array[index].name === 'languageTerm') {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    // check for element attributes
                    if (array[index].attr['type'] !== undefined) {
                        language += '<languageTerm type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        language += '<languageTerm authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        language += '<languageTerm lang="' + array[index].attr['lang'] + '">';
                    }
                    else {
                        language += '<languageTerm>';
                    }

                    language += array[index].val.trim();
                    language += '</languageTerm>';
                }
            }

            if (array[index].name === 'scriptTerm') {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    // check for element attributes
                    if (array[index].attr['type'] !== undefined) {
                        language += '<scriptTerm type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        language += '<scriptTerm authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        language += '<scriptTerm lang="' + array[index].attr['lang'] + '">';
                    }
                    else {
                        language += '<scriptTerm>';
                    }

                    language += array[index].val.trim();
                    language += '</scriptTerm>';
                }
            }
        });

        language += '</language>';

        return language;
    }
};