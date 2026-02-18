const express = require('express');
const router = express.Router();
const PriceProduct = require('../models/PriceProduct');

// POST – Ajouter un prix (historique)
router.post('/', async (req, res) => {
  try {
    const price = new PriceProduct(req.body);
    await price.save();
    res.status(201).json(price);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET – Historique des prix d’un produit
router.get('/product/:productId', async (req, res) => {
  try {
    const prices = await PriceProduct.find({ id_product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(prices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET – Prix actuel (le plus récent)
router.get('/current/:productId', async (req, res) => {
  try {
    const price = await PriceProduct.findOne({ id_product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(price || { prix: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;