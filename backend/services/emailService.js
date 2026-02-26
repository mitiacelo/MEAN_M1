const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,     // ex: moncentre@gmail.com
    pass: process.env.MAIL_PASSWORD  // mot de passe d'application Gmail (pas votre vrai mdp)
  }
});

/**
 * Envoie un email depuis le compte Gmail du centre
 * @param {string} to - email du destinataire
 * @param {string} subject - objet de l'email
 * @param {string} body - corps du message (texte brut)
 * @param {string} signature - signature de l'admin (ex: "Jean Dupont - Admin")
 */
const sendEmail = async ({ to, subject, body, signature }) => {
  const fullBody = `${body}\n\n--\n${signature}`;

  await transporter.sendMail({
    from: `"Centre Commercial" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text: fullBody,
    html: `<pre style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${fullBody}</pre>`
  });
};

module.exports = { sendEmail };