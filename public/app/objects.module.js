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

        let url = api + '/api/admin/v1/repo/objects?pid=' + pid;

        if (page !== null && total_on_page !== null) {
            url = api + '/api/admin/v1/repo/objects?pid=' + pid + '&page=' + page + '&total_on_page=' + total_on_page;
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
     */
    obj.publishObject = function (pid, type) {

        let obj = {
            pid: pid,
            type: type
        };

        domModule.html('#publish-' + pid, '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Publishing...</div>');

        let url = api + '/api/admin/v1/repo/publish',
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
                    domModule.html('#publish-' + pid, null);
                    objectsModule.getObjects();
                    location.hash = '#' + pid;
                }, 5000);

            } else if (response.status === 418) {

                window.scrollTo({ top: 0, behavior: 'smooth' });
                domModule.html('#message', '<div class="alert alert-warning">Unable to publish object. (The object\'s parent collection must be published before attempting to publish one of its objects.)</div>');

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

        domModule.html('#unpublish-' + pid, '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Unpublishing...</div>');

        let url = api + '/api/admin/v1/repo/unpublish',
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
                    objectsModule.getObjects();
                    location.hash = '#' + pid;
                }, 8000);


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

                    domModule.html('#message', null);

                    if (data.length === 0) {
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>');
                    } else {
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get incomplete records.');
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
            total_records = DOMPurify.sanitize(data.total.value),
            html = '';

        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.total.value === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; No unpublished objects found for this collection.</strong></div>';
            domModule.html('#objects', html);
            return false;
        }

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
     * Updates metadata record
     * @param pid
     */
    obj.updateMetadata = function(pid) {

        window.scrollTo({ top: 0, behavior: 'smooth' });
        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Updating...</div>');

        let obj = {};
        obj.sip_uuid = pid;

        let url = api + '/api/admin/v1/import/metadata/object',
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

                domModule.html('#message', '<div class="alert alert-success"><i class="fa fa-exclamation-circle"></i> Metadata Updated.</div>');

                setTimeout(function () {
                    domModule.html('#message', null);
                    objectsModule.getObjects();
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

        let url = api + '/api/admin/v1/repo/object',
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
                        window.location.replace('/dashboard/collections');
                        // domModule.show('#delete-object');
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

    obj.init = function () {
        objectsModule.getObjects();
    };

    return obj;

}());