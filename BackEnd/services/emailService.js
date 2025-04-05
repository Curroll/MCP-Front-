import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    logger.error('Email transporter verification failed:', error);
  } else {
    logger.info('✅ Email server is ready to take our messages');
  }
});

export const sendEmail = async ({ email, subject, template, context }) => {
  try {
    // In a real app, you would use a template engine like pug or handlebars
    let html;
    let text;
    
    if (template === 'welcome') {
      html = `<h1>Welcome ${context.name}!</h1>
              <p>Your ${context.role} account has been successfully created.</p>`;
      text = `Welcome ${context.name}! Your ${context.role} account has been created.`;
    } else if (template === 'passwordReset') {
      html = `<h1>Password Reset</h1>
              <p>Click <a href="${context.resetURL}">here</a> to reset your password.</p>`;
      text = `Password Reset: Visit ${context.resetURL} to reset your password.`;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${email}`);
    
  } catch (error) {
    logger.error('Email sending error:', error);
    throw new Error('There was an error sending the email. Try again later.');
  }
};