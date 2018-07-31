var groupsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#message').html('<div class="alert alert-danger">A request error occurred</div>');
    };

    var api = configModule.getApi();

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var renderGroups = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td style="width: 15%">' + data[i].group_name + '</td>';
            html += '<td>' + data[i].group_description + '</td>';
            html += '<td>' + data[i].permissions + '</td>';
            html += '<td>' + data[i].resources + '</td>';
            html += '<td style="width: 15%">';
            html += '<a class="btn btn-xs btn-primary" href="/dashboard/groups/users?id=' + data[i].id + '" title="View users in this group"><i class="fa fa-users"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a class="btn btn-xs btn-default" href="#" title="Edit Group"><i class="fa fa-edit"></i></a>';
            html += '</td>';
            html += '</tr>';
        }

        $('#groups').html(html);
        $('.loading').html('');
    };

    obj.getGroups = function () {

        $.ajax(api + '/api/admin/v1/groups')
            .done(function(data) {
                renderGroups(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.removeUserFromGroup = function (user_id, group_id) {

        $.ajax({
            url: api + '/api/admin/v1/groups/users?user_id=' + user_id + '&group_id=' + group_id,
            type: 'delete'
        }).done(function (data) {

            var message = '<div class="alert alert-success">User removed from group</div>';
            $('#message').html(message);

            setTimeout(function () {
                $('#message').html('');
                groupsModule.getGroupUsers();
            }, 3000);

        }).fail(function () {
            renderError();
        });
    };

    var renderGroupUsers = function (data) {

        var group_id = getParameterByName('id');

        var html = '';

        for (var i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td>' + data[i].first_name + '</td>';
            html += '<td>' + data[i].last_name + '</td>';
            html += '<td>' + data[i].email + '</td>';

            if (data[i].status === 1) {
                html += '<td>Active</td>';
            } else {
                html += '<td>Inactive</td>';
            }

            html += '<td><a class="btn btn-xs btn-danger" onclick="groupsModule.removeUserFromGroup(' + data[i].id + ', ' + group_id + '); return false;" title="Remove user from this group"><i class="fa fa-times"></i></a></td>';
            html += '</tr>';
        }

        $('#users').html(html);
        $('.loading').html('');
    };

    var renderGroup = function (data) {
        $('#add-to-group-title').html('Add user to "' + data[0].group_name + '" group');
    };

    obj.getGroup = function () {

        var group_id = getParameterByName('id');

        $.ajax(api + '/api/admin/v1/groups?id=' + group_id)
            .done(function(data) {
                renderGroup(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getGroupUsers = function () {

        var group_id = getParameterByName('id');

        // set group id link
        $('#group-id').prop('href', '/dashboard/groups/user/add?id=' + group_id);

        $.ajax(api + '/api/admin/v1/groups/users?id=' + group_id)
            .done(function(data) {
                console.log(data);
                $('#group').html('Group: ' + data[0].group_name);
                renderGroupUsers(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());