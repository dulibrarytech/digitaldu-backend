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

const LOGGER = require("../../libs/log4");
const DR = require("../../libs/display-record");
const HELPER = require("../../repository/helper");

/**
 * Object contains tasks used to suppress a repository record
 * @param uuid
 * @param DB
 * @param TABLE
 * @constructor
 */
exports.Suppress_record_tasks = (uuid, DB, TABLE) => {

    this.uuid = uuid;
    this.DB = DB;
    this.TABLE = TABLE;


};
