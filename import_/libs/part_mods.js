'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.part = function (array, index) {

    var part = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return part;
    }

    if (array[index].children[1].name === undefined) {
        return part;
    }

    // checks detail subelements
    if (array[index].children[1].children[1].val !== 0) {
        return part;
    }

    if (array[index].attr['ID'] !== undefined) {
        part += '<part ID="' + array[index].attr['ID'].toLowerCase() + '">';
    } else if (array[index].attr['type'] !== undefined) {
        part += '<part type="' + array[index].attr['type'].toLowerCase() + '">';
    } else if (array[index].attr['order'] !== undefined) {
        part += '<part order="' + array[index].attr['order'].toLowerCase() + '">';
    } else if (array[index].attr['lang'] !== undefined) {
        part += '<part lang="' + array[index].attr['lang'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        part += '<part displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        part += '<part altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else {
        part += '<part>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'detail') {  // && array[index].val.length > 0

            part += '<detail>';

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'number' && array[index].val.length > 0) {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<number lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<number xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<number script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<number transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<number>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</number>';
                }

                if (array[index].name === 'caption' && array[index].val.length > 0) {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<caption lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<caption xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<caption script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<caption transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<caption>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</caption>';
                }

                if (array[index].name === 'title' && array[index].val.length > 0) {

                    if (array[index].attr['type'] !== undefined) {
                        part += '<title type="' + array[index].attr['type'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        part += '<title level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        part += '<title lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<title xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<title script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<title transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<title>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</title>';
                }
            });

            part += '</detail>';
        }

        if (array[index].name === 'extent' && array[index].val.length > 0) {

            if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
                return part;
            }

            if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
                return part;
            }

            if (array[index].children[1].val === undefined) {
                return part;
            }

            if (array[index].attr['unit'] !== undefined) {
                part += '<extent unit="' + array[index].attr['unit'].toLowerCase() + '">';
            } else {
                part += '<extent>';
            }

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'start' && array[index].val.length > 0) {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<start lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<start xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<start script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<start transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<start>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</start>';
                }

                if (array[index].name === 'end' && array[index].val.length > 0) {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<end lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<end xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<end script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<end transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<end>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</end>';
                }

                if (array[index].name === 'total') {

                    part += '<total>';
                    part += array[index].val.trim();
                    part += '</total>';
                }

                if (array[index].name === 'list' && array[index].val.length > 0) {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<list lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['xml:lang'] !== undefined) {
                        part += '<list xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                    } else if (array[index].attr['script'] !== undefined) {
                        part += '<list script="' + array[index].attr['script'].toLowerCase() + '">';
                    } else if (array[index].attr['transliteration'] !== undefined) {
                        part += '<list transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                    } else {
                        part += '<list>';
                    }

                    part += xmlString.encode(array[index].val.trim());
                    part += '</list>';
                }
            });

            part += '</extent>';
        }

        if (array[index].name === 'date' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                // check for element attributes
                if (array[index].attr['encoding'] !== undefined) {
                    part += '<date encoding="' + array[index].attr['encoding'].toLowerCase() + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    part += '<date point="' + array[index].attr['point'].toLowerCase() + '">';
                } else if (array[index].attr['qualifier '] !== undefined) {
                    part += '<date qualifier ="' + array[index].attr['qualifier '].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    part += '<date lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    part += '<date xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    part += '<date script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    part += '<date transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    part += '<date>';
                }

                part += xmlString.encode(array[index].val.trim());
                part += '</date>';
            }
        }

        if (array[index].name === 'text' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['xlink'] !== undefined) {
                    part += '<text xlink="' + array[index].attr['xlink'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    part += '<text lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    part += '<text xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    part += '<text transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    part += '<text script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    part += '<text displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    part += '<text type="' + array[index].attr['type'].toLowerCase() + '">';
                } else {
                    part += '<text>';
                }

                part += xmlString.encode(array[index].val.trim());
                part += '</text>';
            }
        }
    });

    part += '</part>';

    return part;
};