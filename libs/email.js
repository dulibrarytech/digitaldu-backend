'use strict';

// TODO: email user after import is complete
var nodemailer = require('nodemailer'),
    config = require('../config/config');

exports.sendEmail = function (paymentInfo) {

    var message = '',
        transporter,
        mailOptions;

    message += '========= GENERAL INFORMATION =========\r\n';
    message += 'Merchant : DU - LIBRARIES\r\n';
    message += 'Date/Time : ' + paymentInfo.date + '\r\n';
    message += '========= ORDER INFORMATION =========\r\n';
    message += 'Description : Fines & Fees\r\n';
    message += 'Amount : $' + paymentInfo.amount + '\r\n';
    message += 'Payment Method: ' + paymentInfo.account + '\r\n';
    message += 'Transaction ID: ' + paymentInfo.transid + '\r\n';
    message += '\r\n\r\n\r\nUniversity of Denver - University Libraries';

    transporter = nodemailer.createTransport('smtp://' + config.smtp);

    mailOptions = {
        from: config.fromEmail,
        to: paymentInfo.username + '@du.edu',
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