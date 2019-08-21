/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

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

        for (let i = 0; i < data.length; i++) {

            $('#id').val(data[i].id);
            $('#du_id').val(data[i].du_id);
            $('#email').val(data[i].email);
            $('#first_name').val(data[i].first_name);
            $('#last_name').val(data[i].last_name);

            if (data[i].status === 1) {
                $('#is_active').attr('checked', true);
            } else {
                $('#is_active').attr('checked', false);
            }
        }

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
        let id = helperModule.getParameterByName('id');

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

    const getUserFormUpateData = function () {

        let User = {};
            User.id = $('#id').val();
            User.first_name = $('#first_name').val();
            User.last_name = $('#last_name').val();

        if ($('#is_active').prop('checked')) {
            User.is_active = 1;
        } else {
            User.is_active = 0;
        }

        return User;
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

    const updateUser = function () {

        let message = '<div class="alert alert-info">Updating User...</div>';
        $('#user-form').hide();
        $('#message').html(message);

        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/users',
            type: 'put',
            data: getUserFormUpateData()
        }).done(function (data) {

            let message = '<div class="alert alert-success">User updated</div>';
            $('#message').html(message);
            $('#user-update-form').hide();

            setTimeout(function () {
                $('#message').html('');
                window.location.replace('/dashboard/users');
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

    obj.userUpdateFormValidation = function () {

        $(document).ready(function () {
            $('#user-update-form').validate({
                submitHandler: function () {
                    updateUser();
                }
            });
        });
    };

    obj.getUserToken = function () {

        let data = JSON.parse(window.sessionStorage.getItem('repo_token'));

        if (data.token === null) {
            // TODO: redirect to login
            window.alert('token not found');
        } else {
            return data.token;
        }
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

    const authenticate = function () {

        document.getElementById('login-button').disabled = true;

        let user = {
            username: $('#username').val(),
            password: $('#password').val()
        };

        let url = api + '/api/authenticate',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (response) {

                    let message = '<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + response.message + '</div>';
                    $('#message').html(message);

                    setTimeout(function () {
                        window.location.replace(response.redirect);
                    }, 500);

                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    document.getElementById('login-button').disabled = false;
                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + response.message + '</div>';
                    renderError(message);
                });

            } else {
                document.getElementById('login-button').disabled = false;
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Enable validation on login form
     */
    obj.loginFormValidation = function () {
        $('#login-form').validate({
            submitHandler: function () {
                authenticate();
            }
        });
    };

    obj.init = function () {
        obj.renderUserName();
    };

    return obj;

}());

userModule.init();