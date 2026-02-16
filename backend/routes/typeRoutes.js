// backend/routes/domaineRoutes.js (exemple pour Domaine)
const express = require('express');
const router = express.Router();
const Domaine = require('../models/Type');

router.get('/', async (req, res) => {
  try {
    const types = await Type.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;