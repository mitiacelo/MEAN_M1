// backend/routes/domaineRoutes.js (exemple pour Domaine)
const express = require('express');
const router = express.Router();
const Domaine = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;