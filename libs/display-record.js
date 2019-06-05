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
    record.handle = obj.handle;
    record.thumbnail = obj.thumbnail;
    record.object = obj.file_name;
    record.mime_type = obj.mime_type;
    record.entry_id = obj.entry_id;

    metadata = JSON.parse(mods);

    if (obj.object_type !== undefined) {
        record.object_type = obj.object_type;
    }

    if (metadata.title !== undefined || metadata.title !== null) {
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

    // TODO: refactor... drill into notes field
    if (metadata.notes !== undefined) {

        let notes = metadata.notes;

        for (let i=0;i<notes.length;i++) {
            if (notes[i].type !== undefined && notes[i].type === 'abstract') {
                record.abstract = notes[i].content;
            }
        }
    }

    // TODO: find in archivespace record
    if (metadata.type !== undefined) {
        record.type = metadata.type;
    }

    record.display_record = JSON.parse(obj.mods);

    callback(JSON.stringify(record));
};