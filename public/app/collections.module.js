var collectionsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function (message) {
        $('#message').html(message);
    };

    var api = configModule.getApi();

    /**
     * Renders root collections
     * @param data
     */
    var renderRootCollections = function (data) {

        var html = '';

        for (var i = 0; i < data.length; i++) {

            var record = JSON.parse(data[i].display_record);
            var tn = configModule.getTn(data[i].pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="width: 45%; display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title !== undefined) {
                html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + data[i].pid + '">' + record.title[0] + '</a></h4>';
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

        // TODO: implement pagination or infinite scrolling
        $('#collections').html(html);
        $('a').tooltip();
    };

    /**
     * Gets root collections
     */
    obj.getRootCollections = function () {

        userModule.setHeaderUserToken();
        var userPermissions = userModule.getHeaderUserPermissions(),
            permissions = [];

        // TODO: move to lib
        if (userPermissions.length > 1) {

            for (var i=0;i<userPermissions.length;i++) {

                var accessObj = {};
                accessObj.group = userPermissions[i].group_name;
                accessObj.permissions = userPermissions[i].permissions;
                accessObj.resources = userPermissions[i].resources;
                permissions.push(accessObj);
            }

        } else {
            // TODO
        }

        $.ajax({
            url: api + '/api/admin/v1/repo/objects?pid=codu:root',
            type: 'GET',
            headers: {'x-access-permissions': JSON.stringify(permissions)}
        })
            .done(function (data) {
                renderRootCollections(data);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 201) {
                    var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collections.</div>';
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
            var pid = helperModule.getParameterByName('pid');
        }

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/object/?pid=' + pid)
            .done(function (data) {

                var record = JSON.parse(data[0].display_record);
                var title = 'No title.';

                if (record.title !== undefined) {
                    title = record.title[0];
                }

                if (data.length === 0) {
                    return $('#message').html('Collection not found.');
                }

                $('#collection-name').html(title);
            })
            .fail(function (jqXHR, textStatus) {

                if (jqXHR.status !== 200) {
                    var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to retrieve collection name.</div>';
                    renderError(message);
                }
            });
    };

    /**
     * Sets collection pid in collection form (hidden field)
     */
    obj.getIsMemberOfCollection = function () {
        var is_member_of_collection = helperModule.getParameterByName('is_member_of_collection');
        $('#is-member-of-collection').val(is_member_of_collection);
    };

    /**
     * Gets collection form data
     * @returns {*|jQuery}
     */
    var getCollectionFormData = function () {
        return $('#collection-form').serialize();
    };

    /**
     * Adds collection
     */
    var addCollection = function () {

        var message = '<div class="alert alert-info">Saving Collection...</div>';
        $('#collection-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/repo/object',
            type: 'post',
            data: getCollectionFormData()
        }).done(function (data) {

            var message = '<div class="alert alert-success">Collection created (' + data[0].pid + ')</div>';
            $('#message').html(message);
            $('#collection-form').show();
            $('#collection-form')[0].reset();

            setTimeout(function () {
                $('#message').html('');
            }, 3000);

        }).fail(function (jqXHR, textStatus) {

            if (jqXHR.status !== 201) {
                var message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + jqXHR.status + '. Unable to add collection.</div>';
                renderError(message);
            }
        });
    };

    /**
     * Enables collection form validation
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
