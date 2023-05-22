const nodemailer = require('nodemailer');
require('dotenv').config();

const sendNotificationEmail = async (managerEmail, technicianName, taskSummary) => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

    const message = {
      from: testAccount.user,
      to: managerEmail,
      subject: 'Task Notification',
      text: `Technician ${technicianName} has performed a task with the following summary: ${taskSummary}.`,
    };
    const info = await transporter.sendMail(message);
    console.log('Email notification sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};

module.exports = sendNotificationEmail;
