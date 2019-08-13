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

    let obj = {};

    const renderError = function (message) {
        $('#message').html(message);
    };

    let api = configModule.getApi();

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

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/object/?pid=' + pid)
            .done(function (data) {

                let record = JSON.parse(data[0].display_record);
                let title = 'No title.';

                if (record.title !== undefined) {
                    title = record.title;
                }

                if (data.length === 0) {
                    return $('#message').html('Collection not found.');
                }

                $('#collection-name').html(title);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collection name.</div>';
                    renderError(message);
                }
            });
    };

    /**
     * Sets collection pid in collection form (hidden field)
     */
    obj.getIsMemberOfCollection = function () {
        let is_member_of_collection = helperModule.getParameterByName('is_member_of_collection');
        $('#is-member-of-collection').val(is_member_of_collection);
    };

    /**
     * Gets collection form data
     * @returns {*|jQuery}
     */
    const getCollectionFormData = function () {
        return $('#collection-form').serialize();
    };

    /**
     * Updates collection thumbnail
     */
    obj.updateThumbnail = function () {

        let obj = {};
        obj.pid = helperModule.getParameterByName('pid');
        obj.thumbnail_url = $('#thumbnail-url').val();

        userModule.setHeaderUserToken();

        let url = api + '/api/admin/v1/repo/object/thumbnail',
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

                let message = '<div class="alert alert-success"><i class="fa fa-check-circle"></i> Thumbnail updated</div>';
                $('#message').html(message);

                setTimeout(function () {
                    $('#message').html('');
                    // objectsModule.getObjects();
                }, 4000);

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.</div>';
                    renderError(message);

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '). An error has occurred. Unable to update thumbnail.</div>';
                renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Adds collection
     */
    const addCollection = function () {

        let message = '<div class="alert alert-info">Saving Collection...</div>';
        $('#collection-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/repo/object',
            type: 'post',
            data: getCollectionFormData()
        }).done(function (data) {

            let message = '<div class="alert alert-success">Collection created ( <a href="' + configModule.getApi() + '/dashboard/objects/?pid=' + data[0].pid + '">' + data[0].pid + '</a> )';
            $('#message').html(message);
            $('#collection-form').hide();

            return false;

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to add collection.</div>';
                renderError(message);
            }
        });
    };

    /**
     * Enable validation on add collection form
     */
    obj.collectionFormValidation = function () {

        $(document).ready(function () {
            $('#collection-form').validate({
                submitHandler: function () {
                    addCollection();
                }
            });
        });
    };

    return obj;

}());