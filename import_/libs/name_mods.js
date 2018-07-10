'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.name = function (array, index) {

    var name = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return name;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return name;
    }

    if (array[index].children[1].val === undefined) {
        return name;
    }

    // check for element attributes
    if (array[index].attr['type'] !== undefined) {
        name += '<name type="' + array[index].attr['type'].toLowerCase() + '">';
    } else if (array[index].attr['ID'] !== undefined) {
        name += '<name ID="' + array[index].attr['ID'].toLowerCase() + '">';
    } else if (array[index].attr['authority'] !== undefined) {
        name += '<name authority="' + array[index].attr['authority'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        name += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        name += '<name usage="' + array[index].attr['usage'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        name += '<name altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else if (array[index].attr['nameTitleGroup'] !== undefined) {
        name += '<name nameTitleGroup="' + array[index].attr['nameTitleGroup'].toLowerCase() + '">';
    } else {
        name += '<name>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'namePart' && array[index].val.length > 0) {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<namePart type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<namePart lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    name += '<namePart>';
                }

                name += xmlString.encode(array[index].val.trim());
                name += '</namePart>';
            }
        }

        if (array[index].name === 'role' && array[index].val.length > 0) {

            array[index].eachChild(function (child, index, array) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    name += '<role>';

                    // check for element attributes
                    if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {
                        name += '<roleTerm authority="' + array[index].attr['authority'].toLowerCase() + '" type="' + array[index].attr['type'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] == undefined && array[index].attr['type'] !== undefined) {
                        name += '<roleTerm type="' + array[index].attr['type'].toLowerCase() + '">';
                    } else {
                        name += '<roleTerm>';
                    }

                    name += xmlString.encode(array[index].val.trim());
                    name += '</roleTerm>';
                    name += '</role>';
                }
            });
        }

        if (array[index].name === 'nameIdentifier' && array[index].val.length > 0) {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<nameIdentifier type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<nameIdentifier lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    name += '<nameIdentifier>';
                }

                name += xmlString.encode(array[index].val.trim());
                name += '</nameIdentifier>';
            }
        }

        if (array[index].name === 'displayForm' && array[index].val.length > 0) {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<displayForm type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<displayForm lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    name += '<displayForm>';
                }

                name += xmlString.encode(array[index].val.trim());
                name += '</displayForm>';
            }
        }

        if (array[index].name === 'affiliation' && array[index].val.length > 0) {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<affiliation type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<affiliation lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    name += '<affiliation>';
                }

                name += xmlString.encode(array[index].val.trim());
                name += '</affiliation>';
            }
        }

        if (array[index].name === 'description' && array[index].val.length > 0) {

            if (array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    name += '<description type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    name += '<description lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    name += '<description>';
                }

                name += xmlString.encode(array[index].val.trim());
                name += '</description>';
            }
        }

        if (array[index].name === 'etal') {

            if (array[index].val.length !== 0) {
                name += '<etal>';
                name += xmlString.encode(array[index].val.trim());
                name += '</etal>';
            }
        }

    });

    name += '</name>';

    return name;
};