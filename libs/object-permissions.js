'use strict';

var config = require('../config/config');

exports.check_access = function (permissions) {

    // console.log(permissions);

    var resources = [];

    for (var i=0;i<permissions.length;i++) {
        // console.log(permissions[i].resources);
        resources.push(permissions[i].resources);
    }

    // console.log(resources);
    return resources;
};