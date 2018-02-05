var communitiesModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#communities').html('Error: Unable to retrieve communities');
    };

    var api = configModule.getApi();

    /*=========get all communities=========*/
    var renderCommunities = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {
            html += '<div class="col-md-55">';
            html += '<div class="thumbnail">';
            html += '<div class="image view view-first">';
            html += '<img style="width: 100%; display: block;" src="' + api + '/api/community/tn?community_id=' + data[i].id + '" alt="image" />';
            html += '<div class="mask">';
            html += '<div class="tools tools-bottom">';
            html += '<a href="/dashboard/collections?community_id=' + data[i].id + '" title="View Collections"><i class="fa fa-list"></i></a>';
            html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a href="/dashboard/community/edit?community_id=' + data[i].id + '" title="Edit Community"><i class="fa fa-edit"></i></a>';
            html += '</div></div></div>';
            html += '<div class="caption">';
            html += '<p><strong>' + data[i].title + '</strong></p>';
            html += '<p>&nbsp;</p></div></div></div>';
        }

        // TODO: implement pagination/infinite scrolling?
        $('#communities').html(html);
    };

    obj.getCommunities = function () {
        // TODO: create helper/config for global api endpoints
        $.ajax(api + '/api/communities')
            .done(function(data) {
                renderCommunities(data);
            })
            .fail(function() {
                renderError();
            });
    };

    /*=========edit community=========*/
    obj.getCommunity = function () {
        // TODO: create helper/config for global api endpoints
        // TODO: change to put

        var community_id = helperModule.getParameterByName('community_id');

        $.ajax(api + '/api/communities?community_id=' + community_id)
            .done(function(data) {

                if (data.length === 0) {
                    return $('#message').html('Community not found.');
                }

                $('#id').val(data[0].id);
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
                html += '<img height="100" alt="' + data[0].title + '" src="' + api + '/api/community/tn?community_id=' + data[0].id + '">';
                html += '</a>';

                $('#community-tn').html(html);

            })
            .fail(function() {
                renderError();
            });

    };

    obj.updateCommunity = function () {
        console.log('updating community');

    };

    obj.init = function () {

        userModule.renderUserName();

        /*
        $("#community-form").validate({
            submitHandler: function(form) {
                // some other code
                // maybe disabling submit button
                // then:
                // $(form).submit();
                console.log('meow!');
            }
        });
        */
    };

    return obj;

}());