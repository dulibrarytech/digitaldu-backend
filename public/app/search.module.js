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

    let obj = {};

    let renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    let api = configModule.getApi();

    const renderSearchResults = function (data) {

        let total = data.total,
            hits = data.hits,
            html = '';

        $('#search-results-total').html('<strong>Total results</strong>: ' + total);

        for (let i = 0; i < hits.length; i++) {

            if (hits.length > 0 && hits[i]._source.display_record === null) {
                $('#message').html('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i>&nbsp; Some display records are not available.</div>');
                continue;
            }

            // Depends on issue #111
            console.log(hits[i]._source);

            let record = hits[i]._source,
                tn = helperModule.getTn(hits[i]._source.thumbnail, hits[i]._source.mime_type);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="max-height: 250px; max-width: 250px;" display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title !== undefined) {

                if (hits[i]._source.object_type === 'collection') {
                    html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + hits[i]._source.pid + '">' + record.title + '</a></h4>';
                } else if (hits[i]._source.object_type === 'object') {
                    html += '<h4>' + record.title + '</h4>';
                }

            } else {
                html += '<h4>No Title</h4>';
            }

            // TODO: ensure that object_type for "objects" is indexed
            console.log(hits[i]._source.object_type);

            // if (hits[i]._source.object_type === 'object') {

                html += '<ul>';
                html += '<li><strong>Pid:</strong>&nbsp;<a target="_blank" href="' + hits[i]._source.handle + '">' + hits[i]._source.pid + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';
                html += '<li><strong>Uri:</strong>&nbsp;' + record.uri + '</li>';

                if (record.dates !== undefined && record.dates.length !== 0) {

                    html += '<li><strong>Dates:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.dates.length; i++) {
                        html += '<li>' + record.dates[i].expression + ' ( ' + record.dates[i].type + '</a> )</li>';
                    }

                    html += '</ul>';
                }

                if (record.extents !== undefined && record.extents.length !== 0) {

                    html += '<li><strong>Extents:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.extents.length; i++) {
                        html += '<li>' + record.extents[i] + '</li>';
                    }

                    html += '</ul>';
                }

                if (record.identifiers !== undefined && record.identifiers.length !== 0) {

                    html += '<li><strong>Identifiers:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.identifiers.length; i++) {
                        html += '<li>' + record.identifiers[i].identifier + ' ( ' + record.identifiers[i].type + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.language !== undefined && record.language.length !== 0) {

                    for (let i = 0; i < record.language.length; i++) {
                        html += '<li><strong>Language:</strong> ' + record.language[i].text + ' ( ' + record.language[i].authority + ' )</li>';
                    }
                }

                if (record.names !== undefined && record.names.length !== 0) {

                    html += '<li><strong>Names:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.names.length; i++) {
                        html += '<li>' + record.names[i].title + ' ( ' + record.names[i].source + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.notes !== undefined && record.notes.length !== 0) {

                    html += '<li><strong>Notes:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.notes.length; i++) {
                        html += '<li>' + record.notes[i].content + ' ( ' + record.notes[i].type + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.parts !== undefined && record.parts.length !== 0) {

                    html += '<li><strong>Parts:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.parts.length; i++) {
                        html += '<li>' + record.parts[i].title + ' ( ' + record.parts[i].type + ' ) order: ' + record.parts[i].order + '</li>';
                    }

                    html += '</ul>';
                }

                if (record.subjects !== undefined && record.subjects.length !== 0) {

                    html += '<li><strong>Subjects:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.subjects.length; i++) {
                        if (record.subjects[i].authority_id !== undefined) {
                            html += '<li>' + record.subjects[i].title + ' ( <a target="_blank" href="' + record.subjects[i].authority_id + '">' + record.subjects[i].authority + '</a> )</li>';
                        } else {
                            html += '<li>' + record.subjects[i].title + ' ( ' + record.subjects[i].authority + ' )</li>';
                        }
                    }

                    html += '</ul>';
                }

                html += '</ul>';
            // }

            // if (hits[i]._source.object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px">' + record.abstract + '</p>';
            // }

            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

            if (hits[i]._source.object_type === 'collection') {
                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';
            } else if (hits[i]._source.object_type === 'object') {
                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';
            }

            if (hits[i]._source.is_published === 1) {
                html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
            } else {
                html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
            }

            if (hits[i]._source.object_type === 'collection') {
                // html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + hits[i]._source.pid + '"><i class="fa fa-edit"></i>&nbsp;Edit collection</a></p>';
            } else if (hits[i]._source.object_type === 'object') {
                // TODO...
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=tn"><i class="fa fa-code"></i>&nbsp;Technical Metadata</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=mods"><i class="fa fa-code"></i>&nbsp;MODS</a></p>';
            }

            if (hits[i]._source.object_type === 'object') {
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + hits[i]._source.pid + '"><i class="fa fa-download"></i>&nbsp;Download AIP</a></p>';
            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination or infinite scroll
        $('#search-results').html(html);
    };

    obj.search = function () {

        let q = helperModule.getParameterByName('q'); // TODO: sanitize
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

                    $('#message').html('');

                    if (data.length === 0) {
                        let message = '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>';
                        $('#message').html(message);
                    } else {
                        renderSearchResults(data);
                    }
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to get incomplete records.</div>';
                renderError(message);
            }

        };

        http.req(request, callback);
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());