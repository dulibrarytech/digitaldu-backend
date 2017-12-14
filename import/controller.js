'use strict';

var Model = require('../import/model');

exports.import = function (req, res) {

    Model.import(function (response) {

        console.log(response);
        /*
        if (response === 200) {
            res.sendStatus(response);
        } else {
            res.sendStatus(response);
        }
        */
    });
};