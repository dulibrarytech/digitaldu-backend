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
        host: Config.elasticSearch
    }),
    REPO_OBJECTS = 'tbl_objects';

exports.index_record = function (req, callback) {

    if (req.body.sip_uuid === undefined) {
        callback({
            status: 400,
            content_type: {'Content-Type': 'application/json'},
            message: 'missing sip uuid.'
        });

        return false;
    }

    var sip_uuid = req.body.sip_uuid;

    knex(REPO_OBJECTS)
        .select('display_record')
        .where({
            sip_uuid: sip_uuid
        })
        .then(function (data) {

            var record = JSON.parse(data[0].display_record);
            // TODO: test with authority value...
            // delete record.display_record.language.authority;
            record.display_record.t_language = record.display_record.language;
            delete record.display_record.language;

            client.index({
                index: Config.elasticSearchIndex,
                type: 'data',
                id: record.pid.replace('codu:', ''),
                body: record
            }, function (error, response) {

                if (error) {
                    console.log(error);
                }

                callback({
                    status: 200,
                    content_type: {'Content-Type': 'application/json'},
                    data: response,
                    message: sip_uuid + ' record indexed'
                });
            });

        })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
};