/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

const XMLDOC = require('xmldoc'),
    _ = require('lodash');

exports.process_mets = function (sip_uuid, dip_path, xml) {

    let document = new XMLDOC.XmlDocument(xml),
        Obj = {},
        Arr = [],
        mime_type;

    document.eachChild(function (child, index, array) {

        // get mime type for wav, mp4 and tiff files
        if (array[index].name === 'mets:amdSec') {

            let techMD = array[index].childNamed('mets:techMD'),
                mdWrap = techMD.childNamed('mets:mdWrap'),
                xmlData = mdWrap.childNamed('mets:xmlData'),
                premisObject = xmlData.childNamed('premis:object'),
                premisObjectCharacteristics = premisObject.childNamed('premis:objectCharacteristics'),
                premisObjectCharacteristicsExtension = premisObjectCharacteristics.childNamed('premis:objectCharacteristicsExtension');

            if (premisObjectCharacteristicsExtension !== undefined && premisObjectCharacteristicsExtension.childNamed('rdf:RDF') !== undefined) {
                let rdfDescription = premisObjectCharacteristicsExtension.childNamed('rdf:RDF').childNamed('rdf:Description');
                mime_type = rdfDescription.childNamed('File:MIMEType').val;
            }

            // get mime type for pdf files
            if (premisObjectCharacteristicsExtension !== undefined && premisObjectCharacteristicsExtension.childNamed('fits') !== undefined) {

                let fits = premisObjectCharacteristicsExtension.childNamed('fits');
                let toolOutput = fits.childNamed('toolOutput'),
                    tool = toolOutput.childNamed('tool'),
                    fileUtilityOutput = tool.childNamed('fileUtilityOutput'),
                    mimeType = fileUtilityOutput.childNamed('mimetype').val;

                if (mimeType === 'application/pdf') {
                    mime_type = mimeType;
                }
            }
        }

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
                                Obj.mime_type = mime_type;

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