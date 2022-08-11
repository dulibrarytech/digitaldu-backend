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
    const endpoints = endpointsModule.get_users_endpoints();
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

        let actives = '';
        let inactives = '';
        let user;
        let inactive = [];

        for (let i = 0; i < data.length; i++) {

            user = data[i];

            if (user.is_active === 1) {

                actives += '<tr>';
                actives += '<td>' + DOMPurify.sanitize(user.first_name) + '</td>';
                actives += '<td>' + DOMPurify.sanitize(user.last_name) + '</td>';
                actives += '<td>' + DOMPurify.sanitize(user.email) + '</td>';
                actives += '<td>Active</td>';
                actives += '<td>';
                actives += '&nbsp;';
                actives += '<a class="btn btn-xs btn-default" href="/dashboard/users/edit?id=' + DOMPurify.sanitize(user.id) + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
                actives += '</td>';
                actives += '</tr>';

            }

            if (user.is_active === 0) {
                inactive.push(user);
            }
        }

        for (let i = 0; i < inactive.length; i++) {

            user = inactive[i];

            inactives += '<tr>';
            inactives += '<td>' + DOMPurify.sanitize(user.first_name) + '</td>';
            inactives += '<td>' + DOMPurify.sanitize(user.last_name) + '</td>';
            inactives += '<td>' + DOMPurify.sanitize(user.email) + '</td>';
            inactives += '<td style="background: red;color: white">Inactive</td>';
            inactives += '<td>';
            inactives += '&nbsp;';
            inactives += '<a class="btn btn-xs btn-default" href="/dashboard/users/edit?id=' + DOMPurify.sanitize(user.id) + '" title="Edit User"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;';
            inactives += '<a class="btn btn-xs btn-danger" href="/dashboard/users/delete?id=' + DOMPurify.sanitize(user.id) + '" title="Delete User"><i class="fa fa-times"></i></a>';
            inactives += '</td>';
            inactives += '</tr>';
        }

        domModule.html('#active-users', actives);
        domModule.html('#inactive-users', inactives);
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

        // const endpoints = endpointsModule.get_users_endpoints();
        let token = authModule.getUserToken();
        let url = api + endpoints.users.endpoint,
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
        let token = authModule.getUserToken();
        let url = api + endpoints.users.endpoint + '?id=' + id,
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

        let token = authModule.getUserToken();
        let url = api + endpoints.users.endpoint,
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

            } else if (response.status === 400) {

                response.json().then(function (json) {

                    let html = json.errors[0].message;
                    helperModule.renderError(html);
                    domModule.show('#user-form');

                    setTimeout(function () {
                        domModule.html('#message', null);
                    }, 3000);
                });
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

        domModule.hide('#user-update-form');
        domModule.html('#message', '<div class="alert alert-info">Updating User...</div>');

        let obj = getUserFormUpateData();
        let token = authModule.getUserToken();
        let url = api + endpoints.users.endpoint,
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
                    }, 3000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to update user.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Deletes user data
     */
    obj.deleteUser = function () {

        // const endpoints = endpointsModule.endpoints();
        let id = helperModule.getParameterByName('id');
        domModule.hide('#user-delete-form');
        domModule.html('#message', '<div class="alert alert-info">Deleting User...</div>');

        let token = authModule.getUserToken();
        let url = api + endpoints.users.endpoint + '?id=' + id,
            request = new Request(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 204) {

                domModule.html('#message', '<div class="alert alert-success">User deleted</div>');
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
                    }, 3000);
                });

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to delete user.');
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

    obj.init = function () {};

    return obj;

}());

userModule.init();