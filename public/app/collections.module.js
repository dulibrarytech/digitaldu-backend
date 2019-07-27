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

            let message = '<div class="alert alert-success">Collection created (' + data[0].pid + ')</div>';
            $('#message').html(message);
            $('#collection-form').hide();

            setTimeout(function () {
                $('#message').html('');
                window.location.replace(api + '/dashboard/root-collections');
            }, 3000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to add collection.</div>';
                renderError(message);
            }
        });
    };

    /**
     * Updates collection thumbnail
     */
    obj.updateThumbnail = function () {

        let obj = {};
        obj.pid = helperModule.getParameterByName('pid');
        obj.collection_thumbnail_url = $('#collection-thumbnail-url').val();

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

                /*
                response.json().then(function (response) {

                    let message = '<div class="alert alert-success"><i class="fa fa-check-circle"></i> Thumbnail updated</div>';
                    $('#message').html(message);

                    setTimeout(function () {
                        $('#message').html('');
                        objectsModule.getObjects();
                    }, 4000);

                });
                */

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

    /** TODO: refactor to work with archivespace
     * Updates collection thumbnail
     */
    /*
    const updateCollection = function () {

        let message = '<div class="alert alert-info">Updating Collection...</div>';
        $('#object-edit-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/repo/object',
            type: 'put',
            data: getCollectionEditFormData()
        }).done(function (data) {

            objectsModule.editObject(data[0].pid);
-
            let message = '<div class="alert alert-success">Collection updated</div>';
            $('#message').html(message);
            $('#collection-edit-form').show();
            $('#collection-edit-form')[0].reset();

            setTimeout(function () {
                $('#message').html('');
            }, 3000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to add collection.</div>';
                renderError(message);
            }
        });
    };
    */

    /** // TODO: wire into archivespace updates
     * Enables collection update form validation
     */
    obj.collectionUpdateFormValidation = function () {

        $(document).ready(function () {
            $('#collection-edit-form').validate({
                submitHandler: function () {
                    // updateCollection();
                }
            });
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