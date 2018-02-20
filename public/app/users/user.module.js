var userModule = (function () {

    'use strict';

    var obj = {};
    var api = configModule.getApi();
    var renderError = function () {
        $('#home').html('Error: Unable to retrieve home dashboard data');
    };

    obj.checkUserData = function () {
        var data = window.sessionStorage.getItem('repo_data');

        if (data !== null) {
            return true;
        }
    };

    obj.renderUserName = function () {
        var data = JSON.parse(window.sessionStorage.getItem('repo_data'));
        $('#username').html(data.uid);
    };

    obj.init = function () {
        obj.renderUserName();
    };

    return obj;

}());