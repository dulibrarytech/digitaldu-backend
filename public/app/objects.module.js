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

    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Gets repository objects
     */
    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'),
            page = helperModule.getParameterByName('page'),
            total_on_page = helperModule.getParameterByName('total_on_page'),
            sort = helperModule.getParameterByName('sort');

        if (pid === null || pid === configModule.getRootPid()) {
            pid = configModule.getRootPid();
        } else {
            collectionsModule.getCollectionName(pid);
        }

        let url = api + endpoints.repo_objects + '?pid=' + pid;

        if (page !== null && total_on_page !== null) {
            url = api + endpoints.repo_objects + '?pid=' + pid + '&page=' + page + '&total_on_page=' + total_on_page;
        }

        let token = userModule.getUserToken(),
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
                    } else if (data.msg !== undefined) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Index is not available.</div>');
                    } else {
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get objects.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Publishes admin objects
     * @param pid
     * @param type
     */
    obj.publishObject = function (pid, type) {

        let obj = {
            pid: pid,
            type: type
        };

        domModule.html('#publish-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Publishing...</em>');
        // handles DOM changes on completed import page
        domModule.html('#publish-import-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Publishing...</em>');

        let url = api + endpoints.repo_publish,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                setTimeout(function () {

                    let elemId = document.getElementById('publish-' + pid);
                    let published = '';

                    if (elemId !== null) {
                        domModule.html('#publish-' + pid, null);
                        published += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                        published += '<p><a id="unpublish-' + pid + '" href="#' + pid + '" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                        domModule.html('#status-unpublished-' + pid, published);
                        domModule.id('status-unpublished-' + pid, 'status-published-' + pid);
                    } else {
                        // handles DOM changes on completed import page
                        let status = '<small>Publishing...</small>';
                        domModule.html('#publish-import-' + pid, status);
                        published = '<i class="fa fa-cloud"></i>';
                        domModule.html('#publish-import-' + pid, published);
                    }

                }, 5000);

            } else if (response.status === 418) {

                domModule.html('#message', '<div class="alert alert-warning">Unable to publish object. (The object\'s parent collection must be published before attempting to publish one of its objects.)</div>');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 7000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to publish object(s).');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Unpublishes admin objects
     * @param pid
     */
    obj.unpublishObject = function (pid, type) {

        let obj = {
            pid: pid,
            type: type
        };

        domModule.html('#unpublish-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Unpublishing...</em>');

        let url = api + endpoints.repo_unpublish,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                setTimeout(function () {
                    domModule.html('#unpublish-' + pid, null);
                    let unpublished = '';
                    unpublished += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    unpublished += '<p><a id="publish-' + pid + '" href="#' + pid + '" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                    unpublished += '<p><a href="/dashboard/object/delete?pid=' +  DOMPurify.sanitize(pid) + '"><i class="fa fa-trash"></i>&nbsp;Delete</a></p>';
                    domModule.html('#status-published-' + pid, unpublished);
                    domModule.id('status-published-' + pid, 'status-unpublished-' + pid);
                }, 5000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to unpublish object(s).');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Gets unpublished records
     */
    obj.getUnPublishedObjects = function () {

        let pid = helperModule.getParameterByName('pid'),
            token = userModule.getUserToken();

        collectionsModule.getCollectionName(pid);

        let url = api + endpoints.repo_object_unpublished + '?pid=' + pid,
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
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get unpublished records.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Constructs search request
     */
    obj.search = function () {

        let q = helperModule.getParameterByName('q');
        let token = userModule.getUserToken(),
            page = helperModule.getParameterByName('page'),
            total_on_page = helperModule.getParameterByName('total_on_page'),
            sort = helperModule.getParameterByName('sort'),
            url = api + endpoints.search + '?q=' + q;

        if (page !== null && total_on_page !== null) {
            url = api + endpoints.search + '?q=' + q + '&page=' + page + '&total_on_page=' + total_on_page;
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

            if (response.status === 200) {

                response.json().then(function (data) {
                    domModule.html('#message', null);
                    objectsModule.renderDisplayRecords(data);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '. Unable to get incomplete records.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Publishes all unpublished objects in a collection
     */
    obj.publishAllObjects = function () {

        let pid = helperModule.getParameterByName('pid');

        if (pid === null) {
            return false;
        }

        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> <em>Publishing imported objects...</em></div>');

        let obj = {
            pid: pid,
            type: 'collection'
        };

        let url = api + endpoints.repo_publish,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to publish object(s).');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Renders object metadata
     * @param data
     * @returns {boolean}
     */
    obj.renderDisplayRecords = function (data) {

        let is_member_of_collection = helperModule.getParameterByName('pid'),
            q = helperModule.getParameterByName('q'),
            unpublished = helperModule.getParameterByName('unpublished'),
            total_records = data.total.value,
            html = '',
            add_collection_link;

        if (q === null && is_member_of_collection === null || is_member_of_collection === configModule.getRootPid()) {
            add_collection_link = '<a href="/dashboard/collections/add?is_member_of_collection=' + configModule.getRootPid() + '"><i class="fa fa-plus"></i>&nbsp;Add top-level collection</a>';
            domModule.html('#collection-name', 'Collections');
            domModule.html('#total-records', '<p>Total Collections: ' + total_records + '</p>');
        } else if (q === null && is_member_of_collection !== null && is_member_of_collection !== configModule.getRootPid()) {
            add_collection_link = '<a href="/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection + '"><i class="fa fa-plus"></i>&nbsp;Add sub-collection</a>';
            if (total_records.length !== 0) {
                domModule.html('#total-records', '<p>Total Objects: ' + total_records + '</p>');
            } else {
                domModule.html('#current-collection', null);
            }
        } else if (q !== null) {
            domModule.html('#searched-for', '<p>You searched for: <em><strong>' + q + '</strong></em></p>');
            domModule.html('#total-records', '<p>Total Search Results: ' + total_records + '</p>');
            add_collection_link = '';
        }

        domModule.html('#add-collection-link', add_collection_link);

        if (total_records === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No records found.</strong></div>';
            domModule.html('#objects', html);
            return false;
        }

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

        if (unpublished === null) {
            html += helperModule.pagination(is_member_of_collection, total_records);
            domModule.html('#pagination', helperModule.pagination(is_member_of_collection, total_records));
        }

        domModule.html('#objects', html);
    };

    /**
     * Updates metadata record
     * @param pid
     */
    obj.updateMetadata = function(pid) {

        domModule.html('#update-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Updating Metadata...</em>');

        let obj = {};
        obj.sip_uuid = pid;

        let url = api + endpoints.import_metadata_object,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                setTimeout(function () {
                    objectsModule.getObjects();
                    location.hash = '#' + pid;
                }, 4000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update metadata.');
            }
        };

        httpModule.req(request, callback);
        return false;
    };

    /**
     * Starts delete process
     * @param pid
     */
    obj.deleteObject = function() {

        let obj = {};
        obj.pid = helperModule.getParameterByName('pid');
        obj.delete_reason = domModule.val('#delete-reason', null) + '  --deleted by ' + userModule.getUserFullName();

        let url = api + endpoints.repo_object + '?pid=' + obj.pid,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 204) {

                domModule.html('#message', '<div class="alert alert-success">Deleting Object...</div>');
                domModule.hide('#delete-object');

                setTimeout(function () {

                    domModule.html('#message', '<div class="alert alert-success">Object Deleted</div>');

                    setTimeout(function() {
                        domModule.html('#message', null);
                        window.location.replace('/dashboard/objects');
                    }, 5000);

                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to delete object.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Gets transcript for edit form
     */
    obj.getTranscript = function () {

        let sip_uuid = helperModule.getParameterByName('sip_uuid');
        let url = api + endpoints.repo_object + '?pid=' + sip_uuid;
        let mode = helperModule.getParameterByName('mode');
        let token = userModule.getUserToken(),
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
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Transcript not found.</div>');
                    } else if (data.msg !== undefined) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Index is not available.</div>');
                    } else {

                        let record = data.pop();
                        let recordObj = record.display_record;
                        let display_record = JSON.parse(recordObj);

                        document.querySelector('#title').innerHTML = display_record.display_record.title;

                        if (mode === 'view') {
                            document.querySelector('#edit-transcript').innerHTML = '<a href="/dashboard/transcript?mode=edit&sip_uuid=' + sip_uuid + '">Edit Transcript</a>';
                            document.querySelector('#record-transcript').innerHTML = display_record.transcript;
                        } else if (mode === 'add') {
                            document.querySelector('#transcript-form').style.display = 'block';
                        } else if (mode === 'edit') {
                            document.querySelector('#transcript-form').style.display = 'block';
                            document.querySelector('#transcript').value = display_record.transcript;
                        }

                        console.log(display_record.display_record);
                        console.log(display_record.display_record.uri);



                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get objects.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Add transcript to record
     * @returns {boolean}
     */
    obj.addTranscript = function () {

        let pid = helperModule.getParameterByName('pid');

        if (pid === null) {
            return false;
        }

        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> <em>Saving Transcript...</em></div>');

        let obj = {
            pid: pid,
            transcript: '' // TODO: get from form
        };

        let url = api + endpoints.repo_publish, // TODO:...
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add transcript.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {

        domModule.html('#message', '<strong><em>Loading...</em></strong>');

        if (helperModule.getParameterByName('q') === null) {
            objectsModule.getObjects();
        } else {
            objectsModule.search();
        }
    };

    return obj;

}());