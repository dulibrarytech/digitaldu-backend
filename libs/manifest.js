'use strict';

const xmldoc = require('xmldoc');

/**
 * Parses out chunk info from XML and constructs object containing video chunk references in duracloud
 * @param xml
 * @returns {Array}
 */
exports.process_manifest = function (xml) {

    let document = new xmldoc.XmlDocument(xml),
        chunks = document.childNamed('chunks'),
        arr = [],
        obj = {};

    let header = document.childNamed('header'),
        sourceContent = header.childNamed('sourceContent');

    obj.checksum = sourceContent.childNamed('md5').val;
    obj.file_size = sourceContent.childNamed('byteSize').val;

    for (let i=0;i<chunks.children.length;i++) {

        if (chunks.children[i].attr !== undefined) {

            let chunk_url = chunks.children[i].attr.chunkId,
                tmp = chunk_url.split('.'),
                prop = tmp[tmp.length - 1];

            obj[prop] = chunk_url;
            arr.push(obj);
            obj = {};
        }
    }

    return arr;
};