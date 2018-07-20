'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.recordInfo = function (array, index) {

    var recordInfo = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return recordInfo;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return recordInfo;
    }

    if (array[index].children[1].val == undefined) {
        return recordInfo;
    }

    // check for element attributes
    if (array[index].attr['	lang'] !== undefined) {
        recordInfo += '<recordInfo lang="' + array[index].attr['lang'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        recordInfo += '<recordInfo displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        recordInfo += '<recordInfo altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else if (array[index].attr['eventType'] !== undefined) {
        recordInfo += '<recordInfo eventType="' + array[index].attr['eventType'].toLowerCase() + '">';
    } else {
        recordInfo += '<recordInfo>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'languageOfCataloging') {

            array[index].eachChild(function (child, index, array) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    if (array[index].name === 'languageTerm' && array[index].val.length > 0) {

                        // check for element attributes
                        if (array[index].attr['supplied'] !== undefined) {
                            recordInfo += '<languageOfCataloging supplied="' + array[index].attr['supplied'].toLowerCase() + '">';
                        } else {
                            recordInfo += '<languageOfCataloging>';
                        }

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            recordInfo += '<languageTerm type="' + array[index].attr['type'].toLowerCase() + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            recordInfo += '<languageTerm authority="' + array[index].attr['authority'].toLowerCase() + '">';
                        } else {
                            recordInfo += '<languageTerm>';
                        }

                        recordInfo += xmlString.encode(array[index].val.trim());
                        recordInfo += '</languageTerm>';
                        recordInfo += '</languageOfCataloging>';

                    }

                    if (array[index].name === 'scriptTerm' && array[index].val.length > 0) {

                        // check for element attributes
                        if (array[index].attr['supplied'] !== undefined) {
                            recordInfo += '<languageOfCataloging supplied="' + array[index].attr['supplied'].toLowerCase() + '">';
                        } else {
                            recordInfo += '<languageOfCataloging>';
                        }

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            recordInfo += '<scriptTerm type="' + array[index].attr['type'].toLowerCase() + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            recordInfo += '<scriptTerm authority="' + array[index].attr['authority'].toLowerCase() + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            recordInfo += '<scriptTerm authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            recordInfo += '<scriptTerm valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            recordInfo += '<scriptTerm lang="' + array[index].attr['lang'].toLowerCase() + '">';
                        } else if (array[index].attr['xml:lang'] !== undefined) {
                            recordInfo += '<scriptTerm xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                        } else if (array[index].attr['script'] !== undefined) {
                            recordInfo += '<scriptTerm script="' + array[index].attr['script'].toLowerCase() + '">';
                        } else if (array[index].attr['transliteration'] !== undefined) {
                            recordInfo += '<scriptTerm transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                        } else {
                            recordInfo += '<scriptTerm>';
                        }

                        recordInfo += xmlString.encode(array[index].val.trim());
                        recordInfo += '</scriptTerm>';
                        recordInfo += '</languageOfCataloging>';

                    }
                }
            });
        }

        if (array[index].name === 'recordContentSource' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['authorityURI'] !== undefined) {
                    recordInfo += '<recordContentSource authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                } else if (array[index].attr['valueURI'] !== undefined) {
                    recordInfo += '<recordContentSource valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordContentSource lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    recordInfo += '<recordContentSource xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    recordInfo += '<recordContentSource script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    recordInfo += '<recordContentSource transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    recordInfo += '<recordContentSource>';
                }

                recordInfo += xmlString.encode(array[index].val.trim());
                recordInfo += '</recordContentSource>';
            }
        }

        if (array[index].name === 'recordCreationDate' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    recordInfo += '<recordCreationDate encoding="' + array[index].attr['encoding'].toLowerCase() + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    recordInfo += '<recordCreationDate point="' + array[index].attr['point'].toLowerCase() + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    recordInfo += '<recordCreationDate keyDate="' + array[index].attr['keyDate'].toLowerCase() + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    recordInfo += '<dateIssued qualifier="' + array[index].attr['qualifier'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordCreationDate lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    recordInfo += '<recordCreationDate xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    recordInfo += '<recordCreationDate script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    recordInfo += '<recordCreationDate transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    recordInfo += '<recordCreationDate>';
                }

                recordInfo += xmlString.encode(array[index].val.trim());
                recordInfo += '</recordCreationDate>';
            }
        }

        if (array[index].name === 'recordChangeDate' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    recordInfo += '<recordChangeDate encoding="' + array[index].attr['encoding'].toLowerCase() + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    recordInfo += '<drecordChangeDate point="' + array[index].attr['point'].toLowerCase() + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    recordInfo += '<recordChangeDate keyDate="' + array[index].attr['keyDate'].toLowerCase() + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    recordInfo += '<recordChangeDate qualifier="' + array[index].attr['qualifier'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordChangeDate lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    recordInfo += '<recordChangeDate xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    recordInfo += '<recordChangeDate script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    recordInfo += '<recordChangeDate transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    recordInfo += '<recordChangeDate>';
                }

                recordInfo += xmlString.encode(array[index].val.trim());
                recordInfo += '</recordChangeDate>';
            }
        }

        if (array[index].name === 'recordIdentifier' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['source'] !== undefined) {
                    recordInfo += '<recordIdentifier source="' + array[index].attr['source'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordIdentifier lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    recordInfo += '<recordIdentifier xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    recordInfo += '<recordIdentifier script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordIdentifier transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    recordInfo += '<recordIdentifier>';
                }

                recordInfo += xmlString.encode(array[index].val.trim());
                recordInfo += '</recordIdentifier>';
            }
        }

        if (array[index].name === 'recordOrigin' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    recordInfo += '<recordOrigin lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['xml:lang'] !== undefined) {
                    recordInfo += '<recordOrigin xml:lang="' + array[index].attr['xml:lang'].toLowerCase() + '">';
                } else if (array[index].attr['script'] !== undefined) {
                    recordInfo += '<recordOrigin script="' + array[index].attr['script'].toLowerCase() + '">';
                } else if (array[index].attr['transliteration'] !== undefined) {
                    recordInfo += '<recordOrigin transliteration="' + array[index].attr['transliteration'].toLowerCase() + '">';
                } else {
                    recordInfo += '<recordOrigin>';
                }

                recordInfo += xmlString.encode(array[index].val.trim());
                recordInfo += '</recordOrigin>';
            }
        }
    });

    recordInfo += '</recordInfo>';

    return recordInfo;
};