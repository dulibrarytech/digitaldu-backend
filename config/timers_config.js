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

'use strict';

const TIMERS_CONFIG = {
    transfer_timer: process.env.TRANSFER_TIMER,
    transfer_approval_timer: process.env.TRANSFER_APPROVAL_TIMER,
    transfer_status_check_interval: process.env.TRANSFER_STATUS_CHECK_INTERVAL,
    import_timer: process.env.IMPORT_TIMER,
    ingest_status_check_interval: process.env.INGEST_STATUS_CHECK_INTERVAL,
    ingest_status_timer: process.env.INGEST_STATUS_TIMER,
    index_timer: process.env.INDEX_TIMER,
    metadata_update_timer: process.env.METADATA_UPDATE_TIMER
};

module.exports = function () {
    return TIMERS_CONFIG;
};

