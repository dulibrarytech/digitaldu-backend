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

    const api = configModule.getApi();
    let obj = {};

    /**
     * Renders user profile data
     * @param data
     */
    const renderUsers = function (data) {

        if (data.length === 0) {
            domModule.html('.loading', null);
            domModule.html('.table', null);
            helperModule.renderError('Unable to get users.');
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

            if (user.is_active === 1) {
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

        domModule.html('#users', html);
        domModule.html('.loading', null);

        return false;
    };

    /**
     * Renders user profile data for edit form
     * @param data
     */
    const renderUserDetails = function (data) {

        if (data.length === 0) {
            domModule.html('#user-update-form', null);
            helperModule.renderError('Unable to get profile data.');
            setTimeout(function () {
                window.location.replace('/dashboard/users');
            }, 3000);
            return false;
        }

        let user;

        for (let i = 0; i < data.length; i++) {

            user = data[i];

            domModule.val('#id', user.id);
            domModule.val('#du_id', user.du_id);
            domModule.val('#email', user.email);
            domModule.val('#first_name', user.first_name);
            domModule.val('#last_name', user.last_name);

            if (user.is_active === 1) {
                $('#is_active').prop('checked', true);
            } else {
                $('#is_active').prop('checked', false);
            }
        }

        domModule.html('.loading', null);

        return false;
    };

    /**
     * Gets all repository users
     */
    obj.getUsers = function () {

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/users',
            request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {
                    renderUsers(data);
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve users.');
            }
        };

        httpModule.req(request, callback);

        return false;
    };

    /**
     * Retrieves user profile data for edit form
     */
    obj.getUserDetails = function () {

        let id = helperModule.getParameterByName('id');
        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/users?id=' + id,
            request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {
                    renderUserDetails(data);
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve users.');
            }
        };

        httpModule.req(request, callback);

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

        domModule.html('.username', '<strong>Loading...</strong>');

        setTimeout(function () {

            let data = JSON.parse(window.sessionStorage.getItem('repo_user'));

            if (data !== null) {

                domModule.html('.username', '<strong>' + DOMPurify.sanitize(data.name) + '</strong>');

            } else if (data === null && domModule.html('.username')) {

                 helperModule.renderError('Unable to get user profile data.');

                 setTimeout(function () {
                    window.location.replace('/login');
                 }, 5000);
            }

        }, 500);
    };

    /**
     * Retrieves user form data
     * @param id
     * @returns {string}
     */
    const getUserFormData = function (id) {
        return domModule.serialize(id);
    };

    /**
     * Gets update data
     * @returns {{}}
     */
    const getUserFormUpateData = function () {

        let User = {};
        User.id = domModule.val('#id', null);
        User.first_name = domModule.val('#first_name', null);
        User.last_name = domModule.val('#last_name', null);

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

        let user = getUserFormData('#user-form');
        let arr = user.split('&');
        let obj = {};

        domModule.hide('#user-form');
        domModule.html('#message', '<div class="alert alert-info">Saving User...</div>');

        for (let i=0;i<arr.length;i++) {
            let propsVal = decodeURIComponent(arr[i]).split('=');
            obj[propsVal[0]] = propsVal[1];
        }

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/users',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                domModule.html('#message', '<div class="alert alert-success">User created</div>');
                domModule.hide('#user-form');
                document.querySelector('#user-form').reset();

                setTimeout(function () {
                    domModule.html('#message', null);
                    domModule.show('#user-form');
                }, 3000);

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else if (response.status === 200) {

                domModule.html('#message', '<div class="alert alert-warning">User with DU ID ' + obj.du_id + ' is already in the system</div>');
                domModule.show('#user-form');

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to add user.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Updates user data
     */
    const updateUser = function () {

        let obj = getUserFormUpateData();
        domModule.hide('#user-update-form');
        domModule.html('#message', '<div class="alert alert-info">Updating User...</div>');

        let token = userModule.getUserToken();
        let url = api + '/api/admin/v1/users',
            request = new Request(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                domModule.html('#message', '<div class="alert alert-success">User updated</div>');
                domModule.hide('#user-update-form');
                setTimeout(function () {
                    domModule.html('#message', null);
                    window.location.replace('/dashboard/users');
                }, 3000);

                return false;

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update user.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Applies user form validation when adding new user
     */
    obj.userFormValidation = function () {

        document.addEventListener('DOMContentLoaded', function() {
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

        document.addEventListener('DOMContentLoaded', function() {
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

    /** DEPRECATE
     * Sets session token in request header
     */
    /*
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
    */

    /**
     * Gets user profile data after authentication
     */
    obj.getAuthUserData = function () {

        let uid = helperModule.getParameterByName('uid');
        userModule.saveToken();

        if (uid !== null) {

            let token = userModule.getUserToken();
            let url = api + '/api/admin/v1/users?id=' + uid,
                request = new Request(url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });

            const callback = function (response) {

                if (response.status === 200) {

                    response.json().then(function (data) {
                        userModule.saveUserAuthData(data);
                        userModule.renderUserName();
                    });

                } else if (response.status === 401) {

                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                    setTimeout(function () {
                        window.location.replace('/login');
                    }, 4000);

                } else {
                    helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve user profile.');
                }
            };

            httpModule.req(request, callback);

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
            username: domModule.val('#username', null),
            password: domModule.val('#password', null)
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

                    domModule.html('#message', '<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + DOMPurify.sanitize(response.message) + '</div>');

                    setTimeout(function () {
                        window.location.replace(response.redirect);
                    }, 500);

                });

            } else if (response.status === 401) {

                response.json().then(function (response) {
                    document.querySelector('#login-button').disabled = false;
                    helperModule.renderError(DOMPurify.sanitize(response.message));
                });

            } else {
                document.querySelector('#login-button').disabled = false;
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to authenticate user.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Enable validation on login form
     */
    obj.loginFormValidation = function () {

        document.addEventListener('DOMContentLoaded', function() {
            $('#login-form').validate({
                submitHandler: function () {
                    authenticate();
                }
            });
        });
    };

    obj.init = function () {
        obj.renderUserName();
    };

    return obj;

}());

userModule.init();