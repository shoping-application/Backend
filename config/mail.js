// services/emailService.js
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail
    pass: process.env.EMAIL_PASS,   // Gmail app password
  },
});

/**
 * Send email function
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body (html or text)
 */
async function sendEmail(to, subject, html) {
  try {
    let info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendEmail };
