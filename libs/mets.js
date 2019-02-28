'use strict';

var xmldoc = require('xmldoc'),
    _ = require('lodash');

exports.process_mets = function (sip_uuid, dip_path, xml) {

    var document = new xmldoc.XmlDocument(xml),
        Obj = {},
        Arr = [];


    // console.log('METS DOC: ', document.children);

    document.eachChild(function (child, index, array) {

        // console.log(array[index].name);

        if (array[index].name === 'mets:fileSec') {

            if (array[index].children[1].name === 'mets:fileGrp') {

                for (var i = 0; i < array[index].children[1].children.length; i++) {

                    if (array[index].children[1].children[i].name === 'mets:file') {

                        for (var k = 0; k < array[index].children[1].children[i].children.length; k++) {
                            // get file id and names
                            if (array[index].children[1].children[i].children[k].name === 'mets:FLocat') {

                                var tmpArr = array[index].children[1].children[i].children[k].attr['xlink:href'].replace(/objects\//g, '').split('.'),
                                    file_id;

                                var ext = tmpArr.pop();

                                file_id = tmpArr.join('.');

                                Obj.uuid = array[index].children[1].children[i].attr.ID.replace(/file-/g, '');
                                Obj.sip_uuid = sip_uuid;
                                Obj.dip_path = dip_path;
                                Obj.pid = '---';
                                Obj.handle = '---';
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