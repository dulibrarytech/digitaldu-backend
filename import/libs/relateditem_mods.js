'use strict';

exports.relatedItem = function (array, index) {

    var relatedItem = '';

    array[index].eachChild(function (child, index, array) {

        //==========TITLEINFO==========//
        if (array[index].name === 'titleInfo') {

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'title') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        relatedItem += '<titleInfo>';
                        relatedItem += '<title>' + array[index].val.trim() + '</title>';
                        relatedItem += '</titleInfo>';
                        relatedItem += '</relatedItem>';
                    }
                }
            });
        }

        //==========NAME==========//
        if (array[index].name === 'name') {

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'namePart') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<name type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<name usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<name altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else if (array[index].attr['nameTitleGroup'] !== undefined) {
                            relatedItem += '<name nameTitleGroup="' + array[index].attr['nameTitleGroup'] + '">';
                        } else {
                            relatedItem += '<name>';
                        }

                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<namePart type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<namePart lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<namePart>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</namePart>';
                        relatedItem += '</name>';
                        relatedItem += '<relatedItem>';
                    }
                }

                if (array[index].name === 'role') {

                    array[index].eachChild(function (child, index, array) {

                        if (array[index].val !== undefined && array[index].val.length !== 0) {

                            if (array[index].attr['objectPart'] !== undefined) {
                                relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                            } else if (array[index].attr['lang'] !== undefined) {
                                relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                            } else if (array[index].attr['displayLabel'] !== undefined) {
                                relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                            } else if (array[index].attr['usage'] !== undefined) {
                                relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                            } else if (array[index].attr['altRepGroup'] !== undefined) {
                                relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                            } else {
                                relatedItem += '<relatedItem>';
                            }

                            // check for element attributes
                            if (array[index].attr['type'] !== undefined) {
                                relatedItem += '<name type="' + array[index].attr['type'] + '">';
                            } else if (array[index].attr['ID'] !== undefined) {
                                relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                            } else if (array[index].attr['authority'] !== undefined) {
                                relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                            } else if (array[index].attr['displayLabel'] !== undefined) {
                                relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                            } else if (array[index].attr['usage'] !== undefined) {
                                relatedItem += '<name usage="' + array[index].attr['usage'] + '">';
                            } else if (array[index].attr['altRepGroup'] !== undefined) {
                                relatedItem += '<name altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                            } else if (array[index].attr['nameTitleGroup'] !== undefined) {
                                relatedItem += '<name nameTitleGroup="' + array[index].attr['nameTitleGroup'] + '">';
                            } else {
                                relatedItem += '<name>';
                            }

                            relatedItem += '<role>';

                            // check for element attributes
                            if (array[index].attr['authority'] !== undefined && array[index].attr['type'] !== undefined) {
                                relatedItem += '<roleTerm authority="' + array[index].attr['authority'] + '" type="' + array[index].attr['type'] + '">';
                            } else if (array[index].attr['authority'] == undefined && array[index].attr['type'] !== undefined) {
                                relatedItem += '<roleTerm type="' + array[index].attr['type'] + '">';
                            } else {
                                relatedItem += '<roleTerm>';
                            }

                            relatedItem += array[index].val.trim();
                            relatedItem += '</roleTerm>';
                            relatedItem += '</role>';
                            relatedItem += '</name>';
                            relatedItem += '<relatedItem>';
                        }
                    });
                }
            });
        }

        //==========TYPEOFRESOURCE==========//
        if (array[index].name === 'typeOfResource') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['objectPart'] !== undefined) {
                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    relatedItem += '<relatedItem>';
                }

                // check for element attributes
                if (array[index].attr['type'] !== undefined) {
                    relatedItem += '<typeOfResource type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    relatedItem += '<typeOfResource authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<typeOfResource lang="' + array[index].attr['lang'] + '">';
                }
                else {
                    relatedItem += '<typeOfResource>';
                }

                relatedItem += array[index].val;
                relatedItem += '</typeOfResource>';
                relatedItem += '</relatedItem>';
            }
        }

        //==========GENRE==========//
        if (array[index].name === 'genre') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['objectPart'] !== undefined) {
                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    relatedItem += '<relatedItem>';
                }

                // check for element attributes
                if (array[index].attr['type'] !== undefined) {
                    relatedItem += '<genre type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    relatedItem += '<genre authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<genre lang="' + array[index].attr['lang'] + '">';
                }
                else {
                    relatedItem += '<genre>';
                }

                relatedItem += array[index].val;
                relatedItem += '</genre>';
                relatedItem += '</relatedItem>';
            }
        }

        //==========ORIGININFO==========//
        if (array[index].name === 'originInfo') {

            if (array[index].attr['objectPart'] !== undefined) {
                relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['usage'] !== undefined) {
                relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                relatedItem += '<relatedItem>';
            }

            // check for element attributes
            if (array[index].attr['	lang'] !== undefined) {
                relatedItem += '<originInfo lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<originInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<originInfo altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else if (array[index].attr['eventType'] !== undefined) {
                relatedItem += '<originInfo eventType="' + array[index].attr['eventType'] + '">';
            } else {
                relatedItem += '<originInfo>';
            }

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'publisher') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<publisher type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<publisher lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<publisher>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</publisher>';
                    }
                }

                if (array[index].name === 'dateIssued') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<dateIssued encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<dateIssued point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<dateIssued keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<dateIssued qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<dateIssued lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<dateIssued>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</dateIssued>';
                    }
                }

                if (array[index].name === 'dateCaptured') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<dateCaptured encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<dateCaptured point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<dateCaptured keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<dateCaptured qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<dateCaptured lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<dateCaptured>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</dateCaptured>';
                    }
                }

                if (array[index].name === 'dateValid') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<dateValid encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<dateValid point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<dateValid keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<dateValid qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<dateValid lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<dateValid>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</dateValid>';
                    }
                }

                if (array[index].name === 'dateModified') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<dateValid encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<dateValid point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<dateValid keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<dateValid qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<dateValid lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<dateModified>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</dateModified>';
                    }
                }

                if (array[index].name === 'copyrightDate') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<copyrightDate encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<copyrightDate point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<copyrightDate keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<copyrightDate qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<copyrightDate lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<copyrightDate>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</copyrightDate>';
                    }
                }

                if (array[index].name === 'dateOther') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<dateOther encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<dateOther point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<dateOther keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<dateOther qualifier="' + array[index].attr['qualifier'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<dateOther lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<dateOther>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</dateOther>';
                    }
                }

                if (array[index].name === 'edition') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['supplied'] !== undefined) {
                            relatedItem += '<edition supplied="' + array[index].attr['supplied'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<edition lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<edition>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</edition>';
                    }
                }

                if (array[index].name === 'issuance') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        relatedItem += '<issuance>';
                        relatedItem += array[index].val.trim();
                        relatedItem += '</issuance>';
                    }
                }

                if (array[index].name === 'frequency') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<frequency authority="' + array[index].attr['authority'] + '">';
                        } else {
                            relatedItem += '<frequency>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</frequency>';
                    }
                }

                if (array[index].name === 'place') {

                    array[index].eachChild(function (child, index, array) {

                        if (array[index].val !== undefined && array[index].val.length !== 0) {

                            // check for element attributes
                            if (array[index].attr['supplied'] !== undefined) {
                                relatedItem += '<place supplied="' + array[index].attr['supplied'] + '">';
                            } else {
                                relatedItem += '<place>';
                            }

                            // check for element attributes
                            if (array[index].attr['type'] !== undefined) {
                                relatedItem += '<placeTerm type="' + array[index].attr['type'] + '">';
                            } else if (array[index].attr['authority'] !== undefined) {
                                relatedItem += '<placeTerm authority="' + array[index].attr['authority'] + '">';
                            } else {
                                relatedItem += '<placeTerm>';
                            }

                            relatedItem += array[index].val.trim();
                            relatedItem += '</placeTerm>';
                            relatedItem += '</place>';
                        }
                    });
                }
            });

            relatedItem += '</originInfo>';
            relatedItem += '</relatedItem>';
        }

        //==========LANGUAGE==========//
        if (array[index].name === 'language') {

            if (array[index].attr['objectPart'] !== undefined) {
                relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['usage'] !== undefined) {
                relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                relatedItem += '<relatedItem>';
            }

            if (array[index].attr['objectPart'] !== undefined) {
                relatedItem += '<language objectPart="' + array[index].attr['objectPart'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                relatedItem += '<language lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<language displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['usage'] !== undefined) {
                relatedItem += '<language usage="' + array[index].attr['usage'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<language altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                relatedItem += '<language>';
            }

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'languageTerm') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<languageTerm type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<languageTerm authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<languageTerm lang="' + array[index].attr['lang'] + '">';
                        }
                        else {
                            relatedItem += '<languageTerm>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</languageTerm>';
                    }
                }

                if (array[index].name === 'scriptTerm') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<scriptTerm type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<scriptTerm authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<scriptTerm lang="' + array[index].attr['lang'] + '">';
                        }
                        else {
                            relatedItem += '<scriptTerm>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</scriptTerm>';
                    }
                }
            });

            relatedItem += '</language>';
            relatedItem += '</relatedItem>';
        }

        //==========PHYSICALDESCRIPTION==========//
        if (array[index].name === 'physicalDescription') {


            if (array[index].attr['objectPart'] !== undefined) {
                relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
            } else if (array[index].attr['lang'] !== undefined) {
                relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['usage'] !== undefined) {
                relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                relatedItem += '<relatedItem>';
            }


            if (array[index].attr['lang'] !== undefined) {
                relatedItem += '<physicalDescription lang="' + array[index].attr['lang'] + '">';
            } else if (array[index].attr['displayLabel'] !== undefined) {
                relatedItem += '<physicalDescription displayLabel="' + array[index].attr['displayLabel'] + '">';
            } else if (array[index].attr['altRepGroup'] !== undefined) {
                relatedItem += '<physicalDescription altRepGroup="' + array[index].attr['altRepGroup'] + '">';
            } else {
                relatedItem += '<physicalDescription>';
            }

            array[index].eachChild(function (child, index, array) {

                if (array[index].name === 'form') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<form type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<form authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<form lang="' + array[index].attr['lang'] + '">';
                        }
                        else {
                            relatedItem += '<form>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</form>';
                    }
                }

                if (array[index].name === 'reformattingQuality') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<reformattingQuality type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<reformattingQuality authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<reformattingQuality lang="' + array[index].attr['lang'] + '">';
                        }
                        else {
                            relatedItem += '<reformattingQuality>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</reformattingQuality>';
                    }
                }

                if (array[index].name === 'internetMediaType') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<internetMediaType lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<internetMediaType>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</internetMediaType>';
                    }

                }

                if (array[index].name === 'extent') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['supplied'] !== undefined) {
                            relatedItem += '<extent supplied="' + array[index].attr['supplied'] + '">';
                        } else if (array[index].attr['unit'] !== undefined) {
                            relatedItem += '<extent unit="' + array[index].attr['unit'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<extent lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['digitalOrigin'] !== undefined) {
                            relatedItem += '<extent digitalOrigin="' + array[index].attr['digitalOrigin'] + '">';
                        }
                        else {
                            relatedItem += '<extent>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</extent>';
                    }
                }

                if (array[index].name === 'note') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        // check for element attributes
                        if (array[index].attr['typeURI'] !== undefined) {
                            relatedItem += '<note typeURI="' + array[index].attr['typeURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<note lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<note displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<note type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<note ID="' + array[index].attr['ID'] + '">';
                        }
                        else {
                            relatedItem += '<extent>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</extent>';
                    }
                }

                if (array[index].name === 'digitalOrigin') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {
                        relatedItem += '<digitalOrigin>';
                        relatedItem += array[index].val.trim();
                        relatedItem += '</digitalOrigin>';
                    }
                }
            });

            relatedItem += '</physicalDescription>';
            relatedItem += '</relatedItem>';
        }

        //==========ABSTRACT==========//
        if (array[index].name === 'abstract') {
            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['objectPart'] !== undefined) {
                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    relatedItem += '<relatedItem>';
                }

                if (array[index].attr['type'] !== undefined) {
                    relatedItem += '<abstract type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['altFormat'] !== undefined) {
                    relatedItem += '<abstract altFormat="' + array[index].attr['altFormat'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<abstract displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['altContent'] !== undefined) {
                    relatedItem += '<abstract altContent="' + array[index].attr['altContent'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<abstract altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else if (array[index].attr['shareable'] !== undefined) {
                    relatedItem += '<abstract shareable="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<abstract lang="' + array[index].attr['lang'] + '">';
                } else {
                    relatedItem += '<abstract>';
                }

                relatedItem += array[index].val.trim();
                relatedItem += '</abstract>';
                relatedItem += '</relatedItem>';
            }
        }

        //==========TABLEOFCONTENTS==========//
        if (array[index].name === 'tableOfContents') {
            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['objectPart'] !== undefined) {
                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    relatedItem += '<relatedItem>';
                }

                if (array[index].attr['type'] !== undefined) {
                    relatedItem += '<tableOfContents type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['altFormat'] !== undefined) {
                    relatedItem += '<tableOfContents altFormat="' + array[index].attr['altFormat'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<tableOfContents displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['altContent'] !== undefined) {
                    relatedItem += '<tableOfContents altContent="' + array[index].attr['altContent'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<tableOfContents altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else if (array[index].attr['shareable'] !== undefined) {
                    relatedItem += '<tableOfContents shareable="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<tableOfContents lang="' + array[index].attr['lang'] + '">';
                } else {
                    relatedItem += '<tableOfContents>';
                }

                relatedItem += array[index].val.trim();
                relatedItem += '</tableOfContents>';
                relatedItem += '</relatedItem>';
            }
        }

        //==========TARGETAUDIENCE==========//
        if (array[index].name === 'targetAudience') {
            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['objectPart'] !== undefined) {
                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                } else if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['usage'] !== undefined) {
                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                } else if (array[index].attr['altRepGroup'] !== undefined) {
                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else {
                    relatedItem += '<relatedItem>';
                }

                if (array[index].attr['displayLabel'] !== undefined) {
                    relatedItem += '<targetAudience displayLabel="' + array[index].attr['displayLabel'] + '">';
                } else if (array[index].attr['altContent'] !== undefined) {
                    relatedItem += '<targetAudience authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['authority'] !== undefined) {
                    relatedItem += '<targetAudience altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                } else if (array[index].attr['shareable'] !== undefined) {
                    relatedItem += '<targetAudience shareable="' + array[index].attr['shareable'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    relatedItem += '<targetAudience lang="' + array[index].attr['lang'] + '">';
                } else {
                    relatedItem += '<targetAudience>';
                }

                relatedItem += array[index].val.trim();
                relatedItem += '</targetAudience>';
                relatedItem += '</relatedItem>';
            }
        }

        //==========SUBJECT==========//
        if (array[index].name === 'subject') {

            array[index].eachChild(function (child, index, array) {


                if (array[index].name === 'topic') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {


                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }


                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<topic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            relatedItem += '<topic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            relatedItem += '<topic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<topic lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<topic>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</topic>';
                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }

                if (array[index].name === 'geographic') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<geographic authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            relatedItem += '<geographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            relatedItem += '<geographic valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<geographic lang="' + array[index].attr['lang'] + '">';
                        } else {
                            relatedItem += '<geographic>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</geographic>';

                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }

                if (array[index].name === 'temporal') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        // check for element attributes
                        if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<temporal authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['authorityURI'] !== undefined) {
                            relatedItem += '<temporal authorityURI="' + array[index].attr['authorityURI'] + '">';
                        } else if (array[index].attr['valueURI'] !== undefined) {
                            relatedItem += '<temporal valueURI="' + array[index].attr['valueURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<temporal lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['encoding'] !== undefined) {
                            relatedItem += '<temporal encoding="' + array[index].attr['encoding'] + '">';
                        } else if (array[index].attr['point'] !== undefined) {
                            relatedItem += '<temporal point="' + array[index].attr['point'] + '">';
                        } else if (array[index].attr['keyDate'] !== undefined) {
                            relatedItem += '<temporal keyDate="' + array[index].attr['keyDate'] + '">';
                        } else if (array[index].attr['qualifier'] !== undefined) {
                            relatedItem += '<temporal qualifier="' + array[index].attr['qualifier'] + '">';
                        } else {
                            relatedItem += '<temporal>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</temporal>';
                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }

                if (array[index].name === 'titleInfo') {

                    array[index].eachChild(function (child, index, array) {

                        // titleInfo sub elements
                        if (array[index].name === 'title') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<titleInfo type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<titleInfo>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<title authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<title authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<title valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<title lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<title>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</title>';
                                relatedItem += '</titleInfo>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'subTitle') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<titleInfo type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<titleInfo>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subTitle authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<subTitle authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<subTitle valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<subTitle lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<subTitle>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</subTitle>';
                                relatedItem += '</titleInfo>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'partNumber') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<titleInfo type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<titleInfo>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<partNumber authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<partNumber authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<partNumber valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<partNumber lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<partNumber>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</partNumber>';
                                relatedItem += '</titleInfo>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'partName') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<titleInfo type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<titleInfo>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<partName authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<partName authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<partName valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<partName lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<partName>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</partName>';
                                relatedItem += '</titleInfo>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'nonSort') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<titleInfo ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<titleInfo lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<titleInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<titleInfo type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<titleInfo authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<titleInfo>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<nonSort authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<nonSortauthorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<nonSort valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<nonSort lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<nonSort>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</nonSort>';
                                relatedItem += '</titleInfo>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }
                    });
                }

                if (array[index].name === 'name') {

                    array[index].eachChild(function (child, index, array) {

                        // titleInfo sub elements
                        if (array[index].name === 'namePart') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                // TODO: add attributes to all name elements
                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<name lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<name type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<name>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<namePart authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<namePart authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<namePart valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<namePart lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<namePart>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</namePart>';
                                relatedItem += '</name>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'displayForm') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<name lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<name type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<name>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<displayForm authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<displayForm authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<displayForm valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<displayForm lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<displayForm>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</displayForm>';
                                relatedItem += '</name>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'affiliation') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<name lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<name type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<name>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<affiliation authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<affiliation authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<affiliation valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<affiliation lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<affiliation>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</affiliation>';
                                relatedItem += '</name>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'role') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<name lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<name type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<name>';
                                }

                                relatedItem += '<role>';

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<roleTerm authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<roleTerm authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<roleTerm valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<roleTerm lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<roleTerm>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</roleTerm>';

                                relatedItem += '</role>';
                                relatedItem += '</name>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'description') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<name ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<name lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<name displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['type'] !== undefined) {
                                    relatedItem += '<name type="' + array[index].attr['type'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<name authority="' + array[index].attr['authority'] + '">';
                                } else {
                                    relatedItem += '<name>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<description authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<description authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<description valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<description lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<description>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</description>';
                                relatedItem += '</name>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }
                    });
                }

                if (array[index].name === 'geographicCode') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        // check for element attributes
                        if (array[index].attr['typeURI'] !== undefined) {
                            relatedItem += '<geographicCode typeURI="' + array[index].attr['typeURI'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<geographicCode lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<geographicCode displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['type'] !== undefined) {
                            relatedItem += '<geographicCode type="' + array[index].attr['type'] + '">';
                        } else if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<geographicCode ID="' + array[index].attr['ID'] + '">';
                        }
                        else {
                            relatedItem += '<geographicCode>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</geographicCode>';
                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }

                if (array[index].name === 'genre') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        relatedItem += '<genre>';
                        relatedItem += array[index].val.trim();
                        relatedItem += '</genre>';
                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }

                if (array[index].name === 'hierarchicalGeographic') {

                    array[index].eachChild(function (child, index, array) {

                        // titleInfo sub elements

                        if (array[index].name === 'continent') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<continent authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<continent authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<continent valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<continent lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<continent>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</continent>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'country') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<country authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<country authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<country valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<country lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<country>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</country>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'region') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<region authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<region authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<region valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<region lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<region>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</region>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'state') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {


                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<state authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<state authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<state valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<state lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<state>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</state>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'territory') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<territory authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<territory authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<territory valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<territory lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<territory>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</territory>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'county') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }


                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<county authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<county authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<county valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<county lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<county>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</county>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'city') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<city authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<city authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<city valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<city lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<city>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</city>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'island') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<island authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<island authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<island valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<island lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<island>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</island>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'area') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<area authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<area authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<area valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<area lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<area>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</area>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'extraterrestrialArea') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {


                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }


                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem+= '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<extraterrestrialArea authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<extraterrestrialArea authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<extraterrestrialArea valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<extraterrestrialArea lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<extraterrestrialArea>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</extraterrestrialArea>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'citySection') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<hierarchicalGeographic valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<hierarchicalGeographic>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<citySection authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<citySection authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<citySection valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<citySection lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<citySection>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</citySection>';
                                relatedItem += '</hierarchicalGeographic>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }
                    });
                }


                if (array[index].name === 'cartographics') {

                    array[index].eachChild(function (child, index, array) {

                        // titleInfo sub elements

                        if (array[index].name === 'scale') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {

                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<cartographics authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<cartographics>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<scale authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<scale authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<scale valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<scale lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<scale>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</scale>';
                                relatedItem += '</cartographics>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'projection') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {


                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<cartographics authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<cartographics>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<projection authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<projection authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<projection valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<projection lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<projection>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</projection>';
                                relatedItem += '</cartographics>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                        if (array[index].name === 'coordinates') {

                            if (array[index].val !== undefined && array[index].val.length !== 0) {


                                if (array[index].attr['objectPart'] !== undefined) {
                                    relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<relatedItem>';
                                }

                                if (array[index].attr['ID'] !== undefined) {
                                    relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                                } else if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['displayLabel'] !== undefined) {
                                    relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                                } else if (array[index].attr['usage'] !== undefined) {
                                    relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                                } else if (array[index].attr['altRepGroup'] !== undefined) {
                                    relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                                } else {
                                    relatedItem += '<subject>';
                                }

                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<cartographics authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<cartographics authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<cartographics valueURI="' + array[index].attr['valueURI'] + '">';
                                } else {
                                    relatedItem += '<cartographics>';
                                }

                                // check for element attributes
                                if (array[index].attr['authority'] !== undefined) {
                                    relatedItem += '<coordinates authority="' + array[index].attr['authority'] + '">';
                                } else if (array[index].attr['authorityURI'] !== undefined) {
                                    relatedItem += '<coordinates authorityURI="' + array[index].attr['authorityURI'] + '">';
                                } else if (array[index].attr['valueURI'] !== undefined) {
                                    relatedItem += '<coordinates valueURI="' + array[index].attr['valueURI'] + '">';
                                } else if (array[index].attr['lang'] !== undefined) {
                                    relatedItem += '<coordinates lang="' + array[index].attr['lang'] + '">';
                                } else {
                                    relatedItem += '<coordinates>';
                                }

                                relatedItem += array[index].val.trim();
                                relatedItem += '</coordinates>';
                                relatedItem += '</cartographics>';
                                relatedItem += '</subject>';
                                relatedItem += '</relatedItem>';
                            }
                        }

                    });
                }

                if (array[index].name === 'occupation') {

                    if (array[index].val !== undefined && array[index].val.length !== 0) {

                        if (array[index].attr['objectPart'] !== undefined) {
                            relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'] + '">';
                        } else if (array[index].attr['lang'] !== undefined) {
                            relatedItem += '<relatedItem lang="' + array[index].attr['lang'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<relatedItem usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<relatedItem>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<subject ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<subject authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<subject displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<subject usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<subject altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<subject>';
                        }

                        if (array[index].attr['ID'] !== undefined) {
                            relatedItem += '<occupation ID="' + array[index].attr['ID'] + '">';
                        } else if (array[index].attr['authority'] !== undefined) {
                            relatedItem += '<occupation authority="' + array[index].attr['authority'] + '">';
                        } else if (array[index].attr['displayLabel'] !== undefined) {
                            relatedItem += '<occupation displayLabel="' + array[index].attr['displayLabel'] + '">';
                        } else if (array[index].attr['usage'] !== undefined) {
                            relatedItem += '<occupation usage="' + array[index].attr['usage'] + '">';
                        } else if (array[index].attr['altRepGroup'] !== undefined) {
                            relatedItem += '<occupation altRepGroup="' + array[index].attr['altRepGroup'] + '">';
                        } else {
                            relatedItem += '<occupation>';
                        }

                        relatedItem += array[index].val.trim();
                        relatedItem += '</occupation>';
                        relatedItem += '</subject>';
                        relatedItem += '</relatedItem>';
                    }
                }
            });
        }
    });

    return relatedItem;
};