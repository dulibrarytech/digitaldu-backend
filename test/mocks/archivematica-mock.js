/**

 Copyright 2021 University of Denver

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

const FS = require('fs');

/**
 *
 * @param folder
 * @param callback
 */
exports.list = function (folder, callback) {

    FS.mkdir('./test/mocks/' + folder, function(error) {

        if (error) {
            throw error;
        }

        setTimeout(function() {
            callback([
                        {
                            type: 'd',
                            name: folder,
                            size: 4096,
                            modifyTime: 1621885050000,
                            accessTime: 1621885076000,
                            rights: { user: 'rwx', group: 'rx', other: 'rx' },
                            owner: 1002,
                            group: 333
                        }
                    ]);

        }, 150);

    });
};

/**
 *
 * @param transferObj
 * @param callback
 */
exports.start_transfer = function (transferObj, callback) {

    // TODO: move assets to package folder
    console.log(transferObj);
    callback('hello');
    return false;

    fs.rename('./test/mocks/test_packages/B002.16.0202.00001', './test/mocks/' + transferObj.is_member_of_collection, function(error) {

        if (error) {
            console.log(error);
            return false;
        }

        callback('hello');
    });

    //
};