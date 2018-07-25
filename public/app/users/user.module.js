var userModule = (function () {

    'use strict';

    var obj = {};
    var api = configModule.getApi();
    var renderError = function () {
        $('#home').html('Error: Unable to retrieve home dashboard data');
    };

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    obj.renderUsers = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            // console.log(data[i].id);

            html += '<tr>';
            html += '<td>' + data[i].first_name + '</td>';
            html += '<td>' + data[i].last_name + '</td>';
            html += '<td>' + data[i].email + '</td>';

            if (data[i].status === 1) {
                html += '<td>Active</td>';
            } else {
                html += '<td>Inactive</td>';
            }

            html += '<td><a href="/dashboard/users/detail?id=' + data[i].id + '" title="User Details"><i class="fa fa-user"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/dashboard/users/edit?id=' + data[i].id + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/dashboard/users/delete?id=' + data[i].id + '" title="Delete User"><i class="fa fa-times"></i></a></td>';
            html += '</tr>';
        }

        $('#users').html(html);
        $('.loading').html('');
    };

    var renderUserDetails = function (data) {

        console.log(data);

        var html = '';
        for (var i=0;i<data.length;i++) {

            $('#user-name').html(data[i].first_name + ' ' + data[i].last_name);

            html += '<p><strong>DU ID:</strong> ' + data[i].du_id + '</p>';
            html += '<p><strong>Email:</strong> ' + data[i].email + '</p>';

            if (data[i].status === 1) {
                html += '<p><strong>Status:</strong> Active</p>';
            } else {
                html += '<p><strong>Status:</strong> Inactive</p>';
            }

            html += '<hr>';

            for (var j=0;j<data[i].groups.length;j++) {
                html += '<p><strong>User group:</strong> ' + data[i].groups[j].group_name + '</p>';
            }

        }

        $('#user-details').html(html);
        $('.loading').html('');

    };

    obj.getUsers = function () {

        $.ajax(api + '/api/admin/v1/users')
            .done(function(data) {
                userModule.renderUsers(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getUserGroups = function (user_id, callback) {

        // user "id" passed in
        $.ajax(api + '/api/admin/v1/users/groups?id=' + user_id)
            .done(function(data) {
                callback(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getUserDetails = function () {

        // TODO: sanitize
        var id = getParameterByName('id');

        $.ajax(api + '/api/admin/v1/users?id=' + id)
            .done(function(data) {

                userModule.getUserGroups(id, function (groups) {
                    data[0].groups = groups;
                    renderUserDetails(data);
                });
            })
            .fail(function() {
                renderError();
            });
    };

    obj.checkUserData = function () {
        var data = window.sessionStorage.getItem('repo_data');

        if (data !== null) {
            return true;
        }
    };

    obj.renderUserName = function () {
        var data = JSON.parse(window.sessionStorage.getItem('repo_data'));
        $('#username').html(data.uid);
    };

    obj.init = function () {
        obj.renderUserName();
    };

    return obj;

}());