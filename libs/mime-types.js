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

/**
 * Returns mime type based on file extension
 * @param file
 * @returns {null}
 */
exports.get_mime_type = function (file) {

    let mime_type;

    if (file.indexOf('tif') !== -1) {
        mime_type = 'image/tiff';
    }

    if (file.indexOf('pdf') !== -1) {
        mime_type = 'application/pdf';
    }

    if (file.indexOf('wav') !== -1) {
        mime_type = 'audio/x-wav';
    }

    if (file.indexOf('mp4') !== -1) {
        mime_type = 'video/mp4';
    }

    if (file.indexOf('mov') !== -1) {
        mime_type = 'video/quicktime';
    }

    return mime_type;
};