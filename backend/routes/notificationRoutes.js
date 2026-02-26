const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// POST /notifications → créer une demande de location
router.post('/', async (req, res) => {
  try {
    const request = new RentalRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /notifications → toutes les demandes (admin)
router.get('/', async (req, res) => {
  try {
    const requests = await RentalRequest.find()
      .populate('user', 'name firstname email')
      .populate('shop', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /notifications/exists
router.get('/exists', async (req, res) => {
  const { user, shop } = req.query;
  if (!user || !shop) {
    return res.status(400).json({ message: 'Paramètres user et shop requis' });
  }
  try {
    const exists = await RentalRequest.exists({
      user,
      shop,
      status: { $in: ['nouveau', 'contacté'] }
    });
    res.json(!!exists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /notifications/:id/status → changer le statut manuellement
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RentalRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /notifications/:id/send-email → envoyer un email au demandeur
// Body attendu : { subject, body, adminName, adminEmail }
router.post('/:id/send-email', async (req, res) => {
  try {
    const { subject, body, adminName, adminEmail } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ message: 'Objet et corps du message requis' });
    }

    const request = await RentalRequest.findById(req.params.id).populate('shop', 'name');
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });

    const signature = `${adminName}\n${adminEmail}\nCentre Commercial`;

    // Envoi de l'email
    await sendEmail({
      to: request.email,
      subject,
      body,
      signature
    });

    // Sauvegarde dans l'historique + passage en statut "contacté"
    request.emailsSent.push({
      subject,
      body,
      sentBy: `${adminName} <${adminEmail}>`
    });
    request.status = 'contacté';
    await request.save();

    res.json({ message: 'Email envoyé avec succès', request });
  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.status(500).json({ message: "Échec de l'envoi : " + err.message });
  }
});

module.exports = router;