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

const collectionsModule = (function () {

    'use strict';

    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Gets collection name
     * @param pid
     */
    obj.getCollectionName = function (pid) {

        if (pid === null) {
            return false;
        }

        if (pid === undefined) {
            let pid = helperModule.getParameterByName('pid');
        }

        // used add collection form
        if (helperModule.getParameterByName('is_member_of_collection') !== null && helperModule.getParameterByName('is_member_of_collection') === configModule.getRootPid()) {
            domModule.html('#collection-type', 'Add top-level collection');
            return false;
        } else if (helperModule.getParameterByName('is_member_of_collection') !== null && helperModule.getParameterByName('is_member_of_collection') !== configModule.getRootPid()) {
            domModule.html('#collection-type', 'Add sub-level collection');
        }

        let token = userModule.getUserToken();
        let url = api + endpoints.repo_object + '?pid=' + pid,
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

                    if (data.length === 0) {
                        return domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-info-circle"></i> Collection name not found.</div>');
                    }

                    let record = JSON.parse(data[0].display_record);
                    let title = 'No title.';

                    if (record.title !== undefined) {
                        title = record.title;
                    }

                    domModule.html('#collection-name', DOMPurify.sanitize(title));
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/repo');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve collection name.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Sets collection pid in collection form (hidden field)
     */
    obj.getIsMemberOfCollection = function () {
        let is_member_of_collection = helperModule.getParameterByName('is_member_of_collection');
        domModule.val('#is-member-of-collection', is_member_of_collection);
        collectionsModule.getCollectionName(is_member_of_collection);
    };

    /**
     * Updates collection thumbnail
     */
    obj.updateThumbnail = function () {

        let obj = {};
        obj.pid = helperModule.getParameterByName('pid');
        obj.thumbnail_url = domModule.val('#thumbnail-url', null);

        if (obj.thumbnail_url.length === 0 || obj.pid.length === 0) {
            domModule.html('#message', '<div class="alert alert-danger"><i class="fa fa-exclamation"></i> Please enter a Repository PID or Thumbnail URL.</div>');
            return false;
        }

        domModule.html('#message', '');

        let token = userModule.getUserToken();
        let url = api + endpoints.repo_object_thumbnail,
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

                domModule.html('#message', '<div class="alert alert-success"><i class="fa fa-check-circle"></i> Thumbnail updated</div>');
                domModule.val('#thumbnail-url', '');

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 4000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). An error has occurred. Unable to update thumbnail.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     *  Sets upload menu item link
     */
    obj.setToUploadMenuItem = function () {

        let pid = helperModule.getParameterByName('pid');
        let menu_item = '<a href="/repo/dashboard/object/thumbnail/upload?pid=' + pid + '"><i class="fa fa-plus"></i>&nbsp;Upload custom thumbnail</a>';
        domModule.html('#to-upload-menu-item', menu_item);
    };

    /**
     * Sets collection information in upload form
     */
    obj.setCollectionInformation = function () {

        const form = document.querySelector('form');
        let pid = helperModule.getParameterByName('pid');
        let input = '<input name="sip_uuid" type="hidden" value="' + pid + '">';
        let token = userModule.getUserToken();
        collectionsModule.getCollectionName(pid);
        domModule.html('#sip-uuid-input', input);
        form.setAttribute('action', '/repo/tn/upload?pid=' + pid + '&t=' + token);
    };

    /**
     * Handles upload success process
     */
    obj.collectionUploadSuccess = function () {

        let t = helperModule.getParameterByName('t');
        let pid = helperModule.getParameterByName('pid');
        let tn = location.protocol + '//' + document.domain + ':' + location.port + '/repo/static/tn/' + pid + '.jpg';
        let redirect = location.protocol + '//' + document.domain + ':' + location.port + '/repo/dashboard/object/thumbnail/upload?pid=' + pid;

        if (t !== null) {

            let html = '<img src="' + tn + '" width="400" height="400" alt="thumbnail">';
            domModule.html('#collection-thumbnail-upload-form', html);

            setTimeout(function() {
                window.location.replace(redirect);
            }, 3000);
        }
    };

    /**
     * Gets collection form data
     * @returns {string}
     */
    const getCollectionFormData = function () {
        return domModule.serialize('#collection-form');
    };

    /**
     * Adds collection
     */
    const addCollection = function () {

        domModule.hide('#collection-form');
        domModule.html('#message', '<div class="alert alert-info">Saving Collection...</div>');

        let collection = getCollectionFormData();
        let arr = collection.split('&');
        let obj = {};

        for (let i=0;i<arr.length;i++) {
            let propsVal = decodeURIComponent(arr[i]).split('=');
            obj[propsVal[0]] = propsVal[1];
        }

        let token = userModule.getUserToken();
        let url = api + endpoints.repo_object,
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

                response.json().then(function (data) {
                    domModule.html('#message', '<div class="alert alert-success">Collection created ( <a href="' + configModule.getApi() + '/dashboard/objects/?pid=' + DOMPurify.sanitize(data[0].pid) + '">' + DOMPurify.sanitize(data[0].pid) + '</a> )');
                    domModule.hide('#collection-form');
                });

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/repo');
                    }, 4000);
                });

            } else if (response.status === 200) {

                domModule.html('#message', '<div class="alert alert-warning">This collection object is already in the repository.</div>');
                domModule.show('#collection-form');

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 5000);

            } else if (response.status === 403) {
                authModule.refresh_token();
            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add collection.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Enable validation on add collection form
     */
    obj.collectionFormValidation = function () {

        document.addEventListener('DOMContentLoaded', function() {
            $('#collection-form').validate({
                submitHandler: function () {
                    addCollection();
                }
            });
        });
    };

    /**
     * Updates collection record and child records metadata
     * @param pid
     */
    obj.updateCollectionMetadata = function(pid) {

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

                domModule.html('#update-' + pid, '<em><i class="fa fa-exclamation-circle"></i> Update may take several hours to complete.');

                setTimeout(function () {
                    domModule.html('#update-' + pid, '');
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
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update collection metadata.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        httpModule.req(request, callback);
        return false;
    };

    return obj;

}());
