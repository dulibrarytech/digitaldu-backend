const homeModule = (function () {

    'use strict';

    // dependencies: userModule

    let obj = {};

    /**
     * Invokes desired functions on every page load
     */
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

homeModule.init();