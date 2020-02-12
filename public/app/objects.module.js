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

        if (pid === null || pid === 'codu:root') {
            pid = 'codu:root';
        } else {
            collectionsModule.getCollectionName(pid);
        }

        // TODO:...
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

                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(error.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);

                } else {

                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(error.status) + '). An error has occurred. Unable to get objects.';
                    helperModule.renderError(message);
                }
            });
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

        dom.html('#message', '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Publishing...</div>');

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

                dom.html('#message', '<div class="alert alert-success">Published</div>');

                setTimeout(function () {
                    dom.html('#message', null);
                    objectsModule.getObjects();
                }, 5000);

            } else if (response.status === 418) {

                dom.html('#message', '<div class="alert alert-warning">Unable to publish object. (The object\'s parent collection must be published before attempting to publish one of its objects.)</div>');

                setTimeout(function () {
                    // $('#message').html('');
                    dom.html('#message', null);
                    objectsModule.getObjects();
                }, 7000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.';
                    helperModule.renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {

                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + ').  Unable to publish object(s).';
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

        dom.html('#message', '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Unpublishing...</div>');

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

                dom.html('#message', '<div class="alert alert-success">Unpublished</div>');

                setTimeout(function () {
                    dom.html('#message', null);
                    objectsModule.getObjects();
                }, 8000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + DOMPurify.sanitize(response.status) + ').  Unable to unpublish object(s).');
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

                    dom.html('#message', null);

                    if (data.length === 0) {
                        dom.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>');
                    } else {
                        objectsModule.renderDisplayRecords(data);
                    }
                });

            } else {
                helperModule.renderError('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to get incomplete records.</div>');
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
            dom.html('#objects', html);
            return false;
        }

        dom.html('#total-records', '<p>Total Records: ' + total_records + '</p>');

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
            html += '<p><a href="' + api + '/dashboard/object/thumbnail?pid=' + DOMPurify.sanitize(record.pid) + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        html += helperModule.pagination(is_member_of_collection, total_records);
        dom.html('#pagination', helperModule.pagination(is_member_of_collection, total_records));
        dom.html('#objects', html);
    };

    /**
     * // TODO:...
     * Initiates object download
     * @returns {boolean}

     obj.downloadObject = function () {
        let pid = helperModule.getParameterByName('pid');
        window.location.replace(api + '/api/v1/object/download?pid=' + pid);
        return false;
    };
     */

    obj.init = function () {
        objectsModule.getObjects();
        helperModule.ping();
    };

    return obj;

}());