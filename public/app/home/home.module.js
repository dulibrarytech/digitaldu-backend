var homeModule = (function () {

    'use strict';

    var obj = {};
    var api = configModule.getApi();
    var renderError = function () {
        $('#message').html('Error: Unable to retrieve username');
    };

    obj.init = function () {

        if (!userModule.checkUserData()) {
            userModule.getAuthUserData();
        } else {
            userModule.renderUserName();
        }

        // TODO: rewrite URL. remove token and uid from url
    };

    return obj;

}());
