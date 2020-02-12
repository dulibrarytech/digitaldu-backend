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
    let api = configModule.getApi();

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

            /*
            if (document.querySelector('#objects')) {
                document.querySelector('#objects').innerHTML = html;
            }
            */


            dom.html('#objects', html);

            return false;
        }

        if (document.querySelector('#searched-for')) {
            document.querySelector('#searched-for').innerHTML = '<p>You searched for: ' + helperModule.getParameterByName('q') + '</p>';
        }

        if (document.querySelector('#total-records')) {
            document.querySelector('#total-records').innerHTML = '<p>Total Records: ' + total_records + '</p>';
        }

        for (let i = 0; i < data.hits.length; i++) {

            let record = data.hits[i]._source,
                tn = helperModule.getTn(DOMPurify.sanitize(data.hits[i]._source.thumbnail), DOMPurify.sanitize(data.hits[i]._source.mime_type)),
                pid = DOMPurify.sanitize(data.hits[i]._source.pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.display_record.title !== undefined) {

                if (data.hits[i]._source.object_type === 'collection') {
                    html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '">' + DOMPurify.sanitize(record.display_record.title) + '</a></h4>';
                } else if (data.hits[i]._source.object_type === 'object') {
                    html += '<h4>' + DOMPurify.sanitize(record.display_record.title) + '</h4>';
                }

            } else {
                html += '<h4>No Title</h4>';
            }

            html += '<ul>';
            html += '<li><strong>Pid:</strong>&nbsp;<a target="_blank" href="' + DOMPurify.sanitize(record.handle) + '">' + DOMPurify.sanitize(record.pid) + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';

            if (record.display_record.uri !== undefined) {
                html += '<li><strong>Uri:</strong>&nbsp;' + DOMPurify.sanitize(record.display_record.uri) + '</li>';
            }

            if (record.display_record.dates !== undefined && record.display_record.dates.length !== 0) {

                html += '<li><strong>Dates:</strong></li>';
                html += '<ul>';

                for (let j = 0; j < record.display_record.dates.length; j++) {

                    if (data.hits[i]._source.object_type === 'collection') {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.dates[j].expression) + ' ( ' + DOMPurify.sanitize(record.display_record.dates[j].date_type) + '</a> )</li>';
                    } else {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.dates[j].expression) + ' ( ' + DOMPurify.sanitize(record.display_record.dates[j].type) + '</a> )</li>';
                    }
                }

                html += '</ul>';
            }

            if (record.display_record.extents !== undefined && record.display_record.extents.length !== 0) {

                html += '<li><strong>Extents:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.extents.length; i++) {

                    // collection object
                    if (typeof record.display_record.extents[i] === 'object') {

                        for (let prop in record.display_record.extents[i]) {

                            if (prop === 'number') {
                                html += '<li>number: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            } else if (prop === 'container_summary') {
                                html += '<li>container summary: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            } else if (prop === 'created_by') {
                                html += '<li>created by: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            } else if (prop === 'last_modified_by') {
                                html += '<li>last modified by: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            } else if (prop === 'portion') {
                                html += '<li>portion: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            } else if (prop ==='extent_type') {
                                html += '<li>extent type: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                            }
                        }

                    } else {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.extents[i]) + '</li>';
                    }
                }

                html += '</ul>';
            }

            if (record.display_record.identifiers !== undefined && record.display_record.identifiers.length !== 0) {

                html += '<li><strong>Identifiers:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.identifiers.length; i++) {
                    html += '<li>' + DOMPurify.sanitize(record.display_record.identifiers[i].identifier) + ' ( ' + DOMPurify.sanitize(record.display_record.identifiers[i].type) + ' )</li>';
                }

                html += '</ul>';
            }

            if (record.display_record.language !== undefined && record.display_record.language.length !== 0) {

                if (typeof record.display_record.language === 'object') {

                    for (let i = 0; i < record.display_record.language.length; i++) {
                        html += '<li><strong>Language:</strong> ' + DOMPurify.sanitize(record.display_record.language[i].text) + ' ( ' + DOMPurify.sanitize(record.display_record.language[i].authority) + ' )</li>';
                    }

                } else {
                    html += '<li><strong>Language:</strong> ' + DOMPurify.sanitize(record.display_record.language) + '</li>';
                }

            }

            if (record.display_record.names !== undefined && record.display_record.names.length !== 0) {

                html += '<li><strong>Names:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.names.length; i++) {
                    html += '<li>' + DOMPurify.sanitize(record.display_record.names[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.names[i].source) + ' )</li>';
                }

                html += '</ul>';
            }

            if (record.display_record.notes !== undefined && record.display_record.notes.length !== 0) {

                html += '<li><strong>Notes:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.notes.length; i++) {
                    if (record.display_record.notes[i].content !== undefined) {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.notes[i].content.toString()) + ' ( ' + DOMPurify.sanitize(record.display_record.notes[i].type) + ' )</li>';
                    }
                }

                html += '</ul>';
            }

            if (record.display_record.parts !== undefined && record.display_record.parts.length !== 0) {

                html += '<li><strong>Parts:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.parts.length; i++) {
                    html += '<li>' + DOMPurify.sanitize(record.display_record.parts[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.parts[i].type) + ' ) order: ' + DOMPurify.sanitize(record.display_record.parts[i].order);

                    // TODO: toggle default thumbnails if not an image.  i.e. pdf, audio and video
                    let tn = helperModule.getTn(DOMPurify.sanitize(record.display_record.parts[i].thumbnail), '');
                    html += '<br><img src="' + tn + '" width="100px" height="100px"></li>';
                }

                html += '</ul>';
            }

            if (data.hits[i]._source.object_type !== 'collection' && record.display_record.subjects !== undefined && record.display_record.subjects.length !== 0) {

                html += '<li><strong>Subjects:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.subjects.length; i++) {
                    if (record.display_record.subjects[i].authority_id !== undefined) {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.subjects[i].title) + ' ( <a target="_blank" href="' + DOMPurify.sanitize(record.display_record.subjects[i].authority_id) + '">' + DOMPurify.sanitize(record.display_record.subjects[i].authority) + '</a> )</li>';
                    } else {
                        html += '<li>' + DOMPurify.sanitize(record.display_record.subjects[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.subjects[i].authority) + ' )</li>';
                    }
                }

                html += '</ul>';
            }

            if (record.abstract !== undefined) {
                html += '<li><strong>Abstract:</strong></li>';
                html += '<ul><li style="min-height: 75px">' + DOMPurify.sanitize(record.abstract) + '</li></ul>';
            }

            html += '</ul>';
            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

            if (data.hits[i]._source.object_type === 'collection') {

                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';

                if (data.hits[i]._source.is_published === '1') {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';

            } else if (data.hits[i]._source.object_type === 'object' && data.hits[i]._source.is_compound === 0) {

                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';

                if (data.hits[i]._source.is_published === '1') {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

            } else if (data.hits[i]._source.object_type === 'object' && data.hits[i]._source.is_compound === 1) {

                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Compound Object</small></p>';

                if (data.hits[i]._source.is_published === '1') {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';
            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        html += helperModule.pagination(is_member_of_collection, total_records);

        if (document.querySelector('#pagination')) {
            document.querySelector('#pagination').innerHTML = helperModule.pagination(is_member_of_collection, total_records);
        }

        if (document.querySelector('#objects')) {
            document.querySelector('#objects').innerHTML = html;
        }
    };

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