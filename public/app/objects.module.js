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
    const endpoints = endpointsModule.get_repository_endpoints();
    let obj = {};

    /**
     * Gets repository objects
     */
    obj.getObjects = function () {

        let uuid = helperModule.getParameterByName('uuid'),
            page = helperModule.getParameterByName('page'),
            total_on_page = helperModule.getParameterByName('total_on_page'),
            sort = helperModule.getParameterByName('sort');

        if (uuid === null || uuid === configModule.getRootPid()) {
            uuid = configModule.getRootPid();
        } else {
            collectionsModule.getCollectionName(uuid);
        }

        let url = api + endpoints.repository.repo_records.endpoint + '?uuid=' + uuid;

        if (page !== null && total_on_page !== null) {
            url = api + endpoints.repository.repo_records.endpoint + '?uuid=' + uuid + '&page=' + page + '&total_on_page=' + total_on_page;
        }

        let token = authModule.getUserToken(),
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

        // endpoints.repo_publish
        let url = api + endpoints.repo_publish,
            token = authModule.getUserToken(),
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

            } else if (response.status === 200) {

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
     * @param type
     */
    obj.unpublishObject = function (pid, type) {

        let obj = {
            pid: pid,
            type: type
        };

        domModule.html('#unpublish-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Unpublishing...</em>');

        // endpoints.repo_unpublish
        let url = api + endpoints.repo_suppress,
            token = authModule.getUserToken(),
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

        let uuid = helperModule.getParameterByName('uuid'),
            token = userModule.getUserToken();

        collectionsModule.getCollectionName(uuid);

        let url = api + endpoints.repo_suppress + '?uuid=' + uuid,
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
        let token = authModule.getUserToken(),
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

        let is_member_of_collection = helperModule.getParameterByName('uuid'),
            q = helperModule.getParameterByName('q'),
            unpublished = helperModule.getParameterByName('unpublished'),
            total_records = data.total.value,
            html = '',
            add_collection_link;

        if (q === null && is_member_of_collection === null || is_member_of_collection === configModule.getRootPid()) {
            add_collection_link = '<a href="/dashboard/collections/add?is_member_of_collection=' + configModule.getRootPid() + '"><i class="fa fa-plus"></i>&nbsp;Add top-level collection</a>';
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
     * @param uuid
     */
    obj.updateMetadata = function(uuid) {

        domModule.html('#update-' + uuid, '<em><i class="fa fa-exclamation-circle"></i> Updating Metadata...</em>');

        let obj = {};
        obj.sip_uuid = uuid;

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
                    location.hash = '#' + uuid;
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
     */
    obj.deleteObject = function() {

        let obj = {};
        obj.uuid = helperModule.getParameterByName('uuid');
        obj.delete_reason = domModule.val('#delete-reason', null) + '  --deleted by ' + userModule.getUserFullName();

        let url = api + endpoints.repo_object + '?uuid=' + obj.uuid,
            token = authModule.getUserToken(),
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

        let sip_uuid = helperModule.getParameterByName('uuid');
        let url = api + endpoints.repo_object + '?uuid=' + uuid;
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
                                    let img = api + endpointsModule.endpoints().repo_object_image + '?sip_uuid=' + sip_uuid + '&full_path=' + object_path + '&object_name=' + file_name + '&mime_type=image/tiff&t=' + token;

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
     * Save transcript to record
     * @returns {boolean}
     */
    obj.saveTranscript = function () {

        let uuid = helperModule.getParameterByName('uuid');

        if (uuid === null) {
            return false;
        }

        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> <em>Saving Transcript...</em></div>');

        let obj = {
            uuid: uuid,
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
                    window.location.replace('/dashboard/transcript?mode=view&uuid=' + uuid);
                }, 10000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                domModule.show('#transcript-form');
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add transcript.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Gets image data to retrieve from image server
     */
    obj.getImageData = function () {

        let uuid = helperModule.getParameterByName('uuid');
        let t = helperModule.getParameterByName('t');
        let url = api + endpoints.repo_object + '?uuid=' + uuid + '&t=' + t;
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

                            let image = api + endpointsModule.endpoints().repo_object_image + '?sip_uuid=' + pid + '&full_path=' + objectPath + '&object_name=' + fileName + '&mime_type=image/tiff&t=' + t;

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

                                    let image = api + endpointsModule.endpoints().repo_object_image + '?uuid=' + uuid + '&full_path=' + objectPath + '&object_name=' + fileName + '&mime_type=image/tiff&t=' + t;

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
                        window.location.replace('/login');
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