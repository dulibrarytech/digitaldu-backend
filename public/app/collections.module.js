const collectionsModule = (function () {

    'use strict';

    let obj = {};

    const renderError = function (message) {
        $('#message').html(message);
    };

    let api = configModule.getApi();

    /**
     * Renders root collections
     * @param data
     */
    const renderRootCollections = function (data) {

        let html = '';

        for (let i = 0; i < data.length; i++) {

            let record = JSON.parse(data[i].display_record);
            let tn = helperModule.getTn(data[i].thumbnail, 'collection', data[i].pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="max-height: 250px; max-width: 250px;" display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title !== undefined) {
                html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + data[i].pid + '">' + record.title + '</a></h4>';
            } else {
                html += '<h4>No Title</h4>';
            }

            if (record.abstract !== undefined) {
                html += '<p style="min-height: 75px"><small>' + record.abstract + '</small></p>';
            } else {
                html += '<p style="min-height: 75px"><small>No description.</small></p>';
            }

            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';
            html += '<p>' + data[i].pid + '</p>';

            if (data[i].is_published === 1) {
                html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
            } else {
                html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
            }

            html += '<p><a href="/dashboard/collections/add?is_member_of_collection=' + data[i].pid + '"><i class="fa fa-plus"></i>&nbsp;Add collection</a></p>';
            html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Edit collection</a></p>';
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination
        $('#collections').html(html);
        $('a').tooltip();
    };

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
                    renderRootCollections(data);
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
     * Gets collection edit form data
     * @returns {*|jQuery}
     */
    const getCollectionEditFormData = function () {
        return $('#collection-edit-form').serialize();
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
            // $('#collection-form')[0].reset();

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
     * Updates collection
     */
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
    };

    return obj;

}());

collectionsModule.init();