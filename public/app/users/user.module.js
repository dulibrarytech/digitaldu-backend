var userModule = (function () {

    'use strict';

    var obj = {};
    var api = configModule.getApi();
    var renderError = function () {
        $('#home').html('Error: Unable to retrieve home dashboard data');
    };

    var renderUsers = function (data) {

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

    obj.getUsers = function () {

        $.ajax(api + '/api/admin/v1/users')
            .done(function(data) {
                renderUsers(data);
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