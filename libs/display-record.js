const config = require('../config/config'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    }),
    REPO_OBJECTS = 'tbl_objects',
    TIMER = 550;

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
        var subjectsArr = [];
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

/**
 * Creates display records
 * @param pid

exports.create_display_record_old = function (pid) {

    'use strict';

    knex.select('is_member_of_collection', 'pid', 'mods', 'mime_type', 'object_type', 'handle', 'thumbnail', 'file_name')
        .from(REPO_OBJECTS)
        .where({
            pid: pid
        })
        .then(function (data) {

            if (data.length === 0) {
                console.log('no data.');
                return false;
            }

            let timer0 = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer0);
                    return false;
                }

                let xml = data.pop();

                if (xml.pid === null) {
                    return false;
                }

                parseString(xml.mods, function (error, result) {

                    if (error) {
                        console.log(error);
                        throw error;
                    }

                    if (result.mods === undefined) {
                        console.log(result);
                        throw 'MODS not found.';
                    }

                    let doc = modsToJson(result, xml);

                    if (doc === undefined) {
                        console.log('Unable to create doc.');
                        throw 'Unable to create doc.';
                    }

                    saveDisplayRecord(doc, xml);
                });

            }, TIMER);
        })
        .catch(function (error) {
            console.error(error);
            throw error;
        });
};
 */

/** TODO: figure if this is still needed.
 * Creates display records for all repo objects
 */
exports.create_display_records = function () {

    'use strict';

    let timer0 = setInterval(function () {

        knex.select('pid')
            .from(REPO_OBJECTS)
            .where({
                q_status: 0
            })
            .limit(1)
            .then(function (data) {

                if (data.length === 0) {

                    clearInterval(timer0);

                    // reset
                    knex(REPO_OBJECTS)
                        .update({
                            q_status: 0
                        })
                        .then(function (data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.error(error);
                            throw error;
                        });

                    return false;
                }

                let record = data.pop();
                exports.create_display_record(record.pid);

                knex(REPO_OBJECTS)
                    .where({
                        pid: record.pid
                    })
                    .update({
                        q_status: 1
                    })
                    .then(function (data) {
                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database display record queue error';
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        throw error;
                    });

                return null;

            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });

    }, TIMER);
};

/**
 * Saves display record to repo db
 * @param doc
 * @param xml
 */
var saveDisplayRecord = function (doc, xml) {

    'use strict';

    knex(REPO_OBJECTS)
        .where({
            pid: xml.pid
        })
        .update({
            display_record: JSON.stringify(doc)  // display_record
        })
        .then(function (data) {
            if (data !== 1) {
                // TODO: log update error
                console.log(data);
                throw 'Database display record error';
            }
        })
        .catch(function (error) {
            console.error(error);
            throw error;
        });
};