'use strict';

exports.origininfo = function (array, index) {

    var originInfo = '';

    if (array[index].children[1] === undefined || array[index].children[1].val === undefined || array[index].children[1].val.length === 0) {
        return originInfo;
    }

    if (array[index].children[1] === undefined || array[index].children[1].name === undefined) {
        return originInfo;
    }

    if (array[index].children[1].val == undefined) {
        return originInfo;
    }

    // check for element attributes
    if (array[index].attr['	lang'] !== undefined) {
        originInfo += '<originInfo lang="' + array[index].attr['lang'] + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        originInfo += '<originInfo displayLabel="' + array[index].attr['displayLabel'] + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        originInfo += '<originInfo altRepGroup="' + array[index].attr['altRepGroup'] + '">';
    } else if (array[index].attr['eventType'] !== undefined) {
        originInfo += '<originInfo eventType="' + array[index].attr['eventType'] + '">';
    } else {
        originInfo += '<originInfo>';
    }

    array[index].eachChild(function (child, index, array) {

        if (array[index].name === 'place') {

            array[index].eachChild(function (child, index, array) {

                if (array[index].val !== undefined && array[index].val.length !== 0) {

                    // check for element attributes
                    if (array[index].attr['supplied'] !== undefined) {
                        originInfo += '<place supplied="' + array[index].attr['supplied'] + '">';
                    } else {
                        originInfo += '<place>';
                    }

                    // check for element attributes
                    if (array[index].attr['type'] !== undefined) {
                        originInfo += '<placeTerm type="' + array[index].attr['type'] + '">';
                    } else if (array[index].attr['authority'] !== undefined) {
                        originInfo += '<placeTerm authority="' + array[index].attr['authority'] + '">';
                    } else {
                        originInfo += '<placeTerm>';
                    }

                    originInfo += array[index].val.trim();
                    originInfo += '</placeTerm>';
                    originInfo += '</place>';
                }
            });
        }

        if (array[index].name === 'publisher') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['type'] !== undefined) {
                    originInfo += '<publisher type="' + array[index].attr['type'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<publisher lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<publisher>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</publisher>';
            }
        }

        if (array[index].name === 'dateIssued') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateIssued encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateIssued point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateIssued keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateIssued qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateIssued lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateIssued>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateIssued>';
            }
        }

        if (array[index].name === 'dateCreated') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateCreated encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateCreated point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateCreated keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateCreated qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateCreated lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateCreated>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateCreated>';
            }
        }

        if (array[index].name === 'dateCaptured') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateCaptured encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateCaptured point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateCaptured keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateCaptured qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateCaptured lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateCaptured>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateCaptured>';
            }
        }

        if (array[index].name === 'dateValid') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateValid encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateValid point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateValid keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateValid qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateValid lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateValid>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateValid>';
            }
        }

        if (array[index].name === 'dateModified') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateValid encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateValid point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateValid keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateValid qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateValid lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateModified>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateModified>';
            }
        }

        if (array[index].name === 'copyrightDate') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<copyrightDate encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<copyrightDate point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<copyrightDate keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<copyrightDate qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<copyrightDate lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<copyrightDate>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</copyrightDate>';
            }
        }

        if (array[index].name === 'dateOther') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['encoding'] !== undefined) {
                    originInfo += '<dateOther encoding="' + array[index].attr['encoding'] + '">';
                } else if (array[index].attr['point'] !== undefined) {
                    originInfo += '<dateOther point="' + array[index].attr['point'] + '">';
                } else if (array[index].attr['keyDate'] !== undefined) {
                    originInfo += '<dateOther keyDate="' + array[index].attr['keyDate'] + '">';
                } else if (array[index].attr['qualifier'] !== undefined) {
                    originInfo += '<dateOther qualifier="' + array[index].attr['qualifier'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<dateOther lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<dateOther>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</dateOther>';
            }
        }

        if (array[index].name === 'edition') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['supplied'] !== undefined) {
                    originInfo += '<edition supplied="' + array[index].attr['supplied'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<edition lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<edition>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</edition>';
            }
        }

        if (array[index].name === 'issuance') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                originInfo += '<issuance>';
                originInfo += array[index].val.trim();
                originInfo += '</issuance>';
            }
        }

        if (array[index].name === 'frequency') {

            if (array[index].val !== undefined && array[index].val.length !== 0) {

                if (array[index].attr['authority'] !== undefined) {
                    originInfo += '<frequency authority="' + array[index].attr['authority'] + '">';
                } else if (array[index].attr['lang'] !== undefined) {
                    originInfo += '<frequency lang="' + array[index].attr['lang'] + '">';
                } else {
                    originInfo += '<frequency>';
                }

                originInfo += array[index].val.trim();
                originInfo += '</frequency>';
            }
        }
    });

    originInfo += '</originInfo>';

    return originInfo;
};