const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// POST /notifications → créer une demande de visite
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /notifications → toutes les notifications (admin)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user', 'name firstname email')
      .populate('shop', 'name')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /notifications/:id/status → changer le statut
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification non trouvée' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /notifications/exists
router.get('/exists', async (req, res) => {
  const { user, shop } = req.query;
  if (!user || !shop) {
    return res.status(400).json({ message: 'Paramètres user et shop requis' });
  }
  try {
    const exists = await Notification.exists({
      user,
      shop,
      status: { $in: ['pending', 'processed'] }
    });
    res.json(!!exists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;