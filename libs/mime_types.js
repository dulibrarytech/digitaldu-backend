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

    return mime_type;
};