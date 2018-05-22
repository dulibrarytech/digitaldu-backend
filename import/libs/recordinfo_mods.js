'use strict';

exports.recordInfo = function (array, index) {

    var recordInfo = '';

    array[index].eachChild(function (child, index, array) {

        // TODO: test...

        if (array[index].name === 'recordContentSource') {

            if (array[index].attr['ID'] !== undefined) {
                part += '<recordInfo ID="' + array[index].attr['ID'] + '">';
            } else if (array[index].attr['type'] !== undefined) {
                part += '<recordInfo type="' + array[index].attr['type'] + '">';
            } else if (array[index].attr['order'] !== undefined) {
                part += '<recordInfo order="' + array[index].attr['order'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                part += '<recordInfo lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                part += '<recordInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                part += '<recordInfo altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                part += '<recordInfo>';
            }

            part += '<recordContentSource>';

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'number') {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<number lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<number>';
                    }

                    part += array[index].val.trim();
                    part += '</number>';
                }

                if (array[index].name === 'caption') {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<caption lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<caption>';
                    }

                    part += array[index].val.trim();
                    part += '</caption>';
                }

                if (array[index].name === 'title') {

                    if (array[index].attr['type'] !== undefined) {
                        part += '<title type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        part += '<title level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        part += '<title lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<title>';
                    }

                    part += array[index].val.trim();
                    part += '</title>';
                }
            });

            part += '</detail>';
            part += '</part>';
        }

        if (array[index].name === 'extent') {

            if (array[index].attr['ID'] !== undefined) {
                part += '<part ID="' + array[index].attr['ID'] + '">';
            } else if (array[index].attr['type'] !== undefined) {
                part += '<part type="' + array[index].attr['type'] + '">';
            } else if (array[index].attr['order'] !== undefined) {
                part += '<part order="' + array[index].attr['order'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                part += '<part lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                part += '<part displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                part += '<part altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                part += '<part>';
            }

            part += '<extent>';

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'start') {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<start lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<start>';
                    }

                    part += array[index].val.trim();
                    part += '</start>';
                }

                if (array[index].name === 'end') {

                    if (array[index].attr['lang'] !== undefined) {
                        part += '<end lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<end>';
                    }

                    part += array[index].val.trim();
                    part += '</end>';
                }

                if (array[index].name === 'total') {

                    part += '<total>';
                    part += array[index].val.trim();
                    part += '</total>';
                }

                if (array[index].name === 'list') {

                    if (array[index].attr['type'] !== undefined) {
                        part += '<list type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        part += '<list level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        part += '<list lang="' + array[index].attr['lang'] + '">';
                    } else {
                        part += '<list>';
                    }

                    part += array[index].val.trim();
                    part += '</list>';
                }
            });

            part += '</extent>';
            part += '</part>';
        }

        if (array[index].name === 'date') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<part lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<part authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<part displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<part altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    location += '<part>';
                }

                // check for element attributes
                if (array[index].attr['encoding'] !== undefined) {
                    location += '<date encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    location += '<date point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['qualifier '] !== undefined) {
                    location += '<date qualifier ="' + array[index].attr['qualifier '] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<date lang="' + array[index].attr['lang'] + '">';
                } else {
                    location += '<date>';
                }

                location += array[index].val.trim();
                location += '</date>';
                location += '</part>';
            }
        }

        if (array[index].name === 'text') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<location lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<location authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<location displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<location altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    location += '<location>';
                }

                // check for element attributes
                if (array[index].attr['type'] !== undefined) {
                    location += '<text type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<text displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<text lang="' + array[index].attr['lang'] + '">';
                } else {
                    location += '<text>';
                }

                location += array[index].val.trim();
                location += '</text>';

                location += '</location>';
            }
        }
    });

    return recordInfo;
};