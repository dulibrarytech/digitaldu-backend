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

    /**
     * Renders user profile data
     * @param data
     */
    const renderUsers = function (data) {

        if (data.length === 0) {
            document.querySelector('.loading').innerHTML = '';
            document.querySelector('.table').innerHTML = '';
            let message = '<div class="alert alert-danger">Unable to get users.</div>';
            helperModule.renderError(message);
            return false;
        }

        let html = '';
        let user;

        for (let i = 0; i < data.length; i++) {

            user = data[i];

            html += '<tr>';
            html += '<td>' + DOMPurify.sanitize(user.first_name) + '</td>';
            html += '<td>' + DOMPurify.sanitize(user.last_name) + '</td>';
            html += '<td>' + DOMPurify.sanitize(user.email) + '</td>';

            if (user.status === 1) {
                html += '<td>Active</td>';
            } else {
                html += '<td>Inactive</td>';
            }

            html += '<td>';
            html += '&nbsp;';
            html += '<a class="btn btn-xs btn-default" href="/dashboard/users/edit?id=' + DOMPurify.sanitize(user.id) + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            html += '<a class="btn btn-xs btn-danger" href="/dashboard/users/delete?id=' + DOMPurify.sanitize(user.id) + '" title="Delete User"><i class="fa fa-times"></i></a>';
            html += '</td>';
            html += '</tr>';
        }

        document.querySelector('#users').innerHTML = html;
        document.querySelector('.loading').innerHTML = '';

        return false;
    };

    /**
     * Renders user profile data for edit form
     * @param data
     */
    const renderUserDetails = function (data) {

        if (data.length === 0) {
            document.querySelector('#user-update-form').innerHTML = '';
            let message = 'Unable to get profile data.';
            helperModule.renderError(message);
            setTimeout(function () {
                window.location.replace('/dashboard/users');
            }, 3000);
            return false;
        }

        let user;

        for (let i = 0; i < data.length; i++) {

            user = data[i];

            $('#id').val(DOMPurify.sanitize(user.id));
            $('#du_id').val(DOMPurify.sanitize(user.du_id));
            $('#email').val(DOMPurify.sanitize(user.email));
            $('#first_name').val(DOMPurify.sanitize(user.first_name));
            $('#last_name').val(DOMPurify.sanitize(user.last_name));

            if (user.status === 1) {
                $('#is_active').prop('checked', true);
            } else {
                $('#is_active').prop('checked', false);
            }
        }

        document.querySelector('.loading').innerHTML = '';

        return false;
    };

    /**
     * Gets all repository users
     */
    obj.getUsers = function () {

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users')
            .done(function (data) {
                renderUsers(data);
            })
            .fail(function () {
                helperModule.renderError('Request Failed.');
            });

        return false;
    };

    /**
     * Retrieves user profile data for edit form
     */
    obj.getUserDetails = function () {

        let id = helperModule.getParameterByName('id');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/users?id=' + id)
            .done(function (data) {
                renderUserDetails(data);
            })
            .fail(function () {
                helperModule.renderError('Request Failed.');
            });

        return false;
    };

    /**
     * Checks if user data is in session storage
     * @returns {boolean}
     */
    obj.checkUserData = function () {
        let data = window.sessionStorage.getItem('repo_user');

        if (data !== null) {
            return true;
        }

        return false;
    };

    /**
     * Renders authenticated username in top menu bar
     */
    obj.renderUserName = function () {

        let usernameClass = document.querySelectorAll('.username');

        for (let i=0;i<usernameClass.length;i++) {
            usernameClass[i].innerHTML = '<strong>Loading...</strong>';
        }

        setTimeout(function () {

            let data = JSON.parse(window.sessionStorage.getItem('repo_user'));

            if (data !== null && usernameClass.length !== 0) {

                for (let i=0;i<usernameClass.length;i++) {
                    usernameClass[i].innerHTML = '<strong>' + DOMPurify.sanitize(data.name) + '</strong>';
                }

            } else if (data === null && usernameClass.length !== 0) {

                 helperModule.renderError('Unable to get user profile data.');

                 setTimeout(function () {
                 window.location.replace('/login');
                 }, 5000);
            }

        }, 500);
    };

    /**
     * Retrieves user form data
     * @returns {*|jQuery}
     */
    const getUserFormData = function () {
        return $('#user-form').serialize();
    };

    const getUserFormUpateData = function () {

        let User = {};
        User.id = DOMPurify.sanitize(document.querySelector('#id').value);
        User.first_name = DOMPurify.sanitize(document.querySelector('#first_name').value);
        User.last_name = DOMPurify.sanitize(document.querySelector('#last_name').value);

        if ($('#is_active').prop('checked')) {
            User.is_active = 1;
        } else {
            User.is_active = 0;
        }

        return User;
    };

    /**
     * Gets user's full name
     * @returns {*|Color}
     */
    obj.getUserFullName = function () {
        let data = JSON.parse(window.sessionStorage.getItem('repo_user'));
        return DOMPurify.sanitize(data.name);
    };

    /**
     * Adds new user to repository
     */
    const addUser = function () {

        let message = '<div class="alert alert-info">Saving User...</div>';
        $('#user-form').hide();
        document.querySelector('#message').innerHTML = message;
        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/users',
            type: 'post',
            data: getUserFormData()
        }).done(function (data) {

            let message = '<div class="alert alert-success">User created</div>';
            document.querySelector('#message').innerHTML = message;
            $('#user-form').show();
            $('#user-form')[0].reset();

            setTimeout(function () {
                document.querySelector('#message').innerHTML = '';
            }, 3000);

        }).fail(function () {
            helperModule.renderError('Request Failed.');
        });
    };

    /**
     * Updates user data
     */
    const updateUser = function () {

        let message = '<div class="alert alert-info">Updating User...</div>';
        $('#user-form').hide();
        document.querySelector('#message').innerHTML = message;
        userModule.setHeaderUserToken();

        $.ajax({
            url: api + '/api/admin/v1/users',
            type: 'put',
            data: getUserFormUpateData()
        }).done(function (data) {

            let message = '<div class="alert alert-success">User updated</div>';
            document.querySelector('#message').innerHTML = message;
            $('#user-update-form').hide();

            setTimeout(function () {
                document.querySelector('#message').innerHTML = '';
                window.location.replace('/dashboard/users');
            }, 3000);

        }).fail(function () {
            helperModule.renderError('Request Failed.');
        });
    };

    /**
     * Applies user form validation when adding new user
     */
    obj.userFormValidation = function () {

        $(document).ready(function () {
            $('#user-form').validate({
                submitHandler: function () {
                    addUser();
                }
            });
        });
    };

    /**
     * Applies user form validation when updating a user
     */
    obj.userUpdateFormValidation = function () {

        $(document).ready(function () {
            $('#user-update-form').validate({
                submitHandler: function () {
                    updateUser();
                }
            });
        });
    };

    /**
     * Gets token from session storage
     * @returns {*|Color}
     */
    obj.getUserToken = function () {

        let data = JSON.parse(window.sessionStorage.getItem('repo_token'));

        if (data !== null && data.token === null) {

            setTimeout(function () {
                window.location.replace('/login');
            }, 0);

        } else {
            return DOMPurify.sanitize(data.token);
        }
    };

    /**
     * Sets session token in request header
     */
    obj.setHeaderUserToken = function () {

        let data = JSON.parse(window.sessionStorage.getItem('repo_token'));

        if (data === null) {
            setTimeout(function () {
                window.location.replace('/login');
            }, 0);
        }

        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('x-access-token', DOMPurify.sanitize(data.token));
            }
        });
    };

    /**
     * Gets user profile data
     */
    obj.getAuthUserData = function () {

        userModule.saveToken();
        let uid = helperModule.getParameterByName('uid');

        if (uid !== null) {

            userModule.setHeaderUserToken();

            $.ajax(api + '/api/admin/v1/users?id=' + uid)
                .done(function (data) {
                    userModule.saveUserAuthData(data);
                    userModule.renderUserName();
                })
                .fail(function () {
                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 0);
                });

        } else {
            userModule.renderUserName();
        }
    };

    /**
     * Destroys session data and redirects user to login
     */
    obj.sessionExpired = function () {
        window.sessionStorage.removeItem('repo_user');
        setTimeout(function () {
            window.location.replace('/login');
        }, 2000);
    };

    /**
     * Saves user profile data to session storage
     * @param data
     */
    obj.saveUserAuthData = function (data) {

        let userObj = {
            uid: DOMPurify.sanitize(data[0].id),
            name: DOMPurify.sanitize(data[0].first_name) + ' ' + DOMPurify.sanitize(data[0].last_name)
        };

        window.sessionStorage.setItem('repo_user', JSON.stringify(userObj));
    };

    /**
     * Gets session token from URL params
     */
    obj.saveToken = function () {

        let token = helperModule.getParameterByName('t');

        if (token !== null) {

            let data = {
                token: DOMPurify.sanitize(token)
            };

            window.sessionStorage.setItem('repo_token', JSON.stringify(data));
        }
    };

    /**
     * Clears out session storage - used when user logs out
     */
    obj.reset = function () {
        window.sessionStorage.clear();
    };

    /**
     * Creates request used to authenticates users
     */
    const authenticate = function () {

        document.querySelector('#login-button').disabled = true;

        let user = {
            username: DOMPurify.sanitize(document.querySelector('#username').value).trim(),
            password: DOMPurify.sanitize(document.querySelector('#password').value).trim()
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

                    let message = '<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + DOMPurify.sanitize(response.message) + '</div>';
                    document.querySelector('#message').innerHTML = message;

                    setTimeout(function () {
                        window.location.replace(response.redirect);
                    }, 500);

                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    document.querySelector('#login-button').disabled = false;
                    let message = DOMPurify.sanitize(response.message);
                    helperModule.renderError(message);
                });

            } else {
                document.querySelector('#login-button').disabled = false;
                let message = 'Error: (HTTP status ' + DOMPurify.sanitize(response.status) + '. Unable to authenticate user.';
                helperModule.renderError(message);
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