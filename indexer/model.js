'use strict';

var request = require('request'),
    Config = require('../config/config'),
    es = require('elasticsearch'),
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: Config.dbHost,
            user: Config.dbUser,
            password: Config.dbPassword,
            database: Config.dbName
        }
    }),
    client = new es.Client({
        host: Config.elasticSearch,
        log: 'trace'
    });

exports.index_data = function (req, callback) {

    if (req.query.pid !== undefined) {
        var pid = req.query.pid;
    }

    var type = req.query.type;

    switch (type) {
        case 'single':
            index_single(pid, function (data) {

                if (data === 'error') {
                    callback({
                        status: 200,
                        content_type: {'Content-Type': 'application/json'},
                        message: 'An error has occurred.'
                    });
                }

                callback(data);
            });

            break;
        case 'all':
            index_all();

            callback({
                status: 200,
                content_type: {'Content-Type': 'application/json'},
                message: 'Indexing all records'
            });

            break;
        default:

            callback({
                status: 404
            });

            break;
    }
};

var index_single = function (pid, callback) {

    knex('tbl_metadata')
        .join('tbl_object_data', 'tbl_metadata.pid', 'tbl_object_data.pid')
        .join('tbl_rels', 'tbl_object_data.pid', 'tbl_rels.pid')
        .join('tbl_collections', 'tbl_rels.is_member_of_collection', 'tbl_collections.pid')
        .select('tbl_metadata.pid', 'tbl_metadata.display_record', 'tbl_object_data.mime_type', 'tbl_object_data.file_size', 'tbl_rels.is_member_of_collection', 'tbl_rels.is_member_of', 'tbl_rels.is_compound', 'tbl_collections.title', 'tbl_collections.description', 'tbl_collections.is_member_of')
        .where('tbl_metadata.pid', pid)
        .then(function (data) {

            var pid_temp = data[0].pid.split(':');
            var id = pid_temp[1];
            var record = JSON.parse(data[0].display_record);
            var title = '';
            var subject = [];
            var creator = '';
            var description = '';
            var type = '';
            var notes = '';

            // console.log(record);

            if (record.title !== undefined) {
                record.title.toString();
            }

            if (record.subjectTopic !== undefined) {
                subject.push(record.subjectTopic.toString());
            }

            if (record.subjectGenre !== undefined) {
                subject.push(record.subjectGenre.toString());
            }

            if (record.subjectName !== undefined) {
                subject.push(record.subjectName.toString());
            }

            if (record.subjectGeographic !== undefined) {
                subject.push(record.subjectGeographic.toString());
            }

            if (record.subjectTemporal !== undefined) {
                subject.push(record.subjectTemporal.toString());
            }

            if (record.subjectOccupation !== undefined) {
                subject.push(record.subjectOccupation.toString());
            }

            if (record.creator !== undefined) {
                creator = record.creator;
            }

            if (record.abstract !== undefined) {
                description = record.abstract;
            }

            if (record.typeOfResource !== undefined) {
                type = record.typeOfResource;
            }

            if (record.note !== undefined) {
                notes = record.note;
            }

            data[0].title = title;
            data[0].subject = subject;
            data[0].creator = creator;
            data[0].modsDescription = description;
            data[0].type = type;
            data[0].notes = notes;

            console.log(data[0]);

            client.index({
                index: Config.elasticSearchIndex,
                type: 'data',
                id: id,
                body: data[0]
            }, function (err, response) {
                if (err) {
                    console.log(err);
                }

                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: response,
                    message: 'Record indexed'
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
};

var index_all = function () {

    knex('tbl_metadata')
        .update({
            is_indexed: 0
        })
        .then(function (data) {
            get_index_data();
            return null;
        })
        .catch(function (error) {
            console.log(error);
        });
};

var get_index_data = function () {

    knex('tbl_metadata')
        .where({
            is_active: 1,
            is_indexed: 0
        })
        .limit(1)
        .select('pid')
        .then(function (data) {

            if (data.length < 1) {
                console.log('complete');
                return null;
            }

            index_record(data[0].pid);
            return null;
        })
        .catch(function (error) {
            console.log(error);
        });

};

var index_record = function (pid) {

    request(Config.host + 'indexer?pid=' + pid + '&type=single', function (error, response, body) {
        if (error) {
            console.log(error);
        }

        var result = JSON.parse(body);

        if (result.status === 200) {

            setTimeout(function () {

                knex('tbl_metadata')
                    .where({
                        pid: pid
                    })
                    .update({
                        is_indexed: 1
                    })
                    .then(function (data) {

                        if (data !== 1) {
                            return null;
                        }

                        get_index_data();
                        return null;
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }, 1000);

        } else {
            // TODO: handle request failure
        }
    });
};