const userModule = (function () {

    'use strict';

    let obj = {};
    let api = configModule.getApi();
    const renderError = function (message) {
        $('#message').html(message);
    };

    const renderUsers = function (data) {

        let html = '';

        for (let i = 0; i < data.length; i++) {

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
            // html += '<a class="btn btn-xs btn-primary" href="/dashboard/users/detail?id=' + data[i].id + '" title="User Details"><i class="fa fa-user"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '&nbsp;';
            html += '<a class="btn btn-xs btn-default" href="/dashboard/users/edit?id=' + data[i].id + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a class="btn btn-xs btn-danger" href="/dashboard/users/delete?id=' + data[i].id + '" title="Delete User"><i class="fa fa-times"></i></a>';
            html += '</td>';
            html += '</tr>';
        }

        $('#users').html(html);
        $('.loading').html('');
    };

    const renderUserDetails = function (data) {

        let html = '';
        for (let i = 0; i < data.length; i++) {

            $('#user-name').html(data[i].first_name + ' ' + data[i].last_name);

            html += '<p><strong>DU ID:</strong> ' + data[i].du_id + '</p>';
            html += '<p><strong>Email:</strong> ' + data[i].email + '</p>';

            if (data[i].status === 1) {
                html += '<p><strong>Status:</strong> Active</p>';
            } else {
                html += '<p><strong>Status:</strong> Inactive</p>';
            }

            html += '<hr>';
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

    obj.getUserDetails = function () {

        // TODO: sanitize
        let id = getParameterByName('id');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users?id=' + id)
            .done(function (data) {
                renderUserDetails(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.checkUserData = function () {
        let data = window.sessionStorage.getItem('repo_user');

        if (data !== null) {
            return true;
        }
    };

    obj.renderUserName = function () {
        let data = JSON.parse(window.sessionStorage.getItem('repo_user'));

        if (data !== null) {
            $('.username').html('<strong>' + data.name + '</strong>');
        } else {
            $('.username').html('<strong>User</strong>');
        }

    };

    const getUserFormData = function () {
        return $('#user-form').serialize();
    };

    obj.getUserFullName = function () {
        let data = JSON.parse(window.sessionStorage.getItem('repo_user'));
        return data.name;
    };

    const addUser = function () {

        let message = '<div class="alert alert-info">Saving User...</div>';
        $('#user-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/users',
            type: 'post',
            data: getUserFormData()
        }).done(function (data) {

            let message = '<div class="alert alert-success">User created</div>';
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

    obj.setHeaderUserToken = function () {

        let data = JSON.parse(window.sessionStorage.getItem('repo_token'));

        if (data.token === null) {
            // TODO: redirect to login
            window.alert('oops');
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
        let uid = helperModule.getParameterByName('uid');

        if (uid !== null) {

            userModule.setHeaderUserToken();

            $.ajax(api + '/api/admin/v1/users?id=' + uid)
                .done(function (data) {
                    userModule.saveUserAuthData(data);
                    userModule.renderUserName();
                })
                .fail(function () {
                    // TODO: redirect
                    renderError();
                });
        } else {
            userModule.renderUserName();
        }
    };

    obj.sessionExpired = function () {
        window.sessionStorage.removeItem('repo_user');
        setTimeout(function () {
            window.location.replace('/login');
        }, 2000);
    };

    obj.saveUserAuthData = function (data) {

        let userObj = {
            uid: data[0].id,
            name: data[0].first_name + ' ' + data[0].last_name
        };

        window.sessionStorage.setItem('repo_user', JSON.stringify(userObj));
    };

    obj.saveToken = function () {

        let token = helperModule.getParameterByName('t');

        if (token !== null) {

            let data = {
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
        // helperModule.ping();
    };

    return obj;

}());

userModule.init();