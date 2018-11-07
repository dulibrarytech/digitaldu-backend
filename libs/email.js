'use strict';

// TODO: email user after import is complete
var nodemailer = require('nodemailer'),
    config = require('../config/config');

exports.sendEmail = function (user) {

    var message = '',
        transporter,
        mailOptions;

    transporter = nodemailer.createTransport('smtp://' + config.smtp);

    mailOptions = {
        from: config.fromEmail,
        to: user + '@du.edu', // TODO
        subject: config.emailSubject,
        text: message
    };

    transporter.sendMail(mailOptions, function (err, info) {

        if (err) {
            console.log(err);
        }

        console.log('Message sent: ' + info.response);
    });
};