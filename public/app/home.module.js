const homeModule = (function () {

    'use strict';

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

        history.replaceState({}, '', '/dashboard/home');
        helperModule.ping();
    };

    return obj;

}());

homeModule.init();