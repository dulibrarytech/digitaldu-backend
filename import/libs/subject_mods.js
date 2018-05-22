'use strict';

exports.subject = function (array, index) {

    var subject = '';

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return subject;
    }

    if (array[index].children[1].val == undefined) {
        return subject;
    }

    // check for subject attributes
    if (array[index].attr['authority'] !== undefined) {
        subject += '<subject authority="' + array[index].attr['authority'] + '">';
    } else if (array[index].attr['authorityURI'] !== undefined) {
        subject += '<subject authorityURI="' + array[index].attr['authorityURI'] + '">';
    } else if (array[index].attr['valueURI'] !== undefined) {
        subject += '<subject valueURI="' + array[index].attr['valueURI'] + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        subject += '<subject usage="' + array[index].attr['usage'] + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
    } else {
        subject += '<subject>';
    }

    // get subject sub element
    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'topic') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<topic authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<topic authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<topic valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<topic lang="' + array[index].attr['lang'] + '">';
            } else {
                subject += '<topic>';
            }

            subject += array[index].val.trim();
            subject += '</topic>';
        }

        if (array[index].name === 'geographic') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<geographic authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<geographic authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<geographic valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<geographic lang="' + array[index].attr['lang'] + '">';
            } else {
                subject += '<geographic>';
            }

            subject += array[index].val.trim();
            subject += '</geographic>';
        }

        if (array[index].name === 'temporal') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<temporal authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<temporal authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<temporal valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<temporal lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['encoding'] !== undefined) {
                subject += '<temporal encoding="' + array[index].attr['encoding'] + '">';
            } else if (array[index].attr['point'] !== undefined) {
                subject += '<temporal point="' + array[index].attr['point'] + '">';
            } else if (array[index].attr['keyDate'] !== undefined) {
                subject += '<temporal keyDate="' + array[index].attr['keyDate'] + '">';
            } else if (array[index].attr['qualifier'] !== undefined) {
                subject += '<temporal qualifier="' + array[index].attr['qualifier'] + '">';
            } else {
                subject += '<temporal>';
            }

            subject += array[index].val.trim();
            subject += '</temporal>';
        }

        if (array[index].name === 'geographicCode') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<geographicCode authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<geographicCode authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<geographicCode valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<geographicCode lang="' + array[index].attr['lang'] + '">';
            } else {
                subject += '<geographicCode>';
            }

            subject += array[index].val.trim();
            subject += '</geographicCode>';
        }

        if (array[index].name === 'genre') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<genre authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<genre authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<genre valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<genre lang="' + array[index].attr['lang'] + '">';
            } else {
                subject += '<genre>';
            }

            subject += array[index].val.trim();
            subject += '</genre>';
        }

        if (array[index].name === 'occupation') {

            if (array[index].attr['authority'] !== undefined) {
                subject += '<occupation authority="' + array[index].attr['authority'] + '">';
            } else if (array[index].attr['authorityURI'] !== undefined) {
                subject += '<occupation authorityURI="' + array[index].attr['authorityURI'] + '">';
            } else if (array[index].attr['valueURI'] !== undefined) {
                subject += '<occupation valueURI="' + array[index].attr['valueURI'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                subject += '<occupation lang="' + array[index].attr['lang'] + '">';
            } else {
                subject += '<occupation>';
            }

            subject += array[index].val.trim();
            subject += '</occupation>';
        }


        if (array[index].name === 'name') {

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<name authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<name ID="' + array[index].attr['ID'] + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<name type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<name authority="' + array[index].attr['authority'] + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';

            } else {

                subject += '<name>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'namePart') {

                    // check sub element attributes
                    if (array[index].attr['type'] !== undefined) {
                        subject += '<namePart type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['lang'] !== undefined) {
                        subject += '<namePart lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<namePart>';
                    }

                    subject += array[index].val.trim();
                    subject += '</namePart>';
                }

                if (array[index].name === 'role') {

                    // get role sub elements
                    array[index].eachChild(function (child, index, array) {

                        subject += '<role>';

                        // get attributes
                        if (array[index].attr['type'] !== undefined && array[index].attr['authority'] !== undefined) {
                            subject += '<roleTerm authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<roleTerm type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<roleTerm authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<roleTerm authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<roleTerm valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<roleTerm lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<roleTerm>';
                        }

                        subject += array[index].val.trim();
                        subject += '</roleTerm>';
                        subject += '</role>';
                    });

                }

                if (array[index].name === 'displayForm') {

                    subject += '<displayForm>';
                    subject += array[index].val.trim();
                    subject += '</displayForm>';
                }

                if (array[index].name === 'affiliation') {

                    // get affiliation sub elements
                    array[index].eachChild(function (child, index, array) {

                        if (array[index].attr['lang'] !== undefined) {
                            subject += '<affiliation lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<affiliation>';
                        }

                        subject += array[index].val.trim();
                        subject += '</affiliation>';
                    });
                }

                if (array[index].name === 'description') {

                    // get affiliation sub elements
                    array[index].eachChild(function (child, index, array) {

                        if (array[index].attr['lang'] !== undefined) {
                            subject += '<description lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<description>';
                        }

                        subject += array[index].val.trim();
                        subject += '</description>';
                    });
                }
            });

            subject += '</name>';
        }

        if (array[index].name === 'titleInfo') {

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<titleInfo authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<titleInfo type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';

            } else {

                subject += '<titleInfo>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'title') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<title lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<title>';
                    }

                    subject += array[index].val.trim();
                    subject += '</title>';
                }

                if (array[index].name === 'subTitle') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<subTitle lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<subTitle>';
                    }

                    subject += array[index].val.trim();
                    subject += '</subTitle>';
                }

                if (array[index].name === 'partNumber') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<partNumber lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<partNumber>';
                    }

                    subject += array[index].val.trim();
                    subject += '</partNumber>';
                }

                if (array[index].name === 'partName') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<partName lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<partName>';
                    }

                    subject += array[index].val.trim();
                    subject += '</partName>';
                }

                if (array[index].name === 'nonSort') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<nonSort lang="' + array[index].attr['lang'] + '">';
                    } else {
                        subject += '<nonSort>';
                    }

                    subject += array[index].val.trim();
                    subject += '</nonSort>';
                }
            });

            subject += '</titleInfo>';
        }

        if (array[index].name === 'hierarchicalGeographic') {

            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {

                subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['ID'] !== undefined) {

                subject += '<hierarchicalGeographic ID="' + array[index].attr['ID'] + '">';

            } else if (array[index].attr['type'] !== undefined) {

                subject += '<hierarchicalGeographic type="' + array[index].attr['type'] + '">';

            } else if (array[index].attr['authority'] !== undefined) {

                subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';

            } else if (array[index].attr['displayLabel'] !== undefined) {

                subject += '<hierarchicalGeographic displayLabel="' + array[index].attr['displayLabel'] + '">';

            } else {

                subject += '<hierarchicalGeographic>';
            }

            // get name sub elements
            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'continent') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<continent lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<continent level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<continent period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<continent authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<continent authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<continent valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<continent>';
                    }

                    subject += array[index].val.trim();
                    subject += '</continent>';
                }

                if (array[index].name === 'country') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<country lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<country level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<country period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<country authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<country authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<country valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<country>';
                    }

                    subject += array[index].val.trim();
                    subject += '</country>';
                }

                if (array[index].name === 'region') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<region lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<region level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<region period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<region authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<region authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<region valueURI="' + array[index].attr['valueURI'] + '">';
                    } else if (array[index].attr['regionType'] !== undefined) {
                        subject += '<region regionType="' + array[index].attr['regionType'] + '">';
                    } else {
                        subject += '<region>';
                    }

                    subject += array[index].val.trim();
                    subject += '</region>';
                }

                if (array[index].name === 'state') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<state lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<state level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<state period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<state authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<state authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<state valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<state>';
                    }

                    subject += array[index].val.trim();
                    subject += '</state>';
                }

                if (array[index].name === 'territory') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<territory lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<territory level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<territory period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<territory authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<territory authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<territory valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<territory>';
                    }

                    subject += array[index].val.trim();
                    subject += '</territory>';
                }

                if (array[index].name === 'county') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<county lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<county level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<county period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<county authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<county authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<county valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<county>';
                    }

                    subject += array[index].val.trim();
                    subject += '</county>';
                }

                if (array[index].name === 'city') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<city lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<city level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<city period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<city authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<city authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<city valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<city>';
                    }

                    subject += array[index].val.trim();
                    subject += '</city>';
                }

                if (array[index].name === 'island') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<island lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<island level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<island period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<island authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<island authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<island valueURI="' + array[index].attr['valueURI'] + '">';
                    } else {
                        subject += '<island>';
                    }

                    subject += array[index].val.trim();
                    subject += '</island>';
                }

                if (array[index].name === 'area') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<area lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<area level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<area period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<area authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<area authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<area valueURI="' + array[index].attr['valueURI'] + '">';
                    } else if (array[index].attr['areaType'] !== undefined) {
                        subject += '<area areaType="' + array[index].attr['areaType'] + '">';
                    } else {
                        subject += '<area>';
                    }

                    subject += array[index].val.trim();
                    subject += '</area>';
                }

                if (array[index].name === 'extraterrestrialArea') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<extraterrestrialArea lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<extraterrestrialArea level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<extraterrestrialArea period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<extraterrestrialArea authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<extraterrestrialArea authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<extraterrestrialArea valueURI="' + array[index].attr['valueURI'] + '">';
                    } else if (array[index].attr['areaType'] !== undefined) {
                        subject += '<extraterrestrialArea areaType="' + array[index].attr['areaType'] + '">';
                    } else {
                        subject += '<extraterrestrialArea>';
                    }

                    subject += array[index].val.trim();
                    subject += '</extraterrestrialArea>';
                }

                if (array[index].name === 'citySection') {

                    // check sub element attributes
                    if (array[index].attr['lang'] !== undefined) {
                        subject += '<citySection lang="' + array[index].attr['lang'] + '">';
                    } else if (array[index].attr['level'] !== undefined) {
                        subject += '<citySection level="' + array[index].attr['level'] + '">';
                    } else if (array[index].attr['period'] !== undefined) {
                        subject += '<citySection period="' + array[index].attr['period'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        subject += '<citySection authority="' + array[index].attr['authority'] + '">';
                    } else if (array[index].attr['authorityURI'] !== undefined) {
                        subject += '<citySection authorityURI="' + array[index].attr['authorityURI'] + '">';
                    } else if (array[index].attr['valueURI'] !== undefined) {
                        subject += '<citySection valueURI="' + array[index].attr['valueURI'] + '">';
                    } else if (array[index].attr['citySectionType'] !== undefined) {
                        subject += '<citySection citySectionType="' + array[index].attr['citySectionType'] + '">';
                    } else {
                        subject += '<citySection>';
                    }

                    subject += array[index].val.trim();
                    subject += '</citySectiona>';
                }
            });

            subject += '</hierarchicalGeographic>';
        }
    });

    subject += '</subject>';

    return subject;
};