/**

 Copyright 2024 University of Denver

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

const ARCHIVESSPACE = require('../../libs/archivesspace');
const ARCHIVESSPACE_CONFIG = require('../../config/archivesspace_config')();
const LOGGER = require('../../libs/log4');

/**
 * Ingest service tasks
 * @type {Metadata_tasks}
 */
const Metadata_tasks = class {

    constructor(DB, DB_QUEUE, TABLES) {
        this.DB = DB;
        this.DB_QUEUE = DB_QUEUE;
        this.TABLES = TABLES;
        this.ARCHIVEASSPACE_LIB = new ARCHIVESSPACE(ARCHIVESSPACE_CONFIG);
    }

    /**
     *
     * @return {Promise<token<string>>}
     */
    async get_session_token() {

        try {
            return await this.ARCHIVEASSPACE_LIB.get_session_token();
        } catch (error) {
            LOGGER.module().error('ERROR: [/ingester/tasks (get_session_token)] Unable to get session token ' + error.message);
        }
    }

    /**
     * Destroys session
     * @param token
     * @return {Promise<void>}
     */
    async destroy_session_token(token) {

        let result = await this.ARCHIVEASSPACE_LIB.destroy_session_token(token);

        if (result.data.status === 'session_logged_out') {
            LOGGER.module().info('INFO: [/import/tasks (destroy_session_token)] ArchivesSpace session terminated');
        } else {
            LOGGER.module().error('ERROR: [/import/tasks (destroy_session_token)] Unable to terminate ArchivesSpace session');
        }
    }

    /**
     * Gets DB record
     * @param uuid
     */
    async get_db_record(uuid) {

        try {

            return await this.DB(this.TABLES.repo.repo_records)
            .select('uri', 'display_record')
            .where({
                pid: uuid
            });

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (get_db_record)] unable to get record ' + error.message);
        }
    }

    /**
     * Updates DB record
     * @param uuid
     * @param record
     */
    async update_db_record(uuid, record) {

        try {

            await this.DB(this.TABLES.repo.repo_records)
            .where({
                pid: uuid
            })
            .update(record);
            LOGGER.module().info('INFO: [/import/tasks (update_db_record)] Record updated');
            return true;

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (update_db_record)] unable to update record ' + error.message);
            return false;
        }
    }

    /**
     * Gets collection child records
     * @param uuid
     */
    async get_collection_child_records(uuid) {

        try {

            return await this.DB(this.TABLES.repo.repo_records)
            .select('pid', 'uri')
            .where({
                is_member_of_collection: uuid,
                is_active: 1
            })
            .orderBy('id','desc');

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (get_collection_child_records)] unable to get records ' + error.message);
        }
    }

    /**
     * Gets metadata
     * @param uri
     * @param token
     */
    async get_metadata(uri, token) {

        try {

            LOGGER.module().info('INFO: [/import/tasks (get_metadata)] Getting metadata record ' + uri);
            const record = await this.ARCHIVEASSPACE_LIB.get_record(uri, token);

            if (record.metadata === undefined) {
                return false;
            } else {
                return record.metadata;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (get_metadata)] Unable to get metadata - ' + error.message);
        }
    }

    /**
     * Queues metadata for updates
     * @param data
     */
    async queue_metadata(data) {

        try {

            const result = await this.DB_QUEUE.transaction((trx) => {
                this.DB_QUEUE.insert(data)
                .into(this.TABLES.repo.metadata_update_queue)
                .transacting(trx)
                .then(trx.commit)
                .catch(trx.rollback);
            });

            if (result.length !== 1) {
                LOGGER.module().info('INFO: [/import/tasks (queue_metadata)] Unable to batch queue records.');
                return false;
            } else {
                LOGGER.module().info('INFO: [/import/tasks (queue_metadata)] ' + result.length + ' batch added to queue.');
                return true;
            }

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (queue_metadata)] Unable to queue batch ' + error.message);
        }
    }

    /**
     * Gets queue record for metadata update
     * @param batch_uuid
     */
    async get_queue_record(batch_uuid) {

        try {

            const data = await this.DB_QUEUE(this.TABLES.repo.metadata_update_queue)
            .select('uuid', 'uri')
            .where({
                batch_uuid: batch_uuid,
                is_complete: 0
            })
            .limit(1);

            if (data === undefined || data.length === 0) {
                return 0;
            }

            return data[0];

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (get_queue_record)] unable to get queue record ' + error.message);
        }
    }

    /**
     * Updates metadata queue
     * @param where_obj ({uri})
     * @param data ({status, is_updated, is_indexed, is_complete})
     */
    async update_metadata_queue(where_obj, data) {

        try {

            await this.DB_QUEUE(this.TABLES.repo.metadata_update_queue)
            .where(where_obj)
            .update(data);
            LOGGER.module().info('INFO: [/import/tasks (update_metadata_queue)] Queue updated');
            return true;

        } catch (error) {
            LOGGER.module().error('ERROR: [/import/tasks (update_metadata_queue)] Unable to update ingest queue ' + error.message);
            return false;
        }
    }
};

module.exports = Metadata_tasks;