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

    var renderCollections = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {
            html += '<div class="col-md-55">';
            html += '<div class="thumbnail">';
            html += '<div class="image view view-first">';
            html += '<img style="width: 100%; display: block;" src="' + api + '/api/collection/tn?collection_id=' + data[i].id + '" alt="image" />';
            html += '<div class="mask">';
            html += '<div class="tools tools-bottom">';
            html += '<a href="/dashboard/objects?pid=' + data[i].pid + '" title="View Collection Objects"><i class="fa fa-list"></i></a>';
            html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a href="/dashboard/collection/edit?collection_id=' + data[i].id + '&pid=' + data[i].pid + '" title="Edit Collection"><i class="fa fa-edit"></i></a>';
            html += '</div></div></div>';
            html += '<div class="caption">';
            html += '<p><strong>' + data[i].title + '</strong></p>';
            html += '<p>&nbsp;</p></div></div></div>';
        }

        // TODO: implement pagination
        $('#collections').html(html);
        $('a').tooltip();
    };

    obj.getCollections = function () {

        var community_id = getParameterByName('community_id');

        if (community_id !== null) {
            $.ajax(api + '/api/collections?community_id=' + community_id)
                .done(function(data) {
                    renderCollections(data);
                })
                .fail(function() {
                    renderError();
                });
        } else {
            $.ajax(api + '/api/collections')
                .done(function(data) {
                    console.log(data);
                    renderCollections(data);
                })
                .fail(function() {
                    renderError();
                });
        }
    };

    obj.getCollectionName = function (pid) {

        if (pid === undefined) {
            var pid = getParameterByName('pid');
        }

        $.ajax(api + '/api/collection/name?pid=' + pid)
            .done(function(data) {

                if (data.length === 0) {
                    return $('#message').html('Collection not found.');
                }

                $('#collection-name').html(data[0].title);
                $('#collection-description').html(data[0].description);
            })
            .fail(function() {
                renderError();
            });
    };

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

    obj.updateCollectionInit = function () {
        $('#collection-form').validate({
            submitHandler: function () {
                updateCollection();
            }
        });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());