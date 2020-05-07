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
    let obj = {};

    /**
     * Gets collection name
     * @param pid
     */
    obj.getCollectionName = function (pid) {

        if (pid === null) {
            return false;
        } else if (pid === undefined) {
            let pid = helperModule.getParameterByName('pid');
        }

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/repo/object/?pid=' + pid,
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
                        return domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-info-circle"></i> Collection not found.</div>');
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
                    window.location.replace('/login');
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
    };

    /**
     * Updates collection thumbnail
     */
    obj.updateThumbnail = function () {

        let obj = {};
        obj.pid = helperModule.getParameterByName('pid');
        obj.thumbnail_url = domModule.val('#thumbnail-url', null);

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/repo/object/thumbnail',
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
                        window.location.replace('/login');
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
        let menu_item = '<a href="/dashboard/object/thumbnail/upload?pid=' + pid + '"><i class="fa fa-plus"></i>&nbsp;Upload custom thumbnail</a>';
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
        let tn = location.protocol + '//' + document.domain + ':' + location.port + '/tn/' + pid + '.jpg';
        let redirect = location.protocol + '//' + document.domain + ':' + location.port + '/dashboard/object/thumbnail/upload?pid=' + pid;

        if (t !== null) {

            let html = '<img src="' + tn + '" alt="thumbnail">';
            domModule.html('#collection-thumbnail-upload-form', html);

            setTimeout(function() {
                window.location.replace(redirect);
            }, 5000);
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
        let url = api + '/api/admin/v1/repo/object',
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
                        window.location.replace('/login');
                    }, 4000);
                });

            } else if (response.status === 200) {

                domModule.html('#message', '<div class="alert alert-warning">This collection object is already in the repository.</div>');
                domModule.show('#collection-form');

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 5000);

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
     * Updates collection metadata
     * @param pid
     * @returns {boolean}
     */
    obj.updateCollectionMetadata = function(pid) {

        window.scrollTo({ top: 0, behavior: 'smooth' });
        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> Updating...</div>');

        let obj = {};
        obj.sip_uuid = pid;

        let url = api + '/api/admin/v1/repo/metadata/collection',
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

                domModule.html('#message', '<div class="alert alert-success"><i class="fa fa-exclamation-circle"></i> Collection Metadata Updated.</div>');

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
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update collection metadata.');
            }
        };

        httpModule.req(request, callback);
        return false;
    };

    /**
     * Binds click event to defined selector
     */
    obj.batchUpdateCollectionMetadataListener = function() {
        domModule.getElement('#batch-update-collection-metadata').addEventListener('click', batchUpdateCollectionMetadata);
    };

    /**
     * Batch updates all collection metadata records
     */
    const batchUpdateCollectionMetadata = function () {
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let obj = {};
        let url = api + '/api/admin/v1/utils/batch/update/metadata/collection',
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

                domModule.html('#message', '<div class="alert alert-success"><i class="fa fa-exclamation-circle"></i>  The collection metadata records are being updated.  The process may take awhile depending on the number of collections.</div>');

                setTimeout(function () {
                    domModule.html('#message', null);
                }, 5000);


            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update collection metadata.');
            }
        };

        httpModule.req(request, callback);
        return false;
    };

    return obj;

}());