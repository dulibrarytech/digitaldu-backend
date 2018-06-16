'use strict';

var xmlString = require('../../import/libs/xmlEncode');

exports.location = function (array, index) {

    var location = '';

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'physicalLocation' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<location lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<location authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<location displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<location altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
                } else {
                    location += '<location>';
                }

                if (array[index].attr['authority'] !== undefined) {
                    location += '<physicalLocation authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['authorityURI'] !== undefined) {
                    location += '<physicalLocation authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                } else if (array[index].attr['valueURI'] !== undefined) {
                    location += '<physicalLocation valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<physicalLocation type="' + array[index].attr['type'].toLowerCase() + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    location += '<physicalLocation lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    location += '<physicalLocation>';
                }

                location += xmlString.encode(array[index].val.trim());
                location += '</physicalLocation>';
                location += '</location>';
            }
        }

        if (array[index].name === 'shelfLocator' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<location lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<location authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<location displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<location altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
                } else {
                    location += '<location>';
                }

                // check for element attributes
                if (array[index].attr['authority'] !== undefined) {
                    location += '<shelfLocator authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['authorityURI'] !== undefined) {
                    location += '<shelfLocator authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                } else if (array[index].attr['valueURI'] !== undefined) {
                    location += '<shelfLocator valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<shelfLocator lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else {
                    location += '<shelfLocator>';
                }

                location += xmlString.encode(array[index].val.trim());
                location += '</shelfLocator>';

                location += '</location>';
            }
        }

        if (array[index].name === 'url' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<location lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<location authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<location displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<location altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
                } else {
                    location += '<location>';
                }

                // check for element attributes
                if (array[index].attr['dateLastAccessed'] !== undefined) {
                    location += '<url dateLastAccessed="' + array[index].attr['dateLastAccessed'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<url displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['note'] !== undefined) {
                    location += '<url note="' + array[index].attr['note'].toLowerCase() + '">';
                } else if (array[index].attr['access'] !== undefined) {
                    location += '<url access="' + array[index].attr['access'].toLowerCase() + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    location += '<url usage="' + array[index].attr['usage'].toLowerCase() + '">';
                } else {
                    location += '<url>';
                }

                location += xmlString.encode(array[index].val.trim());
                location += '</url>';
                location += '</location>';
            }
        }

        if (array[index].name === 'holdingSimple' && array[index].val.length > 0) {

            if (array[index].attr['lang'] !== undefined) {
                location += '<location lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else if (array[index].attr['authority'] !== undefined) {
                location += '<location authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                location += '<location displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                location += '<location altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
            } else {
                location += '<location>';
            }

            location += '<holdingSimple>';

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'copyInformation' && array[index].val.length > 0) {

                    location += '<copyInformation>';

                    array[index].eachChild(function (child, index, array) {

                        if (array[index].name === 'form') {

                            if (array[index].attr['authority'] !== undefined) {
                                location += '<form authority="' + array[index].attr['authority'].toLowerCase() + '">';
                            } else if (array[index].attr['type'] !== undefined) {
                                location += '<form type="' + array[index].attr['type'].toLowerCase() + '">';
                            } else if (array[index].attr['authorityURI'] !== undefined) {
                                location += '<form type="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                            } else if (array[index].attr['valueURI'] !== undefined) {
                                location += '<form valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                            } else if (array[index].attr['ID'] !== undefined) {
                                location += '<form ID="' + array[index].attr['ID'].toLowerCase() + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<form lang="' + array[index].attr['lang'].toLowerCase() + '">';
                            } else {
                                location += '<form>';
                            }

                            location += xmlString.encode(array[index].val.trim());
                            location += '</form>';
                        }

                        if (array[index].name === 'subLocation' && array[index].val.length > 0) {

                            if (array[index].attr['lang'] !== undefined) {
                                location += '<subLocation lang="' + array[index].attr['lang'].toLowerCase() + '">';
                            }

                            location += array[index].val.trim();
                            location += '</subLocation>';
                        }

                        if (array[index].name === 'itemIdentifier' && array[index].val.length > 0) {

                            if (array[index].attr['type'] !== undefined) {
                                location += '<itemIdentifier type="' + array[index].attr['type'].toLowerCase() + '">';
                            }

                            location += xmlString.encode(array[index].val.trim());
                            location += '</itemIdentifier>';
                        }

                        if (array[index].name === 'electronicLocator' && array[index].val.length > 0) {

                            location += '<electronicLocator>';
                            location += xmlString.encode(array[index].val.trim());
                            location += '</electronicLocator>';
                        }

                        if (array[index].name === 'note' && array[index].val.length > 0) {

                            if (array[index].attr['ID'] !== undefined) {
                                location += '<note ID="' + array[index].attr['ID'].toLowerCase() + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<note lang="' + array[index].attr['lang'].toLowerCase() + '">';
                            } else if (array[index].attr['displayLabel'] !== undefined) {
                                location += '<note displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                            } else if (array[index].attr['type'] !== undefined) {
                                location += '<note type="' + array[index].attr['type'].toLowerCase() + '">';
                            } else {
                                location += '<note>';
                            }

                            location += xmlString.encode(array[index].val.trim());
                            location += '</note>';
                        }

                        if (array[index].name === 'enumerationAndChronology' && array[index].val.length > 0) {

                            if (array[index].attr['unitType'] !== undefined) {
                                location += '<enumerationAndChronology unitType="' + array[index].attr['unitType'].toLowerCase() + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<enumerationAndChronology lang="' + array[index].attr['lang'].toLowerCase() + '">';
                            } else {
                                location += '<enumerationAndChronology>';
                            }

                            location += xmlString.encode(array[index].val.trim());
                            location += '</enumerationAndChronology>';
                        }
                    });

                    location += '</copyInformation>';
                }
            });

            location += '</holdingSimple>';
            location += '</location>';
        }

        if (array[index].name === 'holdingExternal' && array[index].val.length > 0) {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['lang'] !== undefined) {
                    location += '<location lang="' + array[index].attr['lang'].toLowerCase() + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    location += '<location authority="' + array[index].attr['authority'].toLowerCase() + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<location displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    location += '<location altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
                } else {
                    location += '<location>';
                }

                location += '<holdingExternal>';
                location += xmlString.encode(array[index].val.trim());
                location += '</holdingExternal>';
                location += '</location>';
            }
        }
    });

    return location;
};