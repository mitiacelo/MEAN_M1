const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} body - texte brut (fallback)
 * @param {string} html - HTML (optionnel, prioritaire sur body)
 * @param {string} signature
 * @param {Array}  attachments
 */
const sendEmail = async ({ to, subject, body, html, signature, attachments = [] }) => {
  const fullText = `${body}\n\n--\n${signature}`;
  const fullHtml = html || `<pre style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${fullText}</pre>`;

  await transporter.sendMail({
    from: `"Centre Commercial" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text: fullText,
    html: fullHtml,
    attachments
  });
};

module.exports = { sendEmail };