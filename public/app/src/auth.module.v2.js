/**

 Copyright 2024 University of Denver

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

const authModule = (function () {

    'use strict';

    const api = configModule.getApi();
    const init_endpoints = '';
    let obj = {};

    /**
     * Gets token from session storage
     * @returns {*|Color}
     */
    obj.getUserToken = function () {

        let data = JSON.parse(window.sessionStorage.getItem('repo_token'));

        if (data !== null && data.token === null) {

            setTimeout(function () {
                window.location.replace('/repo');
            }, 0);

        } else if (data === null) {
            window.location.replace('/repo');
        } else {
            return DOMPurify.sanitize(data.token);
        }
    };

    /**
     * Refresh access token
     */
    obj.refresh_token = function () {

        const user = JSON.parse(window.sessionStorage.getItem('repo_user'));
        const token = window.sessionStorage.getItem('repo_refresh_token');

        let url = api + '/repo/token?id=' + user.uid,
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                response.json().then(function (data) {
                    window.sessionStorage.setItem('repo_token', JSON.stringify(data));
                    location.reload();
                });

                return false;

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + ').  Unable to refresh token.');
            }
        };

        httpModule.req(request, callback);
    };

    /**
     * Destroys session data and redirects user to login
     */
    obj.sessionExpired = function () {
        window.sessionStorage.removeItem('repo_user');
        obj.reset();

        setTimeout(function () {
            window.location.replace('/repo');
        }, 500);
    };

    /**
     * Clears out session storage - used when user logs out
     */
    obj.reset = function () {
        window.sessionStorage.clear();
        window.localStorage.clear();
    };

    obj.init = function () {};

    return obj;

}());
