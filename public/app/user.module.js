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

    obj.addUserToGroup = function (id) {

        var user_id = id,
            group_id = helperModule.getParameterByName('id'),
            message = '<div class="alert alert-info">Adding user to group...</div>';

        $('#user-form').hide();
        $('#message').html(message);

        $.ajax({
            url: api + '/api/admin/v1/groups/users',
            type: 'post',
            data: {user_id: user_id, group_id: group_id}
        }).done(function (data) {

            var message = '<div class="alert alert-success">User added to group</div>';
            $('#message').html(message);

            setTimeout(function () {
                $('#message').html('');

            }, 3000);

        }).fail(function () {
            var message = '<div class="alert alert-warning">User is already in this group</div>';
            $('#message').html(message);

            setTimeout(function () {
                $('#message').html('');

            }, 3000);
        });
    };

    var renderUsersForGroups = function (data) {

        var html = '';

        for (var i = 0; i < data.length; i++) {

            if (data[i].status === 1) {
                html += '<tr>';
                html += '<td>' + data[i].first_name + '</td>';
                html += '<td>' + data[i].last_name + '</td>';
                html += '<td>' + data[i].email + '</td>';
                html += '<td><a class="btn btn-xs btn-success" href="#" onclick="userModule.addUserToGroup(' + data[i].id + '); return false;" title="Add user to group"><i class="fa fa-plus"></i></a></td>';
                html += '</tr>';
            }
        }

        $('#users').html(html);
        $('.loading').html('');
    };

    var renderUsers = function (data) {

        var html = '';

        for (var i = 0; i < data.length; i++) {

            html += '<tr>';
            html += '<td>' + data[i].first_name + '</td>';
            html += '<td>' + data[i].last_name + '</td>';
            html += '<td>' + data[i].email + '</td>';

            if (data[i].status === 1) {
                html += '<td>Active</td>';
            } else {
                html += '<td>Inactive</td>';
            }

            html += '<td>';
            html += '<a class="btn btn-xs btn-primary" href="/dashboard/users/detail?id=' + data[i].id + '" title="User Details"><i class="fa fa-user"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a class="btn btn-xs btn-default" href="/dashboard/users/edit?id=' + data[i].id + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a class="btn btn-xs btn-danger" href="/dashboard/users/delete?id=' + data[i].id + '" title="Delete User"><i class="fa fa-times"></i></a>';
            html += '</td>';
            html += '</tr>';
        }

        $('#users').html(html);
        $('.loading').html('');
    };

    var renderUserDetails = function (data) {

        var html = '';
        for (var i = 0; i < data.length; i++) {

            $('#user-name').html(data[i].first_name + ' ' + data[i].last_name);

            html += '<p><strong>DU ID:</strong> ' + data[i].du_id + '</p>';
            html += '<p><strong>Email:</strong> ' + data[i].email + '</p>';

            if (data[i].status === 1) {
                html += '<p><strong>Status:</strong> Active</p>';
            } else {
                html += '<p><strong>Status:</strong> Inactive</p>';
            }

            html += '<hr>';

            if (data[i].groups !== undefined) {
                for (var j = 0; j < data[i].groups.length; j++) {
                    html += '<p><strong>User group:</strong> ' + data[i].groups[j].group_name + '</p>';
                }
            }
        }

        $('#user-details').html(html);
        $('.loading').html('');
    };

    obj.getUsers = function () {

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users')
            .done(function (data) {
                renderUsers(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.getUsersForGroups = function () {

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users')
            .done(function (data) {
                renderUsersForGroups(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.getUserGroups = function (user_id, callback) {

        userModule.setHeaderUserToken();

        // user "id" passed in
        $.ajax(api + '/api/admin/v1/users/groups?id=' + user_id)
            .done(function (data) {
                callback(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.getUserDetails = function () {

        // TODO: sanitize
        var id = getParameterByName('id');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users?id=' + id)
            .done(function (data) {

                userModule.getUserGroups(id, function (groups) {
                    data[0].groups = groups;
                    renderUserDetails(data);
                });
            })
            .fail(function () {
                renderError();
            });
    };

    obj.checkUserData = function () {
        var data = window.sessionStorage.getItem('repo_user');

        if (data !== null) {
            return true;
        }
    };

    obj.renderUserName = function () {
        var data = JSON.parse(window.sessionStorage.getItem('repo_user'));
        $('.username').html('<strong>' + data.name + '</strong>');
    };

    var getUserFormData = function () {
        return $('#user-form').serialize();
    };

    obj.getUserFullName = function () {
        var data = JSON.parse(window.sessionStorage.getItem('repo_user'));
        return data.name;
    };

    var addUser = function () {

        var message = '<div class="alert alert-info">Saving User...</div>';
        $('#user-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/users',
            type: 'post',
            data: getUserFormData()
        }).done(function (data) {

            var message = '<div class="alert alert-success">User created</div>';
            $('#message').html(message);
            $('#user-form').show();
            $('#user-form')[0].reset();

            setTimeout(function () {
                $('#message').html('');

            }, 3000);

        }).fail(function () {
            renderError();
        });
    };

    obj.userFormValidation = function () {

        $(document).ready(function () {
            $('#user-form').validate({
                submitHandler: function () {
                    addUser();
                }
            });
        });
    };

    obj.getHeaderUserPermissions = function () {

        var data = window.sessionStorage.getItem('repo_user'),
            user = JSON.parse(data);
            var userPermissions = user.groups;

        return userPermissions;
    };

    obj.setHeaderUserToken = function () {

        var data = window.sessionStorage.getItem('repo_token');

        if (data.token === null) {
            // TODO: redirect to login
        }

        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('x-access-token', data.token);
            }
        });
    };

    // TODO:...
    obj.getAuthUserData = function () {

        userModule.saveToken();
        // TODO: sanitize
        var uid = helperModule.getParameterByName('uid');

        if (uid !== null) {

            userModule.setHeaderUserToken();

            $.ajax(api + '/api/admin/v1/users?id=' + uid)
                .done(function (data) {

                    userModule.getUserGroups(uid, function (groups) {

                        data[0].groups = groups;
                        userModule.saveUserAuthData(data);
                        userModule.renderUserName();
                    });
                })
                .fail(function () {
                    renderError();
                });
        } else {
            userModule.renderUserName();
        }
    };

    obj.saveUserAuthData = function (data) {

        var userObj = {
            uid: data[0].id,
            name: data[0].first_name + ' ' + data[0].last_name,
            groups: data[0].groups
        };

        window.sessionStorage.setItem('repo_user', JSON.stringify(userObj));
    };

    obj.saveToken = function () {

        var token = helperModule.getParameterByName('t');

        if (token !== null) {
            var data = {
                token: token
            };

            window.sessionStorage.setItem('repo_token', JSON.stringify(data));
        }
    };

    /* used when user logs out */
    obj.reset = function () {
        window.sessionStorage.clear();
    };

    obj.init = function () {
        obj.renderUserName();
    };

    return obj;

}());