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
                    } else if (data === false) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Index is not available.</div>');
                    } else {
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
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
                        domModule.html('#status-unpublished-' + pid, published);
                        domModule.id('status-unpublished-' + pid, 'status-published-' + pid);
                    } else {
                        // handles DOM changes on completed unpublished records page
                        let status = '<small>Publishing...</small>';
                        domModule.html('#publish-import-' + pid, status);
                        published = '<i class="fa fa-cloud"></i>';
                        domModule.html('#publish-import-' + pid, published);
                        location.reload();
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
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to publish object(s).');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Unpublishes admin objects
     * @param pid
     * @param type
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
                    unpublished += '<p><a href="/repo/dashboard/object/delete?pid=' +  DOMPurify.sanitize(pid) + '"><i class="fa fa-trash"></i>&nbsp;Delete</a></p>';
                    domModule.html('#status-published-' + pid, unpublished);
                    domModule.id('status-published-' + pid, 'status-unpublished-' + pid);
                }, 5000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
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

        let token = userModule.getUserToken();
        let url = api + endpoints.repo_object_unpublished,
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
                        renderUnpublishedRecords(data);
                    }
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get unpublished records.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Renders unpublished records
     * @param data
     */
    const renderUnpublishedRecords = function (data) {

        let html = '';
        let alignTd = 'style="text-align: center; vertical-align: top; font-size:15px"';
        let token = userModule.getUserToken();

        data.sort((a, b) => a.collection_title.localeCompare(b.collection_title));

        for (let i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td width="25%" ' + alignTd + '>';
            html += '<h3>' + data[i].collection_title + '</h3>';
            html += '<a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data[i].collection_uuid) + '\', \'collection\'); return false;" class="btn btn-primary" data-title="Publish all records in this collection" title="Publish all records in this collection" data-toggle="tooltip" data-placement="bottom"> <i class="fa fa-cloud-upload"></i></a>';
            html += '</td>';
            html += '<table class="table table-striped table-bordered table-hover">';

            for (let j=0;j<data[i].child_records.length;j++) {

                let metadata = JSON.parse(data[i].child_records[j].mods);
                let object_link = `<a href="${api}${endpoints.repo_object_viewer}?uuid=${data[i].child_records[j].pid}&t=${token}" target="_blank" data-title="View object" title="View object" data-toggle="tooltip" data-placement="bottom">${metadata.title}</a>`;
                let compound = '';

                if (metadata.is_compound === true) {
                    compound = '&nbsp;&nbsp;<i class="fa fa-cubes"></i>';
                }

                html += '<tr>';
                html += '<td style="text-align: right; vertical-align: center;width: 80%;font-size: 15px">';
                html += `<small id="publish-import-${data[i].child_records[j].pid}"></small>&nbsp;&nbsp;${compound} ${object_link}&nbsp;&nbsp;`;
                html += `<br><small><em>Ingested on ${DOMPurify.sanitize(moment(data[i].child_records[j].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a'))}</em></small>`;
                html += '</td>';
                html += '<td style="width:20%;text-align: center">';
                html += '<a href="#" data-title="Publish record" title="Publish record" data-toggle="tooltip" data-placement="left" class="btn btn-primary" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data[i].child_records[j].pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i></a>&nbsp;|&nbsp;';
                html += '<a class="btn btn-danger" role="button" data-title="Delete record" title="Delete record" data-toggle="tooltip" data-placement="right" title="Delete" href="/repo/dashboard/object/delete?pid=' + DOMPurify.sanitize(data[i].child_records[j].pid) + '"><i class="fa fa-trash"></i></a>';
                html += '</td>';
                html += '</tr>';
            }

            html += '</table>';
            html += '</td>';
            html += '</tr>';
        }

        domModule.html('#unpublished-records', html);
        document.querySelector('#message').remove();
        document.querySelector('#unpublished').style.visibility = 'visible';
        $('[data-toggle="tooltip"]').tooltip();
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

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '. Unable to get incomplete records.');
            }
        };

        httpModule.req(request, callback);
    };

    /** TODO
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
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
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
            // add_collection_link = '<a href="/dashboard/collections/add?is_member_of_collection=' + configModule.getRootPid() + '"><i class="fa fa-plus"></i>&nbsp;Add top-level collection</a>';
            domModule.html('#collection-name', 'Collections');
            domModule.html('#total-records', '<p>Total Collections: ' + total_records + '</p>');
        } else if (q === null && is_member_of_collection !== null && is_member_of_collection !== configModule.getRootPid()) {
            // add_collection_link = '<a href="/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection + '"><i class="fa fa-plus"></i>&nbsp;Add sub-collection</a>';
            if (total_records.length !== 0) {
                domModule.html('#total-records', '<p>Total Objects: ' + total_records + '</p>');
            } else {
                domModule.html('#current-collection', null);
            }
        } else if (q !== null) {
            domModule.html('#searched-for', '<p>You searched for: <em><strong>' + q + '</strong></em></p>');
            domModule.html('#total-records', '<p>Total Search Results: ' + total_records + '</p>');
            // add_collection_link = '';
        }

        // domModule.html('#add-collection-link', add_collection_link);

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

        let url = api + endpoints.import_metadata + '/' + pid,
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

                setTimeout(() => {
                    domModule.html('#update-' + pid, '<i class="fa fa-code"></i> Update Metadata');
                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update metadata.');
            }
        };

        httpModule.req(request, callback);
        return false;
    };

    /**
     * Starts delete process
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
                        window.location.replace('/repo/dashboard/objects');
                    }, 5000);

                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
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

                        domModule.html('#title', display_record.display_record.title);
                        // document.querySelector('#transcript-form-save-button').addEventListener('click', objectsModule.saveTranscript);
                        // TODO: document.querySelector('#transcript-form-cancel-button').addEventListener('click', cancel);

                        /*
                        Array.prototype.findCallNumber = function(call_number) {

                            for(let i = 0; i < this.length;i++) {
                                if(this[i].indexOf(call_number) !== -1)
                                    return this[i];
                            }

                            return -1;
                        };

                        let images_arr = [];

                        for (let i=0;i<display_record.display_record.parts.length;i++) {
                            images_arr.push(display_record.display_record.parts[i].object);
                        }
                        */

                        if (mode === 'view') {

                            let html = '';

                            for (let i=0;i<display_record.display_record.parts.length;i++) {

                                if (display_record.display_record.parts[i].transcript !== undefined) {

                                    let title = display_record.display_record.parts[i].title.replace('.tif', '');
                                    let transcript = display_record.display_record.parts[i].transcript;
                                    let object_path = display_record.display_record.parts[i].object;
                                    let object_arr = object_path.split('/');
                                    let file_name = object_arr[object_arr.length - 1].replace('tif', 'jpg');
                                    let img = api + apiModule.endpoints().repo_object_image + '?sip_uuid=' + sip_uuid + '&full_path=' + object_path + '&object_name=' + file_name + '&mime_type=image/tiff&t=' + token;

                                    html += `
                                    <div class="row">
                                    <div class="col-sm-6" style="padding: 3px">
                                        <img src="${img}" alt="${title}" width="550px"">
                                    </div>
                                    <div class="col-sm-6" style="padding: 3px;">
                                        <h4>${title}</h4>
                                        <p>${transcript}</p>
                                    </div>
                                    </div><hr>`;
                                }
                            }

                            // domModule.html('#edit-transcript', '<a href="/dashboard/transcript?mode=edit&sip_uuid=' + sip_uuid + '">Edit Transcript</a>');
                            domModule.html('#record-transcript', html);

                        } else if (mode === 'add') {
                            document.querySelector('#transcript-form').style.display = 'block';
                        } else if (mode === 'edit') {
                            document.querySelector('#transcript-form').style.display = 'block';
                            // domModule.val('#transcript', display_record.transcript);
                        }
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get objects.');
            }
        };

        httpModule.req(request, callback);
    };

    /** TODO: refactor
     * Save transcript to record
     * @returns {boolean}
     */
    obj.saveTranscript = function () {

        let sip_uuid = helperModule.getParameterByName('sip_uuid');

        if (sip_uuid === null) {
            return false;
        }

        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> <em>Saving Transcript...</em></div>');

        let obj = {
            sip_uuid: sip_uuid,
            transcript: CKEDITOR.instances.transcript.getData()
        };

        domModule.hide('#transcript-form');

        let url = api + endpoints.repo_transcript,
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
                    window.location.replace('/dashboard/transcript?mode=view&sip_uuid=' + sip_uuid);
                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else {
                domModule.show('#transcript-form');
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add transcript.');
            }
        };

        httpModule.req(request, callback);
    };

    /** TODO: deprecate
     * Gets image data to retrieve from image server
     */
    obj.getImageData = function () {

        let pid = helperModule.getParameterByName('pid');
        let t = helperModule.getParameterByName('t');
        let url = api + endpoints.repo_object + '?pid=' + pid + '&t=' + t;
        // let token = userModule.getUserToken(),
        let request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                    // 'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    domModule.html('#message', null);
                    let record = data.pop();
                    let recordObj = JSON.parse(record.display_record);

                    if (recordObj.mime_type === 'image/tiff') {

                        if (recordObj.is_compound === 0) {

                            let objectPath = recordObj.object;
                            let objArr = objectPath.split('/');
                            let fileName;
                            let imageArr = [];

                            if (objectPath.indexOf('.jp2') !== -1) {
                                objectPath = objectPath.replace('.jp2', '.tif');
                            }

                            if (objArr[objArr.length - 1].indexOf('.tif') !== -1) {
                                fileName = objArr[objArr.length - 1].replace('.tif', '.jpg');
                            } else if (objArr[objArr.length - 1].indexOf('.jp2') !== -1) {
                                fileName = objArr[objArr.length - 1].replace('.jp2', '.jpg');
                            }

                            let image = api + apiModule.endpoints().repo_object_image + '?sip_uuid=' + pid + '&full_path=' + objectPath + '&object_name=' + fileName + '&mime_type=image/tiff&t=' + t;

                            imageArr.push({
                                title: fileName,
                                src: image,
                                close: false
                            });

                            document.querySelector('#objects').innerHTML = `<a class="spotlight" href="${image}"></a>`;
                            Spotlight.show(imageArr, {
                                preload: true
                            });

                        } else if (recordObj.is_compound === 1) {

                            if (recordObj.display_record.parts.length > 0) {

                                let parts = recordObj.display_record.parts;
                                let imageArr = [];
                                let fragment = '';

                                for (let i=0;i<parts.length;i++) {

                                    let objArr = parts[i].object.split('/');
                                    let objectPath = parts[i].object;
                                    let fileName;

                                    if (objectPath.indexOf('.jp2') !== -1) {
                                        objectPath = objectPath.replace('.jp2', '.tif');
                                    }

                                    if (objArr[objArr.length - 1].indexOf('.tif') !== -1) {
                                        fileName = objArr[objArr.length - 1].replace('.tif', '.jpg');
                                    } else if (objArr[objArr.length - 1].indexOf('.jp2') !== -1) {
                                        fileName = objArr[objArr.length - 1].replace('.jp2', '.jpg');
                                    }

                                    let image = api + apiModule.endpoints().repo_object_image + '?sip_uuid=' + pid + '&full_path=' + objectPath + '&object_name=' + fileName + '&mime_type=image/tiff&t=' + t;

                                    imageArr.push({
                                        title: fileName,
                                        src: image,
                                        close: false
                                    });

                                    fragment += `<a class="spotlight" href="${image}"></a>`;
                                }

                                document.querySelector('#objects').innerHTML = fragment;
                                Spotlight.show(imageArr, {
                                    preload: true
                                });
                            }
                        }
                    }
                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get record.');
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