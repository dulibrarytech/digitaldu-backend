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

const searchModule = (function () {

    'use strict';
    console.log('TEST');
    const api = configModule.getApi();
    const endpoints = endpointsModule.get_search_endpoints();
    let obj = {};

    /**
     * Constructs search request
     */
    obj.search = function () {
        console.log('ENDPOINTS: ', endpoints);
        let q = helperModule.getParameterByName('q');
        let endpoint = endpoints.search.endpoint;
        let token = authModule.getUserToken(),
            page = helperModule.getParameterByName('page'),
            total_on_page = helperModule.getParameterByName('total_on_page'),
            sort = helperModule.getParameterByName('sort'),
            url = api + endpoint + '?q=' + q;

        if (page !== null && total_on_page !== null) {
            url = api + endpoint + '?q=' + q + '&page=' + page + '&total_on_page=' + total_on_page;
        }

        let request = new Request(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
            }
        });

        const callback = function (response) {
            console.log(response);
            if (response.status === 200) {

                response.json().then(function (data) {
                    domModule.html('#message', null);
                    objectsModule.renderDisplayRecords(data);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '. Unable to get search records.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {

        if (helperModule.getParameterByName('q') !== null) {
            obj.search();
        }
    };

    return obj;

}());