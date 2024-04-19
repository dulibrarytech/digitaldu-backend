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

const HELPER = require('../libs/helper');
const TOKEN_CONFIG = {
    token_issuer: process.env.TOKEN_ISSUER,
    token_algo: process.env.TOKEN_ALGO,
    token_expires: process.env.TOKEN_EXPIRES,
    token_secret: process.env.TOKEN_SECRET,
    api_key: process.env.API_KEY
};

module.exports = function () {
    const HELPER_TASK = new HELPER();
    return HELPER_TASK.check_config(TOKEN_CONFIG);
};
