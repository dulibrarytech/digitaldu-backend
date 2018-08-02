'use strict';

var xmlString = require('../../libs/mods/xmlEncode');

exports.subject = function (array, index) {

    var subject = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return subject;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return subject;
    }

    if (array[index].children[1].val === undefined) {
        return subject;
    }

    // check for subject attributes
    if (array[index].attr['authority'] !== undefined) {
        subject += '<subject authority="' + array[index].attr['authority'].toLowerCase() + '">';
    } else if (array[index].attr['authorityURI'] !== undefined) {
        subject += '<subject authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
    } else if (array[index].attr['valueURI'] !== undefined) {
        subject += '<subject valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        subject += '<subject displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        subject += '<subject usage="' + array[index].attr['usage'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else {
        subject += '<subject>';
    }

    // get subject sub element
    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'topic' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<topic authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<topic authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<topic valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<topic lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else {
                subject += '<topic>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</topic>';
        }

        if (array[index].name === 'geographic' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<geographic authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<geographic authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<geographic valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<geographic lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else {
                subject += '<geographic>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</geographic>';
        }

        if (array[index].name === 'temporal' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<temporal authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<temporal authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<temporal valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<temporal lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else if (array[index].attr['encoding'] !== undefined) {
                subject += '<temporal encoding="' + array[index].attr['encoding'].toLowerCase() + '">';
            } else if (array[index].attr['point'] !== undefined) {
                subject += '<temporal point="' + array[index].attr['point'].toLowerCase() + '">';
            } else if (array[index].attr['keyDate'] !== undefined) {
                subject += '<temporal keyDate="' + array[index].attr['keyDate'].toLowerCase() + '">';
            } else if (array[index].attr['qualifier'] !== undefined) {
                subject += '<temporal qualifier="' + array[index].attr['qualifier'].toLowerCase() + '">';
            } else {
                subject += '<temporal>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</temporal>';
        }

        if (array[index].name === 'geographicCode' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<geographicCode authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<geographicCode authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<geographicCode valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<geographicCode lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else {
                subject += '<geographicCode>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</geographicCode>';
        }

        if (array[index].name === 'genre' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<genre authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<genre authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<genre valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<genre lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else {
                subject += '<genre>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</genre>';
        }

        if (array[index].name === 'occupation' && array[index].val.length > 0) {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<occupation authority="' + array[index].attr['authority'].toLowerCase() + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<occupation authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<occupation valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<occupation lang="' + array[index].attr['lang'].toLowerCase() + '">';
            } else {
                subject += '<occupation>';
            }

            if (array[index].val.trim() !== undefined) {
                subject += xmlString.encode(array[index].val.trim());
            }

            subject += '</occupation>';
        }


        if (array[index].name === 'name') {

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<name authority="' + array[index].attr['authority'].toLowerCase() + '" type="' + array[index].attr['type'].toLowerCase() + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<name ID="' + array[index].attr['ID'].toLowerCase() + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<name type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<name authority="' + array[index].attr['authority'].toLowerCase() + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<name displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';

            } else {

                subject += '<name>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'namePart' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['type'] !== undefined) {
                        subject += '<namePart type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        subject += '<namePart lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<namePart>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</namePart>';
                }

                if (array[index].name === 'role') {

                    // get role sub elements
                    array[index].eachChild(function (child, index, array) {

                        subject += '<role>';

                        // get attributes
                        if (array[index].attr['type'] !== undefined && array[index].attr['authority'] !== undefined) {
                            subject += '<roleTerm authority="' + array[index].attr['authority'].toLowerCase() + '" type="' + array[index].attr['type'].toLowerCase() + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<roleTerm type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<roleTerm authority="' + array[index].attr['authority'].toLowerCase() + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<roleTerm authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<roleTerm valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<roleTerm lang="' + array[index].attr['lang'].toLowerCase() + '">';
                        } else {
                            subject += '<roleTerm>';
                        }

                        if (array[index].val.trim() !== undefined) {
                            subject += xmlString.encode(array[index].val.trim());
                        }

                        subject += '</roleTerm>';
                        subject += '</role>';
                    });

                }

                if (array[index].name === 'displayForm') {

                    subject += '<displayForm>';

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</displayForm>';
                }

                if (array[index].name === 'affiliation') {

                    // get affiliation sub elements
                    array[index].eachChild(function (child, index, array) {

                        if (array[index].attr['lang'] !== undefined) {
                            subject += '<affiliation lang="' + array[index].attr['lang'].toLowerCase() + '">';
                        } else {
                            subject += '<affiliation>';
                        }

                        if (array[index].val.trim() !== undefined) {
                            subject += xmlString.encode(array[index].val.trim());
                        }

                        subject += '</affiliation>';
                    });
                }

                if (array[index].name === 'description') {

                    // get affiliation sub elements
                    array[index].eachChild(function (child, index, array) {

                        if (array[index].attr['lang'] !== undefined) {
                            subject += '<description lang="' + array[index].attr['lang'].toLowerCase() + '">';
                        } else {
                            subject += '<description>';
                        }

                        if (array[index].val.trim() !== undefined) {
                            subject += xmlString.encode(array[index].val.trim());
                        }

                        subject += '</description>';
                    });
                }
            });

            subject += '</name>';
        }

        if (array[index].name === 'titleInfo') {

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<titleInfo authority="' + array[index].attr['authority'].toLowerCase() + '" type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<titleInfo ID="' + array[index].attr['ID'].toLowerCase() + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<titleInfo type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<titleInfo authority="' + array[index].attr['authority'].toLowerCase() + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';

            } else {

                subject += '<titleInfo>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'title' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<title lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<title>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</title>';
                }

                if (array[index].name === 'subTitle') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<subTitle lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<subTitle>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</subTitle>';
                }

                if (array[index].name === 'partNumber') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<partNumber lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<partNumber>';
                    }

                    subject += xmlString.encode(array[index].val.trim());
                    subject += '</partNumber>';
                }

                if (array[index].name === 'partName') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<partName lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<partName>';
                    }

                    subject += xmlString.encode(array[index].val.trim());
                    subject += '</partName>';
                }

                if (array[index].name === 'nonSort') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<nonSort lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else {
                        subject += '<nonSort>';
                    }

                    subject += xmlString.encode(array[index].val.trim());
                    subject += '</nonSort>';
                }
            });

            subject += '</titleInfo>';
        }

        if (array[index].name === 'hierarchicalGeographic') {

            console.log('hierarchicalGeographic');
            console.log(array[index]);

            if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
                return subject;
            }

            if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
                return subject;
            }

            if (array[index].children[1].val === undefined) {
                return subject;
            }

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'].toLowerCase() + '" type="' + array[index].attr['type'].toLowerCase() + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<hierarchicalGeographic ID="' + array[index].attr['ID'].toLowerCase() + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<hierarchicalGeographic type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'].toLowerCase() + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<hierarchicalGeographic displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';

            } else {

                subject += '<hierarchicalGeographic>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'continent' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<continent lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<continent level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<continent period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<continent authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<continent authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<continent valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<continent>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</continent>';
                }

                if (array[index].name === 'country' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<country lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<country level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<country period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<country authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<country authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<country valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<country>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</country>';
                }

                if (array[index].name === 'region' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<region lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<region level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<region period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<region authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<region authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<region valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else if (array[index].attr['regionType'] !== undefined) {
                        subject += '<region regionType="' + array[index].attr['regionType'].toLowerCase() + '">';
                    } else {
                        subject += '<region>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</region>';
                }

                if (array[index].name === 'state' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<state lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<state level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<state period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<state authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<state authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<state valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<state>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</state>';
                }

                if (array[index].name === 'territory' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<territory lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<territory level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<territory period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<territory authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<territory authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<territory valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<territory>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</territory>';
                }

                if (array[index].name === 'county' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<county lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<county level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<county period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<county authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<county authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<county valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<county>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</county>';
                }

                if (array[index].name === 'city' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<city lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<city level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<city period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<city authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<city authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<city valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<city>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</city>';
                }

                if (array[index].name === 'island' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<island lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<island level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<island period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<island authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<island authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<island valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else {
                        subject += '<island>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</island>';
                }

                if (array[index].name === 'area' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<area lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<area level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<area period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<area authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<area authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<area valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else if (array[index].attr['areaType'] !== undefined) {
                        subject += '<area areaType="' + array[index].attr['areaType'].toLowerCase() + '">';
                    } else {
                        subject += '<area>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</area>';
                }

                if (array[index].name === 'extraterrestrialArea' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<extraterrestrialArea lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<extraterrestrialArea level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<extraterrestrialArea period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<extraterrestrialArea authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<extraterrestrialArea authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<extraterrestrialArea valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else if (array[index].attr['areaType'] !== undefined) {
                        subject += '<extraterrestrialArea areaType="' + array[index].attr['areaType'].toLowerCase() + '">';
                    } else {
                        subject += '<extraterrestrialArea>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</extraterrestrialArea>';
                }

                if (array[index].name === 'citySection' && array[index].val.length > 0) {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<citySection lang="' + array[index].attr['lang'].toLowerCase() + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<citySection level="' + array[index].attr['level'].toLowerCase() + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<citySection period="' + array[index].attr['period'].toLowerCase() + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<citySection authority="' + array[index].attr['authority'].toLowerCase() + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<citySection authorityURI="' + array[index].attr['authorityURI'].toLowerCase() + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<citySection valueURI="' + array[index].attr['valueURI'].toLowerCase() + '">';
                    } else if (array[index].attr['citySectionType'] !== undefined) {
                        subject += '<citySection citySectionType="' + array[index].attr['citySectionType'].toLowerCase() + '">';
                    } else {
                        subject += '<citySection>';
                    }

                    if (array[index].val.trim() !== undefined) {
                        subject += xmlString.encode(array[index].val.trim());
                    }

                    subject += '</citySection>';
                }
            });

            subject += '</hierarchicalGeographic>';
        }
    });

    subject += '</subject>';

    return subject;
};