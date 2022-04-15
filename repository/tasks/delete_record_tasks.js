/**

 Copyright 2022 University of Denver

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

const HELPER = require('../../repository/helper');
const ARCHIVEMATICA = require('../../libs/archivematica');
const LOGGER = require('../../libs/log4');

const Delete_record_tasks = class {

    constructor(uuid, delete_reason, DB, TABLE) {
        this.uuid = uuid;
        this.delete_reason = delete_reason;
        this.DB = DB;
        this.TABLE = TABLE;
    }

    /**
     * Checks if record is published
     */
    check_if_published = () => {

        return this.DB(this.TABLE)
            .count('is_published as is_published')
            .where({
                uuid: this.uuid,
                is_active: 1,
                is_published: 1
            })
            .then((data) => {

                let is_published = 1;

                // delete only if object is not published
                if (data[0].is_published === 0) {
                    is_published = data[0].is_published;
                }

                return is_published;
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/repository/tasks (check_if_published)] Unable to check record if record is published ' + error.message);
            });
    }

    /**
     * Flags record as inactive
     */
    set_to_inactive = () => {

        return this.DB(this.TABLE)
            .where({
                uuid: this.uuid
            })
            .update({
                is_active: 0
            })
            .then((data) => {
                if (data === 1) {
                    return data;
                }
            })
            .catch((error) => {
                LOGGER.module().error('ERROR: [/repository/tasks (set_to_inactive)] unable to change record status to inactive ' + error.message);
            });
    }

    /**
     * Deletes record from index
     */
    delete_from_index = () => {

        HELPER.del(this.uuid, (result) => {

            if (result.error === true) {
                LOGGER.module().error('ERROR: [/repository/tasks (delete_from_index)] unable to remove record from index.');
                return false;
            }

        });
    }

    /** TODO: test
     * Generates an archivematica AIP delete request
     * @return {boolean}
     */
    delete_aip_request = () => {

        ARCHIVEMATICA.delete_aip_request(this.uuid, (result) => {

            if (result.error === false) {

                let json = JSON.parse(result.data);
                let delete_id = json.id;

                this.DB(this.TABLE)
                    .where({
                        uuid: this.uuid
                    })
                    .update({
                        delete_id: delete_id
                    })
                    .then((data) => {

                        if (data === 1) {
                            // LOGGER.module().info('INFO: [/repository/model module (delete_object/delete_aip_request)] delete id ' + obj.delete_id + ' saved');
                        }
                    })
                    .catch((error) => {
                        LOGGER.module().error('ERROR: [/repository/tasks (delete_aip_request)] unable to save delete id ' + error.message);
                    });

            } else {
                LOGGER.module().error('ERROR: [/repository/tasks (delete_aip_request)] unable to create delete aip request');
            }
        });
    }
}

module.exports = Delete_record_tasks;
