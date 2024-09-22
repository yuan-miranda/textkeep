// config/email.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    port: 587,
    secure: false,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
    },
});

module.exports = transporter;