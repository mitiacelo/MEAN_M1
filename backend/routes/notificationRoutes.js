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

module.exports = router;