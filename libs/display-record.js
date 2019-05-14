/**
 * Creates index/metadata display record
 * @param obj
 * @param callback
 */
exports.create_display_record = function (obj, callback) {

    'use strict';

    let mods = obj.mods,
        record = {},
        metadata;

    record.pid = obj.pid;
    record.is_member_of_collection = obj.is_member_of_collection;
    record.object_type = 'object';
    record.handle = obj.handle;
    record.thumbnail = obj.thumbnail;
    record.object = obj.file_name;
    record.mime_type = obj.mime_type;

    metadata = JSON.parse(mods);

    if (metadata.title !== undefined) {
        record.title = metadata.title;
    }

    if (metadata.creator !== undefined) {
        record.creator = metadata.creator;
    }

    if (metadata.subjects !== undefined) {
        let subjectsArr = [];
        for (let i=0;i<metadata.subjects.length;i++) {
            subjectsArr.push(metadata.subjects[i].title);
        }

        record.f_subjects = subjectsArr;
    }

    if (metadata.abstract !== undefined) {
        record.abstract = metadata.abstract;
    }

    if (metadata.type !== undefined) {
        record.type = metadata.type;
    }

    record.display_record = JSON.parse(obj.mods);

    callback(JSON.stringify(record));
};