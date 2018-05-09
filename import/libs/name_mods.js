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

        if (array[index].name === 'nameIdentifier') {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<nameIdentifier type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<nameIdentifier lang="' + array[index].attr['lang'] + '">';
                } else {
                    name += '<nameIdentifier>';
                }

                name += array[index].val.trim();
                name += '</nameIdentifier>';
            }
        }

        if (array[index].name === 'displayForm') {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<displayForm type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<displayForm lang="' + array[index].attr['lang'] + '">';
                } else {
                    name += '<displayForm>';
                }

                name += array[index].val.trim();
                name += '</displayForm>';
            }
        }

        if (array[index].name === 'affiliation') {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<affiliation type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<affiliation lang="' + array[index].attr['lang'] + '">';
                } else {
                    name += '<affiliation>';
                }

                name += array[index].val.trim();
                name += '</affiliation>';
            }
        }

        if (array[index].name === 'description') {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<description type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<description lang="' + array[index].attr['lang'] + '">';
                } else {
                    name += '<description>';
                }

                name += array[index].val.trim();
                name += '</description>';
            }
        }

        if (array[index].name === 'etal') {

            if (array[index].val.length !== 0) {
                name += '<etal>';
                name += array[index].val.trim();
                name += '</etal>';
            }
        }

    });

    name += '</name>';

    return name;
};