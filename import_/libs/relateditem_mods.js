'use strict';

var getTitleInfo = require('../../import/libs/titleinfo_mods'),
    getName = require('../../import/libs/name_mods'),
    getTypeOfResource = require('../../import/libs/typeofresource_mods'),
    getGenre = require('../../import/libs/genre_mods'),
    getLanguage = require('../../import/libs/language_mods'),
    getPhysicalDescription = require('../../import/libs/physicaldescription_mods'),
    getAbstract = require('../../import/libs/abstract_mods'),
    getTableOfContents = require('../../import/libs/tableofcontents_mods'),
    getTargetAudience = require('../../import/libs/targetaudience_mods'),
    getSubject = require('../../import/libs/subject_mods'),
    getOriginInfo = require('../../import/libs/origininfo_mods'),
    getClassification = require('../../import/libs/classification_mods'),
    getRelatedItem = require('../../import/libs/relateditem_mods'),
    getIdentifier = require('../../import/libs/identifier_mods'),
    getLocation = require('../../import/libs/location_mods'),
    getAccessCondition = require('../../import/libs/accesscondition_mods'),
    getPart = require('../../import/libs/part_mods'),
    getExtension = require('../../import/libs/extension_mods'),
    getRecordInfo = require('../../import/libs/recordinfo_mods');

exports.relatedItem = function (array, index) {

    var relatedItem = '';

    // console.log(array[index].children[1].children[1].children[1].val);

    if (array[index].children[1] === undefined) {
        return relatedItem;
    }

    if (array[index].children[1].children[1] === undefined) {
        return relatedItem;
    }

    if (array[index].children[1].children[1].children[1] === undefined) {
        return relatedItem;
    }

    if (array[index].children[1].children[1].children[1].val === undefined || array[index].children[1].children[1].children[1].val.length === 0) {
        return relatedItem;
    }

    if (array[index].attr['objectPart'] !== undefined) {
        relatedItem += '<relatedItem objectPart="' + array[index].attr['objectPart'].toLowerCase() + '">';
    } else if (array[index].attr['lang'] !== undefined) {
        relatedItem += '<relatedItem lang="' + array[index].attr['lang'].toLowerCase() + '">';
    } else if (array[index].attr['displayLabel'] !== undefined) {
        relatedItem += '<relatedItem displayLabel="' + array[index].attr['displayLabel'].toLowerCase() + '">';
    } else if (array[index].attr['usage'] !== undefined) {
        relatedItem += '<relatedItem usage="' + array[index].attr['usage'].toLowerCase() + '">';
    } else if (array[index].attr['altRepGroup'] !== undefined) {
        relatedItem += '<relatedItem altRepGroup="' + array[index].attr['altRepGroup'].toLowerCase() + '">';
    } else {
        relatedItem += '<relatedItem>';
    }

    array[index].eachChild(function (child, index, array) {

        //==========TITLEINFO==========//
        if (array[index].name === 'titleInfo') {
            var titleInfo = getTitleInfo.titleInfo(array, index);

            if (titleInfo.length !== 0) {
                relatedItem += titleInfo;
            }
        }

        //==========NAME==========//
        if (array[index].name === 'name') {
            var name = getName.name(array, index);

            if (name.length !== 0) {
                relatedItem += name;
            }
        }

        //==========TYPEOFRESOURCE==========//
        if (array[index].name === 'typeOfResource') {
            var typeOfResource = getTypeOfResource.typeOfResource(array, index);

            if (typeOfResource.length !== 0) {
                relatedItem += typeOfResource;
            }
        }

        //==========GENRE==========//
        if (array[index].name === 'genre') {
            var genre = getGenre.genre(array, index);

            if (genre.length !== 0) {
                relatedItem += genre;
            }
        }

        //==========ORIGININFO==========//
        if (array[index].name === 'originInfo') {
            var originInfo = getOriginInfo.origininfo(array, index);

            if (originInfo.length !== 0) {
                relatedItem += originInfo;
            }
        }

        //==========LANGUAGE==========//
        if (array[index].name === 'language') {
            var language = getLanguage.language(array, index);

            if (language.length !== 0) {
                relatedItem += language;
            }
        }

        //==========PHYSICALDESCRIPTION==========//
        if (array[index].name === 'physicalDescription') {
            var physicalDescription = getPhysicalDescription.physicalDescription(array, index);

            if (physicalDescription.length !== 0) {
                relatedItem += physicalDescription;
            }
        }

        //==========ABSTRACT==========//
        if (array[index].name === 'abstract') {
            var abstract = getAbstract.abstract(array, index);

            if (abstract.length !== 0) {
                relatedItem += abstract;
            }
        }

        //==========TABLEOFCONTENTS==========//
        if (array[index].name === 'tableOfContents') {
            var tableOfContents = getTableOfContents.tableOfContents(array, index);

            if (tableOfContents.length !== 0) {
                relatedItem += tableOfContents;
            }
        }

        //==========TARGETAUDIENCE==========//
        if (array[index].name === 'targetAudience') {
            var targetAudience = getTargetAudience.targetAudience(array, index);

            if (targetAudience.length !== 0) {
                relatedItem += targetAudience;
            }
        }

        //==========SUBJECT==========//
        if (array[index].name === 'subject') {
            var subject = getSubject.subject(array, index);

            if (subject.length !== 0) {
                relatedItem += subject;
            }
        }

        //==========================CLASSIFICATION===========================================//
        if (array[index].name === 'classification') {
            var classification = getClassification.classification(array, index);

            if (classification.length !== 0) {
                relatedItem += classification;
            }
        }

        //==========================RELATEDITEM===========================================//
        /*
        if (array[index].name === 'relatedItem') {
            var relatedItem = getRelatedItem.relatedItem(array, index);
            console.log(relatedItem);
            if (relatedItem.length !== 0) {
                relatedItem += relatedItem;
            }
        }
        */

        //==========================IDENTIFIER===========================================//
        if (array[index].name === 'identifier') {
            var identifier = getIdentifier.identifier(array, index);

            if (identifier.length !== 0) {
                relatedItem += identifier;
            }
        }

        //==========================LOCATION===========================================//
        if (array[index].name === 'location') {
            var location = getLocation.location(array, index);

            if (location.length !== 0) {
                relatedItem += location;
            }
        }

        //==========================ACCESSCONDITION===========================================//
        if (array[index].name === 'accessCondition') {
            var accessCondition = getAccessCondition.accessCondition(array, index);

            if (accessCondition.length !== 0) {
                relatedItem += accessCondition;
            }
        }

        //==========================PART===========================================//
        if (array[index].name === 'part') {
            var part = getPart.part(array, index);

            if (part.length !== 0) {
                relatedItem += part;
            }
        }

        //==========================EXTENSION===========================================//
        /*
        if (array[index].name === 'extension') {
            var extension = getExtension.extension(array, index);

            if (extension.length !== 0) {
                relatedItem += extension;
            }
        }
        */

        //==========================RECORDINFO===========================================//
        /*
        if (array[index].name === 'recordInfo') {
            var recordInfo = getRecordInfo.recordInfo(array, index);

            if (recordInfo.length !== 0) {
                relatedItem += recordInfo;
            }
        }
        */
    });

    relatedItem += '</relatedItem>';

    return relatedItem;
};