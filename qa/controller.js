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

exports.get_folder_list = (req, res) => {
    SERVICE.get_folder_list((data) => {
        res.status(data.status).send(data.data);
    });
};

exports.run_qa = (req, res) => {

    let folder = req.query.folder;

    SERVICE.run_qa(folder, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.qa_status = (req, res) => {
    SERVICE.qa_status((data) => {
        res.status(data.status).send(data.data);
    });
};

exports.move_to_ingest = function (req, res) {

    let uuid = req.query.uuid;
    let folder = req.query.folder;

    SERVICE.move_to_ingest(uuid, folder, function (data) {
        res.status(data.status).send(data.data);
    });
};

exports.move_to_sftp = (req, res) => {

    let uuid = req.query.uuid;
    let folder = req.query.folder;

    SERVICE.move_to_sftp(uuid, folder, (data) => {
        res.status(data.status).send(data.data);
    });
};

exports.sftp_upload_status = (req, res) => {
    // TODO: req here
    SERVICE.sftp_upload_status(req, (data) => {
        res.status(data.status).send(data.data);
    });
};
