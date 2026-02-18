const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// POST /api/notifications → créer une demande de visite
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/exists', async (req, res) => {
    const { user, shop } = req.query;
  
    if (!user || !shop) {
      return res.status(400).json({ message: 'Paramètres user et shop requis' });
    }
  
    try {
      const exists = await Notification.exists({
        user,
        shop,
        status: { $in: ['pending', 'processed'] } // ou seulement 'pending' si tu veux
      });
  
      res.json(!!exists); // true/false
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;