const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTrainingNotification(to, subject, text, attachment = null) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: attachment ? [attachment] : [],
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendTrainingNotification };