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

const objectsModule = (function () {

    'use strict';

    let obj = {};
    let api = configModule.getApi();

    /**
     * Gets repository objects
     */
    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'),
            page = helperModule.getParameterByName('page'),
            total_on_page = helperModule.getParameterByName('total_on_page'),
            sort = helperModule.getParameterByName('sort');

        if (pid === null || pid === 'codu:root') {
            pid = 'codu:root';
        } else {
            collectionsModule.getCollectionName(pid);
        }

        userModule.setHeaderUserToken();

        let url = api + '/api/admin/v1/repo/objects?pid=' + pid;

        if (page !== null && total_on_page !== null) {
            url = api + '/api/admin/v1/repo/objects?pid=' + pid + '&page=' + page + '&total_on_page=' + total_on_page;
        }

        $.ajax(url)
            .done(function (data) {
                objectsModule.renderDisplayRecords(data);
            })
            .fail(function (error) {

                if (error.status === 401) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(error.status) + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);

                } else {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(error.status) + '). An error has occurred. Unable to get objects.</div>';
                    helperModule.renderError(message);
                }

            });
    };

    /**
     * // TODO:...
     * Initiates object download
     * @returns {boolean}
     */
    obj.downloadObject = function () {
        let pid = helperModule.getParameterByName('pid');
        window.location.replace(api + '/api/v1/object/download?pid=' + pid);
        return false;
    };

    /**
     * Publishes admin objects
     * @param pid
     */
    obj.publishObject = function (pid, type) {

        window.scrollTo({ top: 0, behavior: 'smooth' });

        let obj = {
            pid: pid,
            type: type
        };

        let message = '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Publishing...</div>';
        document.querySelector('#message').innerHTML = message;

        let url = api + '/api/admin/v1/repo/publish',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': userModule.getUserToken()
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let message = '<div class="alert alert-success">Published</div>';
                document.querySelector('#message').innerHTML = message;
                // $('#message').html(message);

                setTimeout(function () {
                    $('#message').html('');
                    objectsModule.getObjects();
                }, 5000);

            } else if (response.status === 418) {

                let message = '<div class="alert alert-warning">Unable to publish object. (The object\'s parent collection must be published before attempting to publish one of its objects.)</div>';
                document.querySelector('#message').innerHTML = message;
                // $('#message').html(message);

                setTimeout(function () {
                    $('#message').html('');
                    objectsModule.getObjects();
                }, 7000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(response.status) + ').  Unable to publish object(s).</div>';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Unpublishes admin objects
     * @param pid
     */
    obj.unpublishObject = function (pid, type) {

        window.scrollTo({ top: 0, behavior: 'smooth' });

        let obj = {
            pid: pid,
            type: type
        };

        let message = '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Unpublishing...</div>';
        document.querySelector('#message').innerHTML = message;

        let url = api + '/api/admin/v1/repo/unpublish',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': userModule.getUserToken()
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                let message = '<div class="alert alert-success">Unpublished</div>';
                document.querySelector('#message').innerHTML = message;

                setTimeout(function () {
                    $('#message').html('');
                    objectsModule.getObjects();
                }, 8000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + ').  Unable to unpublish object(s).';
                helperModule.renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Gets unpublished records
     */
    obj.getUnPublishedObjects = function () {

        let pid = helperModule.getParameterByName('pid'),
            token = userModule.getUserToken();

        let url = api + '/api/admin/v1/repo/object/unpublished?pid=' + pid,
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
                        document.querySelector('#message').innerHTML = message;
                    } else {
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else {

                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to get incomplete records.</div>';
                helperModule.renderError(message);
            }

        };

        http.req(request, callback);
    };

    /**
     * Renders object metadata
     * @param data
     * @returns {boolean}
     */
    obj.renderDisplayRecords = function (data) {

        let is_member_of_collection = helperModule.getParameterByName('pid'),
            total_records = DOMPurify.sanitize(data.total),
            html = '';

        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.total === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No unpublished objects found for this collection.</strong></div>';
            document.querySelector('#objects').innerHTML = html;
            return false;
        }

        if (document.querySelector('#total-records')) {
            document.querySelector('#total-records').innerHTML = '<p>Total Records: ' + total_records + '</p>';
        }

        for (let i = 0; i < data.hits.length; i++) {

            let record = data.hits[i]._source,
                pid = DOMPurify.sanitize(data.hits[i]._source.pid),
                is_published = parseInt(DOMPurify.sanitize(data.hits[i]._source.is_published)),
                is_compound = parseInt(DOMPurify.sanitize(data.hits[i]._source.is_compound)),
                tn;

            if (data.hits[i]._source.thumbnail !== undefined && data.hits[i]._source.thumbnail.search('http') === 0) {
                tn = DOMPurify.sanitize(data.hits[i]._source.thumbnail);
            } else {
                tn = configModule.getApi() + '/api/admin/v1/repo/object/tn?uuid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '&type=' + DOMPurify.sanitize(data.hits[i]._source.mime_type);
            }

            html += '<div class="row">';
            html += '<div class="col-md-3">';

            if (data.hits[i]._source.object_type === 'object') {
                html += '<a href="' + configModule.getApi() + '/api/admin/v1/repo/object/viewer?uuid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '" target="_blank">';
                html += '<img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + tn + '" alt="image" />';
                html += '</a>';
            } else {
                html += '<img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + tn + '" alt="image" />';
            }

            html += '</div>';
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

            if (record.display_record.parts !== undefined && record.display_record.parts.length !== 1) {

                let pid = DOMPurify.sanitize(data.hits[i]._source.pid),
                    type = DOMPurify.sanitize(data.hits[i]._source.mime_type);

                html += '<li><strong>Parts:</strong></li>';
                html += '<ul>';

                for (let i = 0; i < record.display_record.parts.length; i++) {

                    if (i === 10) {
                        html += '<li><strong>Only showing ' + i + ' out of ' + DOMPurify.sanitize(record.display_record.parts.length) + ' parts.</strong></li>';
                        break;
                    } else {

                        html += '<li>' + DOMPurify.sanitize(record.display_record.parts[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.parts[i].type) + ' ) order: ' + DOMPurify.sanitize(record.display_record.parts[i].order);

                        let tn = helperModule.getTn(DOMPurify.sanitize(record.display_record.parts[i].thumbnail), '');
                        html += '<br><img src="' + tn + '" width="100px" height="100px"></li>';
                    }
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

            // handle collections
            if (data.hits[i]._source.object_type === 'collection') {

                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';

                if (is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else if (is_published === 0) {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                html += '<p><a href="' + api + '/dashboard/objects/unpublished?pid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '"><i class="fa fa-info-circle"></i>&nbsp;Unpublished objects</a></p>';
            }

            // handle objects
            if (data.hits[i]._source.object_type === 'object') {

                if (is_compound === 1) {
                    html += '<p><small style="background: cadetblue; padding: 3px; color: white">Compound Object</small></p>';
                } else {
                    html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';
                }

                if (is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else if (is_published === 0) {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data.hits[i]._source.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }
            }

            // update thumbnail
            html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + DOMPurify.sanitize(data.hits[i]._source.pid) + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';

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

        $('a').tooltip();
    };

    obj.init = function () {
        objectsModule.getObjects();
        helperModule.ping();
    };

    return obj;

}());