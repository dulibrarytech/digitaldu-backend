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

const DB = require('../config/db_config')();
const DB_QUEUE = require('../config/dbqueue_config')();
const DB_TABLES = require('../config/db_tables_config')();
const CACHE = require('../libs/cache');
const HELPER_TASKS = require('../libs/helper');
const METADATA_TASKS = require('../import/tasks/metadata_tasks');
const INDEXER_TASKS = require('../indexer/tasks/indexer_index_tasks');
const ES_TASKS = require("../libs/elasticsearch");
const LOGGER = require('../libs/log4');

/**
 * Initiates metadata updates
 * @param uuid
 * @param callback
 */
exports.update_metadata = function (uuid, callback) {

    try {

        (async () => {

            LOGGER.module().info('INFO: [/import/model (update_metadata)] Queuing records.');
            const HELPER_TASK = new HELPER_TASKS();
            const METADATA = new METADATA_TASKS(DB, DB_QUEUE, DB_TABLES);
            const batch_uuid = HELPER_TASK.create_uuid();
            const type = await DB(DB_TABLES.repo.repo_records)
            .select('object_type')
            .where({
                pid: uuid,
                is_active: 1
            });

            if (type[0].object_type === 'collection') {

                const record = await METADATA.get_db_record(uuid);

                let collection_record = {
                    batch_uuid: batch_uuid,
                    pid: uuid,
                    uri: record[0].uri
                };

                const records = await METADATA.get_collection_child_records(uuid);
                let batch = [];
                records.push(collection_record);

                for (let i=0;i<records.length;i++) {
                    batch.push({
                        batch_uuid: batch_uuid,
                        uri: records[i].uri,
                        uuid: records[i].pid,
                        update_type: 'collection',
                        status: 'PENDING',
                        error: 'NONE'
                    });
                }

                await METADATA.queue_metadata(batch);
                LOGGER.module().info('INFO: [/import/model (update_metadata)] Records queued.');

            } else if (type[0].object_type === 'object') {

                const record = await METADATA.get_db_record(uuid);

                const batch = {
                    batch_uuid: batch_uuid,
                    uuid: uuid,
                    uri: record[0].uri,
                    update_type: 'single',
                    status: 'PENDING',
                    error: 'NONE'
                };

                await METADATA.queue_metadata(batch);
                LOGGER.module().info('INFO: [/import/model (update_metadata)] Record queued.');
            }

            await process_metadata_update_queue(batch_uuid, METADATA);

        })();

    } catch (error) {
        LOGGER.module().error('ERROR: [/import/model module (update_collection)] Unable to queue update records ' + error.message);
    }

    callback({
        status: 201,
        message: 'Records queued for updates'
    });
};

/**
 * Processes queue records
 * @param batch_uuid
 * @param METADATA
 */
async function process_metadata_update_queue(batch_uuid, METADATA) {

    const ES = new ES_TASKS();
    const OBJ = ES.get_es();
    const REINDEX_BACKEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_back);
    const REINDEX_FRONTEND_TASK = new INDEXER_TASKS(DB, DB_TABLES.repo.repo_records, OBJ.es_client, OBJ.es_config.elasticsearch_index_front);
    const token = await METADATA.get_session_token();

    let queue_timer = setInterval(async () => {

        try {

            LOGGER.module().info('INFO: [/import/model (process_metadata_update_queue)] Processing record.');
            let record = await METADATA.get_queue_record(batch_uuid);

            if (record === 0) {
                clearInterval(queue_timer);
                CACHE.clear_cache();
                await METADATA.destroy_session_token(token);
                LOGGER.module().info('INFO: [/import/model (process_metadata_update_queue)] Record updates complete.');
                return false;
            }

            const metadata = await METADATA.get_metadata(record.uri, token);
            let is_updated;

            if (metadata !== false) {

                LOGGER.module().info('INFO: [/import/model (process_metadata_update_queue)] Processing queue record.');

                const update_core_record = JSON.stringify(metadata);

                is_updated = await METADATA.update_db_record(record.uuid, {
                    mods: update_core_record
                });

                const update_index_record = await METADATA.get_db_record(record.uuid);
                let display_record = JSON.parse(update_index_record[0].display_record);

                if (metadata.is_compound === false) {

                    display_record.display_record = metadata;

                    await DB(DB_TABLES.repo.repo_records)
                    .where({
                        pid: record.uuid
                    })
                    .update({
                        compound_parts: '[]',
                        is_compound: 0
                    });

                    is_updated = await METADATA.update_db_record(record.uuid, {
                        display_record: JSON.stringify(display_record)
                    });

                } else if (metadata.is_compound === true) {

                    const compound_parts = display_record.display_record.parts;
                    metadata.parts = compound_parts;
                    display_record.display_record = metadata;

                    await DB(DB_TABLES.repo.repo_records)
                    .where({
                        pid: record.uuid
                    })
                    .update({
                        compound_parts: JSON.stringify(compound_parts),
                        is_compound: 1
                    });

                    is_updated = await METADATA.update_db_record(record.uuid, {
                        display_record: JSON.stringify(display_record)
                    });
                }

                await METADATA.update_metadata_queue({
                    uri: record.uri
                }, {
                    status: 'RECORD_UPDATED',
                    is_updated: 1
                });

                await REINDEX_BACKEND_TASK.index_record(display_record);

                if (display_record.is_published === 1) {
                    await REINDEX_FRONTEND_TASK.index_record(display_record);
                }

                await METADATA.update_metadata_queue({
                    uri: record.uri
                }, {
                    status: 'COMPLETE',
                    is_indexed: 1,
                    is_complete: 1
                });

            } else {

                LOGGER.module().error('ERROR: [/import/model (process_metadata_update_queue)] (interval) Unable to get ArchivesSpace record and processes it.');

                await METADATA.update_metadata_queue({
                    uri: record.uri
                }, {
                    is_complete: 1,
                    status: 'COMPLETE',
                    error: 'Unable to get ArchivesSpace record'
                });
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/model (process_metadata_update_queue)] (interval) Unable to process records. ' + error.message);
        }

    }, 10000);
}
