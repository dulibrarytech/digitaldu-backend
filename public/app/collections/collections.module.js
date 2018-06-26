var collectionsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#collections').html('Error: Unable to retrieve collections');
    };

    // TODO: move to lib...
    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var api = configModule.getApi();

    var renderRootCollections = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            var record = JSON.parse(data[i].display_record);
            // TODO: place domain in config
            var tn = 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + data[i].pid + '/datastreams/TN/content';

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="width: 45%; display: block; padding: 5px;" src="' + tn +'" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title[0] !== undefined) {
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

            if (data[i].is_published === 1) {
                html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
            } else {
                html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
            }

            html += '<p><a href="#"><i class="fa fa-plus"></i>&nbsp;Add Object</a></p>';
            html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Edit Object</a></p>';
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination
        $('#collections').html(html);
        $('a').tooltip();
    };

    obj.getRootCollections = function () {

            $.ajax(api + '/api/admin/v1/objects?pid=codu:root')
                .done(function(data) {
                    renderRootCollections(data);
                })
                .fail(function() {
                    renderError();
                });
    };

    obj.getCollectionName = function (pid) {

        if (pid === undefined) {
            var pid = getParameterByName('pid');
        }

        $.ajax(api + '/api/admin/v1/object/?pid=' + pid)
            .done(function(data) {

                var record = JSON.parse(data[0].display_record);
                var title = 'No title.';

                if (record.title !== undefined) {
                    title = record.title[0];
                }

                if (data.length === 0) {
                    return $('#message').html('Collection not found.');
                }

                $('#collection-name').html(title);
                // $('#collection-description').html(data[0].description);
            })
            .fail(function() {
                renderError();
            });
    };

    /*
    obj.getCollection = function () {

        var collection_id = getParameterByName('collection_id');
        var pid = getParameterByName('pid');

        $.ajax(api + '/api/collection?collection_id=' + collection_id + '&pid=' + pid)
            .done(function(data) {

                if (data.length === 0) {
                    return $('#message').html('Collection not found.');
                }

                $('#id').val(data[0].id);
                $('#pid').val(data[0].pid);
                $('#title').val(data[0].title);
                $('#description').val(data[0].description);

                if (data[0].is_active === 1) {
                    $('#is_active').prop('checked', true);
                }

                if (data[0].is_published === 1) {
                    $('#is_published').prop('checked', true);
                }

                var html = '';
                html += '<a href="tn?id=' + data[0].id + '">'; // TODO...
                html += '<img height="100" alt="' + data[0].title + '" src="' + api + '/api/collection/tn?collection_id=' + data[0].id + '">';
                html += '</a>';

                $('#collection-tn').html(html);
            })
            .fail(function() {
                renderError();
            });
    };
    */

    /*
    var updateCollection = function () {

        var data = {};
        var description;
        var is_active;
        var is_published;

        data.id = $('#id').val();
        data.pid = $('#pid').val();
        data.title = $('#title').val();
        data.description = $('#description').val();

        is_active = $('#is_active').prop('checked');

        if (is_active === false) {
            is_active = 0;
        } else if (is_active === true) {
            is_active = 1;
        }

        is_published = $('#is_published').prop('checked');

        if (is_published === false) {
            is_published = 0;
        } else if (is_published === true) {
            is_published = 1;
        }

        data.is_active = is_active;
        data.is_published = is_published;

        $.ajax({
            url: api + '/api/collection',
            method: 'PUT',
            data: data,
            cache: false
        })
            .done(function (response) {
                if (response.status === 200) {
                    setTimeout(function () {
                        $('#message').html('');
                    }, 3000);

                    $('#message').html('<div class="alert alert-success">' + response.message + '</div>');
                }
            })
            .fail(function () {
                renderError();
            });
    };
    */

    /*
    obj.updateCollectionInit = function () {
        $('#collection-form').validate({
            submitHandler: function () {
                updateCollection();
            }
        });
    };
    */

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());