'use strict';

const xmldoc = require('xmldoc'),
    _ = require('lodash');

exports.process_mets = function (sip_uuid, dip_path, xml) {

    let document = new xmldoc.XmlDocument(xml),
        Obj = {},
        Arr = [];

    document.eachChild(function (child, index, array) {

        // get mime type
        /*
        if (array[index].name === 'mets:amdSec') {

            let techMD = array[index].childNamed("mets:techMD");
            let mdWrap = techMD.childNamed("mets:mdWrap");
            let xmlData = mdWrap.childNamed("mets:xmlData");
            let premisObject = xmlData.childNamed("premis:object");
            let premisObjectCharacteristics = premisObject.childNamed("premis:objectCharacteristics");
            let premisObjectCharacteristicsExtension = premisObjectCharacteristics.childNamed("premis:objectCharacteristicsExtension");

            // console.log(premisObjectCharacteristicsExtension.children);

            if (premisObjectCharacteristicsExtension.childNamed("rdf:RDF") !== undefined) {
                let rdfDescription = premisObjectCharacteristicsExtension.childNamed("rdf:RDF").childNamed("rdf:Description");
                Obj.mime_type = rdfDescription.childNamed("File:MIMEType").val;
            }
        }
        */

        // gets file information TODO: refactor to make use of xmldoc methods
        if (array[index].name === 'mets:fileSec') {

            if (array[index].children[1].name === 'mets:fileGrp') {

                for (let i = 0; i < array[index].children[1].children.length; i++) {

                    if (array[index].children[1].children[i].name === 'mets:file') {

                        for (let k = 0; k < array[index].children[1].children[i].children.length; k++) {
                            // get file id and names
                            if (array[index].children[1].children[i].children[k].name === 'mets:FLocat') {

                                let tmpArr = array[index].children[1].children[i].children[k].attr['xlink:href'].replace(/objects\//g, '').split('.'),
                                    file_id,
                                    ext = tmpArr.pop();

                                file_id = tmpArr.join('.');

                                Obj.uuid = array[index].children[1].children[i].attr.ID.replace(/file-/g, '');
                                Obj.sip_uuid = sip_uuid;
                                Obj.dip_path = dip_path;
                                Obj.file = array[index].children[1].children[i].children[k].attr['xlink:href'].replace(/objects\//g, '');
                                Obj.message = 'PROCESSING_IMPORT';
                                Obj.file_id = file_id;

                                if (ext === 'txt') {
                                    Obj.type = 'txt';
                                } else {
                                    Obj.type = 'object';
                                }
                            }
                        }
                    }

                    if (!_.isEmpty(Obj)) {
                        Arr.push(Obj);
                        Obj = {};
                    }
                }
            }
        }
    });

    return Arr;
};