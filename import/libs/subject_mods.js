'use strict';

exports.subject = function (array, index) {

    var subject = '';

    array[index].eachChild(function (child, index, array) {


        if (array[index].name === 'topic') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                // check for element attributes
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
                subject += '</subject>';
            }
        }

        if (array[index].name === 'geographic') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                // check for element attributes
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

                subject += '</subject>';
            }
        }

        if (array[index].name === 'temporal') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                // check for element attributes
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
                subject += '</subject>';
            }
        }

        if (array[index].name === 'titleInfo') {

            array[index].eachChild(function (child, index, array) {

                // titleInfo sub elements
                if (array[index].name === 'title') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<titleInfo type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<titleInfo>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<title authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<title authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<title valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<title lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<title>';
                        }

                        subject += array[index].val.trim();
                        subject += '</title>';
                        subject += '</titleInfo>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'subTitle') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {


                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<titleInfo type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<titleInfo>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<subTitle authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<subTitle authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<subTitle valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<subTitle lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<subTitle>';
                        }

                        subject += array[index].val.trim();
                        subject += '</subTitle>';
                        subject += '</titleInfo>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'partNumber') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<titleInfo type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<titleInfo>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<partNumber authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<partNumber authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<partNumber valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<partNumber lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<partNumber>';
                        }

                        subject += array[index].val.trim();
                        subject += '</partNumber>';
                        subject += '</titleInfo>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'partName') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<titleInfo type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<titleInfo>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<partName authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<partName authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<partName valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<partName lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<partName>';
                        }

                        subject += array[index].val.trim();
                        subject += '</partName>';
                        subject += '</titleInfo>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'nonSort') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<titleInfo type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<titleInfo>';
                        }


                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<nonSort authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<nonSortauthorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<nonSort valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<nonSort lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<nonSort>';
                        }

                        subject += array[index].val.trim();
                        subject += '</nonSort>';
                        subject += '</titleInfo>';
                        subject += '</subject>';
                    }
                }
            });
        }

        if (array[index].name === 'name') {

            array[index].eachChild(function (child, index, array) {

                // titleInfo sub elements
                if (array[index].name === 'namePart') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        // TODO: add attributes to all name elements
                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<name lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<name authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<name>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<namePart authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<namePart authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<namePart valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<namePart lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<namePart>';
                        }

                        subject += array[index].val.trim();
                        subject += '</namePart>';
                        subject += '</name>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'displayForm') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<name lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<name authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<name>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<displayForm authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<displayForm authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<displayForm valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<displayForm lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<displayForm>';
                        }

                        subject += array[index].val.trim();
                        subject += '</displayForm>';
                        subject += '</name>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'affiliation') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<name lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<name authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<name>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<affiliation authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<affiliation authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<affiliation valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<affiliation lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<affiliation>';
                        }

                        subject += array[index].val.trim();
                        subject += '</affiliation>';
                        subject += '</name>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'role') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<name lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<name authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<name>';
                        }

                        subject += '<role>';

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
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
                        subject += '</name>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'description') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }


                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<name lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            subject += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<name authority="' + array[index].attr['authority'] + '">';
                        } else {
                            subject += '<name>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<description authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<description authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<description valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<description lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<description>';
                        }

                        subject += array[index].val.trim();
                        subject += '</description>';
                        subject += '</name>';
                        subject += '</subject>';
                    }
                }
            });
        }

        if (array[index].name === 'geographicCode') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                // check for element attributes
                if (array[index].attr['typeURI'] !== undefined) {
                    subject += '<geographicCode typeURI="' + array[index].attr['typeURI'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    subject += '<geographicCode lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<geographicCode displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['type'] !== undefined) {
                    subject += '<geographicCode type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['ID'] !== undefined) {
                    subject += '<geographicCode ID="' + array[index].attr['ID'] + '">';
                }
                else {
                    subject += '<geographicCode>';
                }

                subject += array[index].val.trim();
                subject += '</geographicCode>';

                subject += '</subject>';
            }
        }

        if (array[index].name === 'genre') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                subject += '<genre>';
                subject += array[index].val.trim();
                subject += '</genre>';
                subject += '</subject>';
            }
        }

        if (array[index].name === 'hierarchicalGeographic') {

            array[index].eachChild(function (child, index, array) {

                // titleInfo sub elements

                if (array[index].name === 'continent') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<continent authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<continent authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<continent valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<continent lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<continent>';
                        }

                        subject += array[index].val.trim();
                        subject += '</continent>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'country') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<country authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<country authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<country valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<country lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<country>';
                        }

                        subject += array[index].val.trim();
                        subject += '</country>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'region') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<region authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<region authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<region valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<region lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<region>';
                        }

                        subject += array[index].val.trim();
                        subject += '</region>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'state') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<state authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<state authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<state valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<state lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<state>';
                        }

                        subject += array[index].val.trim();
                        subject += '</state>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'territory') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<territory authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<territory authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<territory valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<territory lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<territory>';
                        }

                        subject += array[index].val.trim();
                        subject += '</territory>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'county') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<county authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<county authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<county valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<county lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<county>';
                        }

                        subject += array[index].val.trim();
                        subject += '</county>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'city') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<city authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<city authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<city valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<city lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<city>';
                        }

                        subject += array[index].val.trim();
                        subject += '</city>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'island') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<island authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<island authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<island valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<island lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<island>';
                        }

                        subject += array[index].val.trim();
                        subject += '</island>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'area') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<area authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<area authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<area valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<area lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<area>';
                        }

                        subject += array[index].val.trim();
                        subject += '</area>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'extraterrestrialArea') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<extraterrestrialArea authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<extraterrestrialArea authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<extraterrestrialArea valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<extraterrestrialArea lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<extraterrestrialArea>';
                        }

                        subject += array[index].val.trim();
                        subject += '</extraterrestrialArea>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'citySection') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<hierarchicalGeographic>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<citySection authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<citySection authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<citySection valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<citySection lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<citySection>';
                        }

                        subject += array[index].val.trim();
                        subject += '</citySection>';
                        subject += '</hierarchicalGeographic>';
                        subject += '</subject>';
                    }
                }
            });
        }


        if (array[index].name === 'cartographics') {

            array[index].eachChild(function (child, index, array) {

                // titleInfo sub elements

                if (array[index].name === 'scale') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<cartographics authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<cartographics>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<scale authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<scale authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<scale valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<scale lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<scale>';
                        }

                        subject += array[index].val.trim();
                        subject += '</scale>';
                        subject += '</cartographics>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'projection') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<cartographics authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<cartographics>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<projection authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<projection authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<projection valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<projection lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<projection>';
                        }

                        subject += array[index].val.trim();
                        subject += '</projection>';
                        subject += '</cartographics>';
                        subject += '</subject>';
                    }
                }

                if (array[index].name === 'coordinates') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['ID'] !== undefined) {
                            subject += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            subject += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            subject += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            subject += '<subject>';
                        }

                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<cartographics authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                        } else {
                            subject += '<cartographics>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            subject += '<coordinates authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            subject += '<coordinates authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            subject += '<coordinates valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            subject += '<coordinates lang="' + array[index].attr['lang'] + '">';
                        } else {
                            subject += '<coordinates>';
                        }

                        subject += array[index].val.trim();
                        subject += '</coordinates>';
                        subject += '</cartographics>';
                        subject += '</subject>';
                    }
                }

            });
        }

        if (array[index].name === 'occupation') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<subject ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<subject authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<subject usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<subject>';
                }

                if (array[index].attr['ID'] !== undefined) {
                    subject += '<occupation ID="' + array[index].attr['ID'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    subject += '<occupation authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    subject += '<occupation displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    subject += '<occupation usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    subject += '<occupation altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    subject += '<occupation>';
                }

                subject += array[index].val.trim();
                subject += '</occupation>';
                subject += '</subject>';
            }
        }
    });

    return subject;
};