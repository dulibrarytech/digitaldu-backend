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

    const api = configModule.getApi();
    let obj = {};

    /**
     * Renders object metadata
     * @param data
     * @returns {boolean}
     */
    const renderSearchResults = function (data) {

        let is_member_of_collection = helperModule.getParameterByName('pid'),
            total_records = DOMPurify.sanitize(data.total),
            html = '';

        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.total === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No objects or collections found.</strong></div>';
            domModule.html('#objects', html);
            return false;
        }

        domModule.html('#searched-for', '<p>You searched for: ' + helperModule.getParameterByName('q') + '</p>');
        domModule.html('#total-records', '<p>Total Records: ' + total_records + '</p>');

        for (let i = 0; i < data.hits.length; i++) {

            let record = data.hits[i]._source;
            let tn;

            tn = metadataModule.createThumbnailLink(record);

            html += '<div class="row">';
            html += '<div class="col-md-3">';
            html += metadataModule.createThumbnailDisplay(record, tn);
            html += '</div>';
            html += '<div class="col-md-6" style="padding: 5px">';
            html += metadataModule.createDisplay(record);
            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';
            html += metadataModule.createCollectionMenu(record);
            html += metadataModule.createObjectMenu(record);
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        html += helperModule.pagination(is_member_of_collection, total_records);

        domModule.html('#pagination', helperModule.pagination(is_member_of_collection, total_records));
        domModule.html('#objects', html);
    };

    /**
     * Constructs search request
     */
    obj.search = function () {

        let q = helperModule.getParameterByName('q');
        let token = userModule.getUserToken();

        let url = api + '/api/admin/v1/search?q=' + q,
            request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    domModule.html('#message', null);

                    if (data.length === 0) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>');
                    } else {
                        renderSearchResults(data);
                    }
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '. Unable to get incomplete records.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());