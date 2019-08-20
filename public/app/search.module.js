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
            html = '',
            is_member_of_collection = helperModule.getParameterByName('pid');

        $('#search-results-total').html('<strong>Total results</strong>: ' + total);
        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.length === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No objects or collections found.</strong></div>';
            $('#objects').html(html);
            return false;
        }

        for (let i = 0; i < hits.length; i++) {

            let record = hits[i]._source,
                tn = helperModule.getTn(hits[i].thumbnail, hits[i].mime_type),
                pid = hits[i].pid;

            if (hits.length > 0 && record.display_record === null) {
                $('#message').html('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i>&nbsp; Some display records are not available.  Review incomplete records.</div>');
                continue;
            }

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.object_type === 'collection') {
                html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + record.pid + '">' + record.title + '</a></h4>';
            } else if (record.object_type === 'object') {
                html += '<h4>' + record.display_record.title + '</h4>';
            }

            html += '<ul>';
            html += '<li><strong>Pid:</strong>&nbsp;<a target="_blank" href="' + record.handle + '">' + record.pid + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';

            if (record.uri !== undefined) {
                html += '<li><strong>Uri:</strong>&nbsp;' + record.uri + '</li>';
            }

            if (record.abstract !== undefined) {
                html += '<li><strong>Abstract:</strong></li>';
                html += '<ul><li style="min-height: 75px">' + record.abstract + '</li></ul>';
            }

            if (record.display_record !== undefined) {


                if (record.display_record.dates !== undefined && record.display_record.dates.length !== 0) {

                    html += '<li><strong>Dates:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.dates.length; i++) {

                        if (record.object_type === 'collection') {
                            html += '<li>' + record.display_record.dates[i].expression + ' ( ' + record.display_record.dates[i].date_type + '</a> )</li>';

                        } else {
                            html += '<li>' + record.display_record.dates[i].expression + ' ( ' + record.display_record.dates[i].type + '</a> )</li>';
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
                                    html += '<li>number: ' + record.display_record.extents[i][prop] + '</li>';
                                } else if (prop === 'container_summary') {
                                    html += '<li>container summary: ' + record.display_record.extents[i][prop] + '</li>';
                                } else if (prop === 'created_by') {
                                    html += '<li>created by: ' + record.display_record.extents[i][prop] + '</li>';
                                } else if (prop === 'last_modified_by') {
                                    html += '<li>last modified by: ' + record.display_record.extents[i][prop] + '</li>';
                                } else if (prop === 'portion') {
                                    html += '<li>portion: ' + record.display_record.extents[i][prop] + '</li>';
                                } else if (prop === 'extent_type') {
                                    html += '<li>extent type: ' + record.display_record.extents[i][prop] + '</li>';
                                }
                            }

                        } else {
                            html += '<li>' + record.display_record.extents[i] + '</li>';
                        }
                    }

                    html += '</ul>';
                }


                if (record.display_record.identifiers !== undefined && record.display_record.identifiers.length !== 0) {

                    html += '<li><strong>Identifiers:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.identifiers.length; i++) {
                        html += '<li>' + record.display_record.identifiers[i].identifier + ' ( ' + record.display_record.identifiers[i].type + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.language !== undefined && record.display_record.language.length !== 0) {

                    if (typeof record.display_record.language === 'object') {

                        for (let i = 0; i < record.display_record.language.length; i++) {
                            html += '<li><strong>Language:</strong> ' + record.display_record.language[i].text + ' ( ' + record.display_record.language[i].authority + ' )</li>';
                        }

                    } else {
                        html += '<li><strong>Language:</strong> ' + record.display_record.language + '</li>';
                    }

                }

                if (record.display_record.names !== undefined && record.display_record.names.length !== 0) {

                    html += '<li><strong>Names:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.names.length; i++) {
                        html += '<li>' + record.display_record.names[i].title + ' ( ' + record.display_record.names[i].source + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.notes !== undefined && record.display_record.notes.length !== 0) {

                    html += '<li><strong>Notes:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.notes.length; i++) {
                        if (record.display_record.notes[i].content !== undefined) {
                            html += '<li>' + record.display_record.notes[i].content.toString() + ' ( ' + record.display_record.notes[i].type + ' )</li>';
                        }
                    }

                    html += '</ul>';
                }

                if (record.display_record.parts !== undefined && record.display_record.parts.length !== 0) {

                    html += '<li><strong>Parts:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.parts.length; i++) {
                        html += '<li>' + record.display_record.parts[i].title + ' ( ' + record.display_record.parts[i].type + ' ) order: ' + record.display_record.parts[i].order;

                        // TODO: toggle default thumbnails if not an image.  i.e. pdf, audio and video
                        let tn = helperModule.getTn(record.display_record.parts[i].thumbnail, '');
                        html += '<br><img src="' + tn + '" width="100px" height="100px"></li>';
                    }

                    html += '</ul>';
                }

                if (record.object_type !== 'collection' && record.display_record.subjects !== undefined && record.display_record.subjects.length !== 0) {

                    html += '<li><strong>Subjects:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.subjects.length; i++) {
                        if (record.display_record.subjects[i].authority_id !== undefined) {
                            html += '<li>' + record.display_record.subjects[i].title + ' ( <a target="_blank" href="' + record.display_record.subjects[i].authority_id + '">' + record.display_record.subjects[i].authority + '</a> )</li>';
                        } else {
                            html += '<li>' + record.display_record.subjects[i].title + ' ( ' + record.display_record.subjects[i].authority + ' )</li>';
                        }
                    }

                    html += '</ul>';
                }

            } //

            html += '</ul>';

            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

            // TODO: optimize this block
            if (record.object_type === 'collection') {

                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';

                if (record.is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.unpublishObject(\'' + record.pid + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Unpublish</a></p>';
                    // html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + record.pid + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                // html += '<p><a href="' + api + '/dashboard/object/update?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Update metadata</a></p>';
                html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + record.pid + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';

            } else if (record.object_type === 'object' && record.is_compound === 0) {

                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';

                if (record.is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + record.pid + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                // html += '<p><a href="' + api + '/dashboard/object/update?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Update metadata</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '"><i class="fa fa-download"></i>&nbsp;Download AIP</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=tn"><i class="fa fa-code"></i>&nbsp;Technical Metadata</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=mods"><i class="fa fa-code"></i>&nbsp;MODS</a></p>';

            } else if (record.object_type === 'object' && record.is_compound === 1) {

                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Compound Object</small></p>';

                if (record.is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + record.pid + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                // html += '<p><a href="' + api + '/dashboard/object/update?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Update metadata</a></p>';
                html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + record.pid + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';

            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';

        }

        // TODO: implement pagination
        $('#search-results').html(html);
        $('a').tooltip();
    };


    // TODO: remove

    const renderSearchResults_old = function (data) {

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
            html += '<li><strong>Uri:</strong>&nbsp;' + hits[i]._source.uri + '</li>';

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

            if (hits[i]._source.abstract !== undefined) {

                html += '<li><strong>Abstarct:</strong></li>';
                html += '<ul>';
                html += '<li style="min-height: 75px">' + record.abstract + '</li>';
                html += '</ul>';
            }

            html += '</ul>';
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