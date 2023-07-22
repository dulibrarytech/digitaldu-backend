/**

 Copyright 2023 University of Denver

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

const SERVICE = require('../qa/service');
const QA_SERVICE = new SERVICE();

const QA_controller = class {

    constructor() {
    }

    async get_folder_list(req, res) {
        const data = await QA_SERVICE.get_folder_list();
        res.status(data.status).send(data.data);
    }

    async run_qa(req) {
        const folder_name = req.query.folder_name;
        await QA_SERVICE.run_qa(folder_name);
    }

    async qa_status(req, res) {
        const data = await QA_SERVICE.qa_status();
        res.status(data.status).send(data.data);
    }

    async move_to_ingested(req, res) {
        const data = await QA_SERVICE.move_to_ingested();
        res.status(data.status).send(data.data);
    }
}

module.exports = QA_controller;
