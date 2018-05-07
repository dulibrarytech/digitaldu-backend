'use strict';

exports.name = function (array, index) {

    var name = '';

    // check for element attributes
    if (array[index].attr['type'] !== undefined) {
        name += '<name type="' + array[index].attr['type'] + '">';
    } else if (array[index].attr['ID'] !== undefined) {
        name += '<name ID="' + array[index].attr['ID'] + '">';
    } else if (array[index].attr['authority'] !== undefined) {
        name += '<name authority="' + array[index].attr['authority'] + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        name += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        name += '<name usage="' + array[index].attr['usage'] + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        name += '<name altRepGroup="' + array[index].attr['altRepGroup'] + '">';
    } else if (array[index].attr['nameTitleGroup'] !== undefined) {
        name += '<name nameTitleGroup="' + array[index].attr['nameTitleGroup'] + '">';
    } else {
        name += '<name>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'namePart') {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<namePart type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<namePart lang="' + array[index].attr['lang'] + '">';
                } else {
                    name += '<namePart>';
                }

                name += array[index].val.trim();
                name += '</namePart>';
            }
        }

        if (array[index].name === 'role') {

            array[index].eachChild(function (child, index, array) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    name += '<role>';

                    // check for element attributes
                    if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {
                        name += '<roleTerm authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['authority'] == undefined && array[index].attr['type'] !== undefined) {
                        name += '<roleTerm type="' + array[index].attr['type'] + '">';
                    } else {
                        name += '<roleTerm>';
                    }

                    name += array[index].val.trim();
                    name += '</roleTerm>';
                    name += '</role>';
                }
            });
        }
    });

    name += '</name>';

    return name;
};