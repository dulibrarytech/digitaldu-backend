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

const XMLDOC = require('xmldoc');

/**
 * Parses out chunk info from XML and constructs object containing video chunk references in duracloud
 * @param xml
 * @returns {Array}
 */
exports.process_manifest = function (xml) {

    let document = new XMLDOC.XmlDocument(xml),
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