'use strict';

var xmldoc = require('xmldoc');

exports.process_mods = function (xml) {

    var getTitleInfo = require('../../libs/mods/titleinfo_mods'),
        getName = require('../../libs/mods/name_mods'),
        getTypeOfResource = require('../../libs/mods/typeofresource_mods'),
        getGenre = require('../../libs/mods/genre_mods'),
        getOriginInfo = require('../../libs/mods/origininfo_mods'),
        getLanguage = require('../../libs/mods/language_mods'),
        getPhysicalDescription = require('../../libs/mods/physicaldescription_mods'),
        getAbstract = require('../../libs/mods/abstract_mods'),
        getTableOfContents = require('../../libs/mods/tableofcontents_mods'),
        getTargetAudience = require('../../libs/mods/targetaudience_mods'),
        getNote = require('../../libs/mods/note_mods'),
        getSubject = require('../../libs/mods/subject_mods'),
        getClassification = require('../../libs/mods/classification_mods'),
        getRelatedItem = require('../../libs/mods/relateditem_mods'),
        getIdentifier = require('../../libs/mods/identifier_mods'),
        getLocation = require('../../libs/mods/location_mods'),
        getAccessCondition = require('../../libs/mods/accesscondition_mods'),
        getPart = require('../../libs/mods/part_mods'),
        getExtension = require('../../libs/mods/extension_mods'),
        getRecordInfo = require('../../libs/mods/recordinfo_mods');

    var document = new xmldoc.XmlDocument(xml);

//========================MODS=============================================//
    var mods = '<mods xmlns="http://www.loc.gov/mods/v3" xmlns:mods="http://www.loc.gov/mods/v3" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
    var titleInfo = '',
        name = '',
        typeOfResource = '',
        genre = '',
        originInfo = '',
        language = '',
        physicalDescription = '',
        abstract = '',
        tableOfContents = '',
        targetAudience = '',
        note = '',
        subject = '',
        classification = '',
        relatedItem = '',
        identifier = '',
        location = '',
        accessCondition = '',
        part = '',
        extension = '',
        recordInfo = '';

    document.eachChild(function (child, index, array) {

        //========================TITLEINFO=============================================//
        if (array[index].name === 'titleInfo') {
            titleInfo += getTitleInfo.titleInfo(array, index);
        }

        //========================NAME=============================================//
        if (array[index].name === 'name') {
            name += getName.name(array, index);
        }

        //==========================TYPEOFRESOURCE===========================================//
        if (array[index].name === 'typeOfResource') {
            typeOfResource += getTypeOfResource.typeOfResource(array, index);
        }

        //==========================GENRE===========================================//
        if (array[index].name === 'genre') {
            genre += getGenre.genre(array, index);
        }

        //==========================ORIGININFO===========================================//
        if (array[index].name === 'originInfo') {
            originInfo += getOriginInfo.origininfo(array, index);
        }

        //==========================LANGUAGE===========================================//
        if (array[index].name === 'language') {
            language += getLanguage.language(array, index);
        }

        //==========================PHYSICALDESCRIPTION===========================================//
        if (array[index].name === 'physicalDescription') {
            physicalDescription += getPhysicalDescription.physicalDescription(array, index);
        }

        //==========================ABSTRACT===========================================//
        if (array[index].name === 'abstract') {
            abstract += getAbstract.abstract(array, index);
        }

        //==========================TABLEOFCONTENTS===========================================//
        if (array[index].name === 'tableOfContents') {
            tableOfContents += getTableOfContents.tableOfContents(array, index);
        }

        //==========================TARGETAUDIENCE===========================================//
        if (array[index].name === 'targetAudience') {
            targetAudience += getTargetAudience.targetAudience(array, index);
        }

        //==========================NOTE===========================================//
        if (array[index].name === 'note') {
            note += getNote.note(array, index);
        }

        //==========================SUBJECT===========================================//
        if (array[index].name === 'subject') {
            subject += getSubject.subject(array, index);
        }

        //==========================CLASSIFICATION===========================================//
        if (array[index].name === 'classification') {
            classification += getClassification.classification(array, index);
        }

        //==========================RELATEDITEM===========================================//
        if (array[index].name === 'relatedItem') {
            relatedItem += getRelatedItem.relatedItem(array, index);
        }

        //==========================IDENTIFIER===========================================//
        if (array[index].name === 'identifier') {
            identifier += getIdentifier.identifier(array, index);
        }

        //==========================LOCATION===========================================//
        if (array[index].name === 'location') {
            location += getLocation.location(array, index);
        }

        //==========================ACCESSCONDITION===========================================//
        if (array[index].name === 'accessCondition') {
            accessCondition += getAccessCondition.accessCondition(array, index);
        }

        //==========================PART===========================================//
        if (array[index].name === 'part') {
            part += getPart.part(array, index);
        }

        //==========================EXTENSION===========================================//
        if (array[index].name === 'extension') {
            extension += getExtension.extension(array, index);
        }

        //==========================RECORDINFO===========================================//
        if (array[index].name === 'recordInfo') {
            recordInfo += getRecordInfo.recordInfo(array, index);
        }
    });

    mods += titleInfo;
    mods += name;
    mods += typeOfResource;
    mods += genre;
    mods += originInfo;
    mods += language;
    mods += physicalDescription;
    mods += abstract;
    mods += tableOfContents;
    mods += targetAudience;
    mods += note;
    mods += subject;
    mods += classification;
    mods += relatedItem;
    mods += identifier;
    mods += location;
    mods += accessCondition;
    mods += part;
    mods += extension;
    mods += recordInfo;
    mods += '</mods>';

    return mods;
};