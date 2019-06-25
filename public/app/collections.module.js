const collectionsModule = (function () {

    'use strict';

    let obj = {};

    const renderError = function (message) {
        $('#message').html(message);
    };

    let api = configModule.getApi();

    /**
     * Gets root collections
     */
    obj.getRootCollections = function () {

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/repo/objects?pid=codu:root',
            type: 'GET'
        })
            .done(function (data) {

                if (data.length === 0) {
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> No collections found.</div>';
                    $('#collections').html(message);
                } else {
                    helperModule.renderDisplayRecords(data);
                }
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 201) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collections.</div>';

                    if (jqXHR.status === 401) {
                        renderError(message);

                        setTimeout(function () {
                            window.location.replace('/dashboard/error');
                        }, 2000);

                        return false;
                    }

                    renderError(message);
                }
            });
    };

    /**
     * Gets collection name
     * @param pid
     */
    obj.getCollectionName = function (pid) {

        if (pid === undefined) {
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

    /** TODO: refactor to work with archivespace
     * Updates collection
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

    /**
     * Enables collection update form validation
     */
    obj.collectionUpdateFormValidation = function () {

        $(document).ready(function () {
            $('#collection-edit-form').validate({
                submitHandler: function () {
                    updateCollection();
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

    /**
     * Invokes desired functions on every page load
     */
    obj.init = function () {
        userModule.renderUserName();
        collectionsModule.getRootCollections();
        helperModule.ping();
    };

    return obj;

}());

collectionsModule.init();