'use strict';

var xmldoc = require('xmldoc');

exports.process_mets = function (xml) {

    var document = new xmldoc.XmlDocument(xml);

    document.eachChild(function (child, index, array) {

        if (array[index].name === 'mets:fileSec') {

            if (array[index].children[1].name === 'mets:fileGrp') {
                for (var i=0;i<array[index].children[1].children.length;i++) {

                    if (array[index].children[1].children[i].name === 'mets:file') {
                        // get file ids
                        // console.log(array[index].children[1].children[i].attr.ID);
                        console.log(array[index].children[1].children[i].attr.ID.replace(/file-/g,''));

                        for (var k=0;k<array[index].children[1].children[i].children.length;k++) {
                            // get file names
                            if (array[index].children[1].children[i].children[k].name === 'mets:FLocat') {
                                // console.log(array[index].children[1].children[i].children[k].attr['xlink:href']);
                                console.log(array[index].children[1].children[i].children[k].attr['xlink:href'].replace(/objects\//g, ''));
                            }
                        }
                   }
                }
            }
        }
    });
};