var homeModule = (function () {

    'use strict';

    var obj = {};
    var api = configModule.getApi();
    var renderError = function () {
        $('#user').html('Error: Unable to retrieve username');
    };

    var saveToken = function () {

        var token = helperModule.getParameterByName('t'),
            uid = helperModule.getParameterByName('uid');

        if (token !== null) {
            var data = {
                token: token,
                uid: uid
            };

            window.sessionStorage.setItem('repo_data', JSON.stringify(data));

        } else {
            window.location.href = '/login';
        }
    };

    obj.init = function () {

        if (!userModule.checkUserData()) {
            saveToken();
        }

        userModule.renderUserName();
    };

    return obj;

}());