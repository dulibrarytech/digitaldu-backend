'use strict';

var xmldoc = require('xmldoc'),
    _ = require('lodash');

exports.process_mets = function (sip_uuid, xml) {

    var document = new xmldoc.XmlDocument(xml),
        Obj = {},
        Arr = [];

    document.eachChild(function (child, index, array) {

        if (array[index].name === 'mets:fileSec') {

            if (array[index].children[1].name === 'mets:fileGrp') {

                for (var i=0;i<array[index].children[1].children.length;i++) {

                    if (array[index].children[1].children[i].name === 'mets:file') {
                        // get file ids
                        Obj.uuid = array[index].children[1].children[i].attr.ID.replace(/file-/g,'');
                        Obj.sip_uuid = sip_uuid;

                        for (var k=0;k<array[index].children[1].children[i].children.length;k++) {
                            // get file names
                            if (array[index].children[1].children[i].children[k].name === 'mets:FLocat') {
                                Obj.file = array[index].children[1].children[i].children[k].attr['xlink:href'].replace(/objects\//g, '');
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