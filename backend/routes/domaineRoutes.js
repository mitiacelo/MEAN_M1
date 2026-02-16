// backend/routes/domaineRoutes.js (exemple pour Domaine)
const express = require('express');
const router = express.Router();
const Domaine = require('../models/Domaine');

router.get('/', async (req, res) => {
  try {
    const domaines = await Domaine.find();
    res.json(domaines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;