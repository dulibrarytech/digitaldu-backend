'use strict';

exports.location = function (array, index) {

    var location = '';

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'physicalLocation') {

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

                if (array[index].attr['authority'] !== undefined) {
                    location += '<physicalLocation authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['authorityURI'] !== undefined) {
                    location += '<physicalLocation authorityURI="' + array[index].attr['authorityURI'] + '">';
                } else if (array[index].attr['valueURI'] !== undefined) {
                    location += '<physicalLocation valueURI="' + array[index].attr['valueURI'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<physicalLocation type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    location += '<physicalLocation lang="' + array[index].attr['lang'] + '">';
                } else {
                    location += '<physicalLocation>';
                }

                location += array[index].val.trim();
                location += '</physicalLocation>';
                location += '</location>';
            }
        }

        if (array[index].name === 'shelfLocator') {

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
                if (array[index].attr['authority'] !== undefined) {
                    location += '<shelfLocator authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['authorityURI'] !== undefined) {
                    location += '<shelfLocator authorityURI="' + array[index].attr['authorityURI'] + '">';
                } else if (array[index].attr['valueURI'] !== undefined) {
                    location += '<shelfLocator valueURI="' + array[index].attr['valueURI'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    location += '<shelfLocator lang="' + array[index].attr['lang'] + '">';
                } else {
                    location += '<shelfLocator>';
                }

                location += array[index].val.trim();
                location += '</shelfLocator>';

                location += '</location>';
            }
        }

        if (array[index].name === 'url') {

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
                if (array[index].attr['dateLastAccessed'] !== undefined) {
                    location += '<url dateLastAccessed="' + array[index].attr['dateLastAccessed'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    location += '<url displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['note'] !== undefined) {
                    location += '<url note="' + array[index].attr['note'] + '">';
                } else if (array[index].attr['access'] !== undefined) {
                    location += '<url access="' + array[index].attr['access'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    location += '<url usage="' + array[index].attr['usage'] + '">';
                } else {
                    location += '<url>';
                }

                location += array[index].val.trim();
                location += '</url>';
                location += '</location>';
            }
        }

        if (array[index].name === 'holdingSimple') {

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

            location += '<holdingSimple>';

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'copyInformation') {

                    location += '<copyInformation>';

                    array[index].eachChild(function (child, index, array) {

                        if (array[index].name === 'form') {

                            if (array[index].attr['authority'] !== undefined) {
                                location += '<form authority="' + array[index].attr['authority'] + '">';
                            } else if (array[index].attr['type'] !== undefined) {
                                location += '<form type="' + array[index].attr['type'] + '">';
                            } else if (array[index].attr['authorityURI'] !== undefined) {
                                location += '<form type="' + array[index].attr['authorityURI'] + '">';
                            } else if (array[index].attr['valueURI'] !== undefined) {
                                location += '<form valueURI="' + array[index].attr['valueURI'] + '">';
                            } else if (array[index].attr['ID'] !== undefined) {
                                location += '<form ID="' + array[index].attr['ID'] + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<form lang="' + array[index].attr['lang'] + '">';
                            } else {
                                location += '<form>';
                            }

                            location += array[index].val.trim();
                            location += '</form>';
                        }

                        if (array[index].name === 'subLocation') {

                            if (array[index].attr['lang'] !== undefined) {
                                location += '<subLocation lang="' + array[index].attr['lang'] + '">';
                            }

                            location += array[index].val.trim();
                            location += '</subLocation>';
                        }

                        if (array[index].name === 'itemIdentifier') {

                            if (array[index].attr['type'] !== undefined) {
                                location += '<itemIdentifier type="' + array[index].attr['type'] + '">';
                            }

                            location += array[index].val.trim();
                            location += '</itemIdentifier>';
                        }

                        if (array[index].name === 'electronicLocator') {

                            location += '<electronicLocator>';
                            location += array[index].val.trim();
                            location += '</electronicLocator>';
                        }

                        if (array[index].name === 'note') {

                            if (array[index].attr['ID'] !== undefined) {
                                location += '<note ID="' + array[index].attr['ID'] + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<note lang="' + array[index].attr['lang'] + '">';
                            } else if (array[index].attr['displayLabel'] !== undefined) {
                                location += '<note displayLabel="' + array[index].attr['displayLabel'] + '">';
                            } else if (array[index].attr['type'] !== undefined) {
                                location += '<note type="' + array[index].attr['type'] + '">';
                            } else {
                                location += '<note>';
                            }

                            location += array[index].val.trim();
                            location += '</note>';
                        }

                        if (array[index].name === 'enumerationAndChronology') {

                            if (array[index].attr['unitType'] !== undefined) {
                                location += '<enumerationAndChronology unitType="' + array[index].attr['unitType'] + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                location += '<enumerationAndChronology lang="' + array[index].attr['lang'] + '">';
                            } else {
                                location += '<enumerationAndChronology>';
                            }

                            location += array[index].val.trim();
                            location += '</enumerationAndChronology>';
                        }
                    });

                    location += '</copyInformation>';
                }
            });

            location += '</holdingSimple>';
            location += '</location>';
        }

        if (array[index].name === 'holdingExternal') {

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

                location += '<holdingExternal>';
                location += array[index].val.trim();
                location += '</holdingExternal>';
                location += '</location>';
            }
        }
    });

    return location;
};