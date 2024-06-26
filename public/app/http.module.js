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

const httpModule = (function () {

    'use strict';

    let obj = {};

    obj.req = function (request, callback) {
        fetch(request).then(callback).catch(function (error) {

            helperModule.renderError('Error: (Request/Response error has occurred. ' + DOMPurify.sanitize(error));

            if (error.message === 'Failed to fetch' ) {
                window.location.replace('/repo');
            }
        });
    };

    return obj;

}());